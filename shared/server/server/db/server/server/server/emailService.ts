import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY environment variable not set - email functionality disabled");
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("Email would be sent:", params.subject);
    return true; // Return success for development
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendBookingNotification(booking: any): Promise<boolean> {
  const emailParams = {
    to: booking.email || 'admin@kwakhanyadrivers.co.za',
    from: 'noreply@kwakhanyadrivers.co.za',
    subject: `Booking Confirmation - ${booking.invoiceNumber}`,
    text: `Your driving lesson booking has been confirmed. Booking ID: ${booking.id}`,
    html: `
      <h2>Booking Confirmation</h2>
      <p>Your driving lesson booking has been confirmed.</p>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Invoice Number:</strong> ${booking.invoiceNumber}</p>
      <p><strong>Total Amount:</strong> R${booking.totalAmount}</p>
    `,
  };

  return await sendEmail(emailParams);
}

export async function sendSchoolRegistrationNotification(school: any): Promise<boolean> {
  const emailParams = {
    to: 'admin@kwakhanyadrivers.co.za',
    from: 'noreply@kwakhanyadrivers.co.za',
    subject: `New School Registration - ${school.name}`,
    text: `A new driving school has registered: ${school.name}`,
    html: `
      <h2>New School Registration</h2>
      <p><strong>School Name:</strong> ${school.name}</p>
      <p><strong>Contact Person:</strong> ${school.contactPerson}</p>
      <p><strong>City:</strong> ${school.city}</p>
    `,
  };

  return await sendEmail(emailParams);
}

export async function sendPaymentNotification(booking: any): Promise<boolean> {
  const emailParams = {
    to: booking.email || 'admin@kwakhanyadrivers.co.za',
    from: 'noreply@kwakhanyadrivers.co.za',
    subject: `Payment Confirmation - ${booking.invoiceNumber}`,
    text: `Payment received for booking ${booking.id}`,
    html: `
      <h2>Payment Confirmation</h2>
      <p>Payment has been received for your booking.</p>
      <p><strong>Booking ID:</strong> ${booking.id}</p>
      <p><strong>Amount Paid:</strong> R${booking.totalAmount}</p>
    `,
  };

  return await sendEmail(emailParams);
}
