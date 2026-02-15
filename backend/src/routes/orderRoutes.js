const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, updatePaymentStatus, getUserOrders } = require('../controllers/orderController');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - customer
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     qty:
 *                       type: number
 *               customer:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   pincode:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [COD, QR, RAZORPAY]
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/', createOrder);

/**
 * @swagger
 * /api/orders/user:
 *   get:
 *     summary: Get user orders by email or phone
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Customer email
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         description: Customer phone number
 *     responses:
 *       200:
 *         description: List of user orders
 *       400:
 *         description: Email or phone is required
 */
router.get('/user', getUserOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */
router.get('/:id', getOrderById);

/**
 * @swagger
 * /api/orders/{orderId}/payment-status:
 *   patch:
 *     summary: Update payment status (for "I Paid" button)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentStatus:
 *                 type: string
 *                 enum: [Unpaid, PendingVerification, Paid]
 *     responses:
 *       200:
 *         description: Payment status updated
 *       404:
 *         description: Order not found
 */
router.patch('/:orderId/payment-status', updatePaymentStatus);

module.exports = router;
