const nodemailer = require('nodemailer');

// For development, we'll just log the emails instead of sending them
const sendBookingConfirmation = async (booking) => {
    const emailContent = {
        to: booking.guestEmail,
        subject: 'Hotel Booking Confirmation',
        html: `
            <h1>Booking Confirmation</h1>
            <p>Dear ${booking.guestName},</p>
            <p>Your booking has been confirmed. Here are the details:</p>
            <ul>
                <li>Check-in: ${new Date(booking.checkIn).toLocaleDateString()}</li>
                <li>Check-out: ${new Date(booking.checkOut).toLocaleDateString()}</li>
                <li>Number of Guests: ${booking.numberOfGuests}</li>
                <li>Total Price: $${booking.totalPrice}</li>
            </ul>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Thank you for choosing our hotel!</p>
        `
    };

    // Log the email content for development
    console.log('\n=== Booking Confirmation Email ===');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Content:', emailContent.html);
    console.log('===============================\n');

    return { messageId: 'dev-mode-' + Date.now() };
};

const sendBookingRejection = async (booking, reason) => {
    const emailContent = {
        to: booking.guestEmail,
        subject: 'Hotel Booking Update',
        html: `
            <h1>Booking Update</h1>
            <p>Dear ${booking.guestName},</p>
            <p>Unfortunately, we are unable to confirm your booking for the following reason:</p>
            <p>${reason}</p>
            <p>Please try booking for different dates or contact us directly for assistance.</p>
            <p>We apologize for any inconvenience caused.</p>
        `
    };

    // Log the email content for development
    console.log('\n=== Booking Rejection Email ===');
    console.log('To:', emailContent.to);
    console.log('Subject:', emailContent.subject);
    console.log('Content:', emailContent.html);
    console.log('===============================\n');

    return { messageId: 'dev-mode-' + Date.now() };
};

module.exports = {
    sendBookingConfirmation,
    sendBookingRejection
};
