export const generateUPIString = (orderId, amount) => {
    const upiId = import.meta.env.VITE_UPI_ID;
    const businessName = import.meta.env.VITE_BUSINESS_NAME;

    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=Order_${orderId}`;
};
