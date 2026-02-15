const Order = require('../models/Order');
const Product = require('../models/Product');
const { sequelize } = require('../config/database');

// Create new order
const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { items, customer, paymentMethod } = req.body;

        // Validate items
        if (!items || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Order must contain at least one item'
            });
        }

        // Validate customer details
        if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.pincode || !customer.email) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'All customer details are required (Name, Email, Phone, Address, City, Pincode)'
            });
        }

        // Validate payment method
        if (!['COD', 'QR', 'RAZORPAY'].includes(paymentMethod)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        // Verify stock availability and calculate total
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });

            if (!product) {
                await transaction.rollback();
                return res.status(404).json({
                    success: false,
                    message: `Product ${item.productId} not found`
                });
            }

            if (!product.isActive) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Product ${product.name} is not available`
                });
            }

            if (product.stockQty < item.qty) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.stockQty}`
                });
            }

            orderItems.push({
                productId: product.id,
                name: product.name,
                price: parseFloat(product.price),
                qty: item.qty
            });

            subtotal += parseFloat(product.price) * item.qty;

            // Reduce stock
            product.stockQty -= item.qty;
            await product.save({ transaction });
        }

        // Add delivery charge
        const deliveryCharge = parseFloat(process.env.DELIVERY_CHARGE) || 50;
        const totalAmount = subtotal + deliveryCharge;

        // Set payment status based on method
        let paymentStatus = 'Unpaid';
        if (paymentMethod === 'COD') {
            paymentStatus = 'Unpaid';
        } else if (paymentMethod === 'QR') {
            paymentStatus = 'Unpaid';
        }

        // Create order
        const order = await Order.create({
            items: orderItems,
            customer,
            totalAmount,
            paymentMethod,
            paymentStatus,
            orderStatus: 'Pending'
        }, { transaction });

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// Update payment status (for "I Paid" button)
const updatePaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { paymentStatus } = req.body;

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        res.json({
            success: true,
            message: 'Payment status updated',
            data: order
        });
    } catch (error) {
        console.error('Update payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payment status',
            error: error.message
        });
    }
};

// Get user orders by email or phone
const getUserOrders = async (req, res) => {
    try {
        const { email, phone } = req.query;

        if (!email && !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email or phone number is required'
            });
        }

        // Build query to find orders by customer email or phone
        const { Op } = require('sequelize');
        const whereConditions = [];

        if (email) {
            whereConditions.push({
                'customer.email': email
            });
        }

        if (phone) {
            whereConditions.push({
                'customer.phone': phone
            });
        }

        const orders = await Order.findAll({
            where: {
                [Op.or]: whereConditions.map(condition =>
                    sequelize.where(
                        sequelize.cast(sequelize.col('customer'), 'text'),
                        {
                            [Op.like]: `%${Object.values(condition)[0]}%`
                        }
                    )
                )
            },
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrderById,
    updatePaymentStatus,
    getUserOrders
};
