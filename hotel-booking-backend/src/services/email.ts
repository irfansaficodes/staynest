import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM = process.env.SMTP_FROM_EMAIL || `"StayNest" <${process.env.SMTP_USER}>`;

export const sendVerificationEmail = async (to: string, code: string) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: "Verify your StayNest account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1A9E8F, #128075); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">StayNest</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Your Hotel Booking Platform</p>
        </div>
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px; text-align: center;">
          <h2 style="color: #333; margin: 0 0 20px;">Verify Your Email</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Use the code below to verify your StayNest account:
          </p>
          <div style="background: white; border: 2px dashed #1A9E8F; border-radius: 12px; padding: 20px; margin: 30px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #1A9E8F; letter-spacing: 8px;">${code}</span>
          </div>
          <p style="color: #999; font-size: 14px;">
            This code expires in 10 minutes. If you didn't create an account, ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} StayNest. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

export const sendBookingConfirmationEmail = async (
  to: string,
  booking: {
    id: string;
    hotelName: string;
    checkIn: string;
    checkOut: string;
    totalCost: number;
    guestName: string;
  }
) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Booking Confirmed - ${booking.hotelName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1A9E8F, #128075); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
        </div>
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px;">Dear ${booking.guestName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your booking has been confirmed. Here are your details:
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #999;">Booking ID</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${booking.id}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Hotel</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${booking.hotelName}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Check-in</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${booking.checkIn}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Check-out</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${booking.checkOut}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Total Paid</td><td style="padding: 8px 0; font-weight: bold; color: #1A9E8F; font-size: 18px;">₹${booking.totalCost.toLocaleString()}</td></tr>
            </table>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours before check-in.
            After that, 50% refund applies. No refund for no-shows.
          </p>
          <p style="color: #333; font-size: 16px; margin-top: 30px;">
            We wish you a pleasant stay!
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} StayNest. All rights reserved.</p>
        </div>
      </div>
    `,
  });
};

export const sendCancellationConfirmationEmail = async (
  to: string,
  booking: {
    id: string;
    hotelName: string;
    refundAmount: number;
  }
) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `Booking Cancelled - ${booking.hotelName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Booking Cancelled</h1>
        </div>
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Your booking has been cancelled successfully.
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #999;">Booking ID</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${booking.id}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Hotel</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${booking.hotelName}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Refund Amount</td><td style="padding: 8px 0; font-weight: bold; color: #1A9E8F; font-size: 18px;">₹${booking.refundAmount.toLocaleString()}</td></tr>
            </table>
          </div>
          <p style="color: #666; font-size: 14px;">
            Refund will be processed within 5-7 business days.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendOwnerBookingNotificationEmail = (
  to: string,
  ownerName: string,
  hotelName: string,
  guestName: string,
  checkIn: string,
  checkOut: string,
  totalCost: number,
  bookingId: string,
  adultCount: number,
  childCount: number
) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: `New Booking at ${hotelName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1A9E8F, #128075); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Booking!</h1>
        </div>
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px;">Dear ${ownerName},</p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            You have a new booking at ${hotelName}.
          </p>
          <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #999;">Booking ID</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${bookingId}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Guest</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${guestName}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Check-in</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${new Date(checkIn).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Check-out</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${new Date(checkOut).toLocaleDateString()}</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Guests</td><td style="padding: 8px 0; font-weight: bold; color: #333;">${adultCount} Adults, ${childCount} Children</td></tr>
              <tr><td style="padding: 8px 0; color: #999;">Revenue</td><td style="padding: 8px 0; font-weight: bold; color: #1A9E8F; font-size: 18px;">₹${totalCost.toLocaleString()}</td></tr>
            </table>
          </div>
        </div>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (to: string, firstName: string) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: "Welcome to StayNest!",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;"><div style="background: linear-gradient(135deg, #1A9E8F, #128075); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px;">Welcome to StayNest!</h1></div><div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px;"><p style="color: #333; font-size: 16px;">Dear ${firstName},</p><p style="color: #666; font-size: 16px; line-height: 1.6;">Welcome to StayNest! Discover amazing hotels and book your next adventure.</p></div></div>`,
  });
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  return transporter.sendMail({
    from: FROM,
    to,
    subject: "Reset your StayNest password",
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;"><div style="background: linear-gradient(135deg, #1A9E8F, #128075); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;"><h1 style="color: white; margin: 0; font-size: 28px;">Reset Password</h1></div><div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px; text-align: center;"><p style="color: #333;">Click to reset:</p><a href="${resetUrl}" style="display: inline-block; background: #1A9E8F; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 20px 0;">Reset Password</a></div></div>`,
  });
};
