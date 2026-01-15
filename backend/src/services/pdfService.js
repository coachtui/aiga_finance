const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

class PDFService {
  /**
   * Generate invoice PDF
   * Note: This is a placeholder implementation
   * Phase 3 will implement full PDF generation with templates
   */
  static async generateInvoicePDF(invoice, client, items, user) {
    try {
      logger.info(`Generating PDF for invoice ${invoice.invoice_number}`);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Collect PDF data
      const chunks = [];
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      // Add header
      doc.fontSize(20).text('INVOICE', { align: 'center' });
      doc.fontSize(10);

      // Company info (placeholder)
      doc.text(`${user.firstName || 'Your'} ${user.lastName || 'Company'}`, 50, 100);
      doc.text('123 Business Street', 50, 115);
      doc.text('City, State 12345', 50, 130);

      doc.moveTo(50, 150).lineTo(550, 150).stroke();

      // Invoice details
      doc.fontSize(10);
      doc.text(`Invoice #: ${invoice.invoice_number}`, 50, 170);
      doc.text(`Date: ${invoice.issue_date}`, 50, 185);
      doc.text(`Due: ${invoice.due_date}`, 50, 200);

      // Client info
      doc.fontSize(12).text('Bill To:', 50, 230);
      doc.fontSize(10);
      doc.text(client?.company_name || 'Client Name', 50, 250);
      if (client?.contact_name) {
        doc.text(client.contact_name, 50, 265);
      }
      if (client?.contact_email) {
        doc.text(client.contact_email, 50, 280);
      }

      // Items table header
      doc.fontSize(10);
      doc.moveTo(50, 320).lineTo(550, 320).stroke();
      doc.text('Description', 50, 330);
      doc.text('Qty', 350, 330);
      doc.text('Unit Price', 400, 330);
      doc.text('Amount', 480, 330);
      doc.moveTo(50, 345).lineTo(550, 345).stroke();

      // Items
      let yPosition = 360;
      items?.forEach((item) => {
        doc.text(item.description, 50, yPosition);
        doc.text(item.quantity, 350, yPosition);
        doc.text(`$${parseFloat(item.unit_price).toFixed(2)}`, 400, yPosition);
        doc.text(`$${(item.quantity * item.unit_price).toFixed(2)}`, 480, yPosition);
        yPosition += 20;
      });

      // Totals
      doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
      yPosition += 15;

      doc.fontSize(11).text('Subtotal:', 400, yPosition);
      doc.text(`$${parseFloat(invoice.subtotal || 0).toFixed(2)}`, 480, yPosition);

      yPosition += 20;
      if (invoice.tax_amount && parseFloat(invoice.tax_amount) > 0) {
        doc.text('Tax:', 400, yPosition);
        doc.text(`$${parseFloat(invoice.tax_amount).toFixed(2)}`, 480, yPosition);
        yPosition += 20;
      }

      if (invoice.discount_amount && parseFloat(invoice.discount_amount) > 0) {
        doc.text('Discount:', 400, yPosition);
        doc.text(`$${parseFloat(invoice.discount_amount).toFixed(2)}`, 480, yPosition);
        yPosition += 20;
      }

      doc.fontSize(12);
      doc.moveTo(400, yPosition - 5).lineTo(550, yPosition - 5).stroke();
      doc.text('TOTAL:', 400, yPosition);
      doc.text(`$${parseFloat(invoice.total_amount || 0).toFixed(2)}`, 480, yPosition);

      // Footer
      yPosition += 40;
      doc.fontSize(9);
      if (invoice.notes) {
        doc.text('Notes:', 50, yPosition);
        doc.text(invoice.notes, 50, yPosition + 15);
      }

      // Complete the PDF
      doc.end();

      return new Promise((resolve, reject) => {
        doc.on('finish', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);
      });
    } catch (error) {
      logger.error('Error in generateInvoicePDF:', error);
      throw error;
    }
  }

  /**
   * Upload PDF to storage (S3 or local)
   * Placeholder - will be implemented in Phase 3
   */
  static async uploadPDFToStorage(buffer, invoicePath) {
    try {
      logger.info(`Uploading PDF to storage: ${invoicePath}`);
      // Phase 3: Implement S3/local storage upload
      return invoicePath;
    } catch (error) {
      logger.error('Error in uploadPDFToStorage:', error);
      throw error;
    }
  }
}

module.exports = PDFService;
