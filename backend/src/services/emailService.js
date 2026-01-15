const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  /**
   * Initialize email transporter
   */
  static getTransporter() {
    const emailService = process.env.EMAIL_SERVICE || 'sendgrid';

    if (emailService === 'sendgrid') {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      });
    } else if (emailService === 'ses') {
      // AWS SES configuration - requires aws-sdk setup
      const AWS = require('aws-sdk');
      return nodemailer.createTransport({
        SES: new AWS.SES({
          region: process.env.AWS_SES_REGION || 'us-east-1',
        }),
      });
    } else {
      // Generic SMTP fallback
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  /**
   * Send invoice email with PDF
   */
  static async sendInvoiceEmail(invoice, client, pdfBuffer, user) {
    try {
      logger.info(`Sending invoice ${invoice.invoice_number} to ${client?.contact_email}`);

      const transporter = this.getTransporter();
      const emailFrom = process.env.EMAIL_FROM || 'noreply@aiga.com';
      const emailFromName = process.env.EMAIL_FROM_NAME || 'AIGA Finance';

      const html = this.getInvoiceEmailTemplate(invoice, client, user);

      const mailOptions = {
        from: `${emailFromName} <${emailFrom}>`,
        to: client?.contact_email,
        subject: `Invoice ${invoice.invoice_number} from ${emailFromName}`,
        html,
        attachments: [
          {
            filename: `${invoice.invoice_number}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info(`Invoice email sent: ${result.messageId}`);

      return {
        sent: true,
        to: client?.contact_email,
        invoice_number: invoice.invoice_number,
        message_id: result.messageId,
      };
    } catch (error) {
      logger.error('Error in sendInvoiceEmail:', error);
      throw error;
    }
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(invoice, client, payment) {
    try {
      logger.info(`Sending payment confirmation for invoice ${invoice.invoice_number}`);

      const transporter = this.getTransporter();
      const emailFrom = process.env.EMAIL_FROM || 'noreply@aiga.com';
      const emailFromName = process.env.EMAIL_FROM_NAME || 'AIGA Finance';

      const html = this.getPaymentConfirmationTemplate(invoice, client, payment);

      const mailOptions = {
        from: `${emailFromName} <${emailFrom}>`,
        to: client?.contact_email,
        subject: `Payment Received for Invoice ${invoice.invoice_number}`,
        html,
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info(`Payment confirmation email sent: ${result.messageId}`);

      return {
        sent: true,
        to: client?.contact_email,
        invoice_number: invoice.invoice_number,
        message_id: result.messageId,
      };
    } catch (error) {
      logger.error('Error in sendPaymentConfirmation:', error);
      throw error;
    }
  }

  /**
   * Send payment reminder email
   */
  static async sendPaymentReminder(invoice, client) {
    try {
      logger.info(`Sending payment reminder for invoice ${invoice.invoice_number}`);

      const transporter = this.getTransporter();
      const emailFrom = process.env.EMAIL_FROM || 'noreply@aiga.com';
      const emailFromName = process.env.EMAIL_FROM_NAME || 'AIGA Finance';

      const html = this.getPaymentReminderTemplate(invoice, client);

      const mailOptions = {
        from: `${emailFromName} <${emailFrom}>`,
        to: client?.contact_email,
        subject: `Payment Reminder: Invoice ${invoice.invoice_number} Due on ${invoice.due_date}`,
        html,
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info(`Payment reminder email sent: ${result.messageId}`);

      return {
        sent: true,
        to: client?.contact_email,
        invoice_number: invoice.invoice_number,
        message_id: result.messageId,
      };
    } catch (error) {
      logger.error('Error in sendPaymentReminder:', error);
      throw error;
    }
  }

  /**
   * Send contract expiring notification
   */
  static async sendContractExpiring(contract, client) {
    try {
      logger.info(`Sending contract expiring notification for ${contract.contract_number}`);

      const transporter = this.getTransporter();
      const emailFrom = process.env.EMAIL_FROM || 'noreply@aiga.com';
      const emailFromName = process.env.EMAIL_FROM_NAME || 'AIGA Finance';

      const html = this.getContractExpiringTemplate(contract, client);

      const mailOptions = {
        from: `${emailFromName} <${emailFrom}>`,
        to: client?.contact_email,
        subject: `Contract ${contract.contract_number} Expiring Soon`,
        html,
      };

      const result = await transporter.sendMail(mailOptions);

      logger.info(`Contract expiring email sent: ${result.messageId}`);

      return {
        sent: true,
        to: client?.contact_email,
        contract_number: contract.contract_number,
        message_id: result.messageId,
      };
    } catch (error) {
      logger.error('Error in sendContractExpiring:', error);
      throw error;
    }
  }

  /**
   * HTML template for invoice email
   */
  static getInvoiceEmailTemplate(invoice, client, user) {
    const companyName = process.env.COMPANY_NAME || 'AIGA Finance';
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .invoice-details { margin: 20px 0; }
            .invoice-details p { margin: 5px 0; }
            .button { display: inline-block; background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Invoice #${invoice.invoice_number}</h1>
            </div>
            <div class="content">
              <p>Hello ${client?.contact_name || 'Valued Client'},</p>
              <p>We've attached your invoice for services provided. Please review the details below:</p>

              <div class="invoice-details">
                <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
                <p><strong>Invoice Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString('en-US')}</p>
                <p><strong>Due Date:</strong> ${dueDate}</p>
                <p><strong>Amount Due:</strong> $${parseFloat(invoice.total_amount || 0).toFixed(2)}</p>
              </div>

              <p>Please find your invoice attached to this email. If you have any questions, please don't hesitate to contact us.</p>

              <p>Thank you for your business!</p>
              <p>Best regards,<br>${companyName}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * HTML template for payment confirmation email
   */
  static getPaymentConfirmationTemplate(invoice, client, payment) {
    const companyName = process.env.COMPANY_NAME || 'AIGA Finance';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .details { margin: 20px 0; background-color: #f5f5f5; padding: 15px; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Received</h1>
            </div>
            <div class="content">
              <p>Hello ${client?.contact_name || 'Valued Client'},</p>
              <p>Thank you! We have received your payment. Here are the details:</p>

              <div class="details">
                <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
                <p><strong>Payment Amount:</strong> $${parseFloat(payment.amount).toFixed(2)}</p>
                <p><strong>Payment Date:</strong> ${new Date(payment.payment_date).toLocaleDateString('en-US')}</p>
                <p><strong>Reference Number:</strong> ${payment.reference_number || 'N/A'}</p>
              </div>

              <p>Your payment has been processed successfully. Thank you for your prompt payment.</p>
              <p>Best regards,<br>${companyName}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * HTML template for payment reminder email
   */
  static getPaymentReminderTemplate(invoice, client) {
    const companyName = process.env.COMPANY_NAME || 'AIGA Finance';
    const dueDate = new Date(invoice.due_date).toLocaleDateString('en-US');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Reminder</h1>
            </div>
            <div class="content">
              <p>Hello ${client?.contact_name || 'Valued Client'},</p>

              <div class="alert">
                <strong>This is a reminder that your payment is due:</strong>
              </div>

              <p><strong>Invoice Number:</strong> ${invoice.invoice_number}</p>
              <p><strong>Amount Due:</strong> $${parseFloat(invoice.balance_due || invoice.total_amount).toFixed(2)}</p>
              <p><strong>Due Date:</strong> ${dueDate}</p>

              <p>Please arrange payment at your earliest convenience. If you have already sent your payment, please disregard this reminder.</p>
              <p>If you have any questions about this invoice, please contact us.</p>
              <p>Thank you,<br>${companyName}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * HTML template for contract expiring email
   */
  static getContractExpiringTemplate(contract, client) {
    const companyName = process.env.COMPANY_NAME || 'AIGA Finance';
    const expiringDate = new Date(contract.end_date).toLocaleDateString('en-US');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; border: 1px solid #ddd; }
            .alert { background-color: #ffebee; border: 1px solid #ef5350; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Contract Renewal Notice</h1>
            </div>
            <div class="content">
              <p>Hello ${client?.contact_name || 'Valued Client'},</p>

              <div class="alert">
                <strong>Your contract is expiring soon. Please review and take action if renewal is needed.</strong>
              </div>

              <p><strong>Contract Number:</strong> ${contract.contract_number}</p>
              <p><strong>Contract Title:</strong> ${contract.title}</p>
              <p><strong>Expiration Date:</strong> ${expiringDate}</p>

              <p>Please contact us if you would like to renew this contract or discuss any modifications.</p>
              <p>Thank you for your business,<br>${companyName}</p>
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = EmailService;
