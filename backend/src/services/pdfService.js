const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

class PDFService {
  /**
   * Generate professional invoice PDF
   */
  static async generateInvoicePDF(invoice, client, items, user) {
    try {
      logger.info(`Generating PDF for invoice ${invoice.invoice_number}`);

      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      // Collect PDF data
      const chunks = [];
      doc.on('data', (chunk) => {
        chunks.push(chunk);
      });

      const companyName = process.env.COMPANY_NAME || `${user.first_name || 'Your'} ${user.last_name || 'Company'}`;
      const companyAddress = process.env.COMPANY_ADDRESS || '123 Business Street, City, State 12345';

      // Header section
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', 40, 50);

      // Company info
      doc.fontSize(10).font('Helvetica').text(companyName, 40, 90);
      doc.fontSize(9).text(companyAddress, 40, 105);
      if (process.env.COMPANY_PHONE) {
        doc.text(`Phone: ${process.env.COMPANY_PHONE}`, 40, 118);
      }
      if (process.env.COMPANY_EMAIL) {
        doc.text(`Email: ${process.env.COMPANY_EMAIL}`, 40, 131);
      }

      // Divider line
      doc.moveTo(40, 150).lineTo(555, 150).stroke();

      // Invoice details (left side)
      doc.fontSize(10).font('Helvetica-Bold').text('Invoice Details', 40, 170);
      doc.fontSize(9).font('Helvetica');
      doc.text(`Invoice #: ${invoice.invoice_number}`, 40, 190);
      doc.text(`Issue Date: ${this.formatDate(invoice.issue_date)}`, 40, 205);
      doc.text(`Due Date: ${this.formatDate(invoice.due_date)}`, 40, 220);
      doc.text(`Status: ${this.formatStatus(invoice.status)}`, 40, 235);

      // Bill To (right side)
      doc.fontSize(10).font('Helvetica-Bold').text('Bill To:', 350, 170);
      doc.fontSize(9).font('Helvetica');
      doc.text(client?.company_name || 'Client', 350, 190);
      if (client?.contact_name) {
        doc.text(client.contact_name, 350, 205);
      }
      if (client?.contact_email) {
        doc.text(client.contact_email, 350, 220);
      }
      if (client?.contact_phone) {
        doc.text(client.contact_phone, 350, 235);
      }

      // Line items table
      let yPosition = 280;

      // Table header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Description', 40, yPosition);
      doc.text('Qty', 330, yPosition, { width: 50, align: 'right' });
      doc.text('Unit Price', 380, yPosition, { width: 70, align: 'right' });
      doc.text('Amount', 450, yPosition, { width: 105, align: 'right' });

      yPosition += 20;
      doc.moveTo(40, yPosition).lineTo(555, yPosition).stroke();

      // Table rows
      yPosition += 15;
      doc.fontSize(9).font('Helvetica');

      items?.forEach((item) => {
        const lineTotal = (parseFloat(item.quantity) * parseFloat(item.unit_price)).toFixed(2);

        // Handle long descriptions with wrapping
        const descLines = doc.heightOfString(item.description, { width: 280 });
        if (yPosition + descLines > 700) {
          doc.addPage();
          yPosition = 50;
        }

        doc.text(item.description, 40, yPosition, { width: 280 });
        doc.text(parseFloat(item.quantity).toFixed(2), 330, yPosition, { width: 50, align: 'right' });
        doc.text(`$${parseFloat(item.unit_price).toFixed(2)}`, 380, yPosition, { width: 70, align: 'right' });
        doc.text(`$${lineTotal}`, 450, yPosition, { width: 105, align: 'right' });

        yPosition += 25;
      });

      // Totals section
      yPosition += 10;
      doc.moveTo(40, yPosition).lineTo(555, yPosition).stroke();
      yPosition += 15;

      doc.font('Helvetica');
      doc.text('Subtotal:', 380, yPosition, { width: 70, align: 'right' });
      doc.text(`$${parseFloat(invoice.subtotal || 0).toFixed(2)}`, 450, yPosition, { width: 105, align: 'right' });

      yPosition += 20;
      if (invoice.tax_amount && parseFloat(invoice.tax_amount) > 0) {
        const taxRate = invoice.tax_rate || 0;
        doc.text(`Tax (${taxRate}%):`, 380, yPosition, { width: 70, align: 'right' });
        doc.text(`$${parseFloat(invoice.tax_amount).toFixed(2)}`, 450, yPosition, { width: 105, align: 'right' });
        yPosition += 20;
      }

      if (invoice.discount_amount && parseFloat(invoice.discount_amount) > 0) {
        doc.text('Discount:', 380, yPosition, { width: 70, align: 'right' });
        doc.text(`-$${parseFloat(invoice.discount_amount).toFixed(2)}`, 450, yPosition, { width: 105, align: 'right' });
        yPosition += 20;
      }

      // Total
      doc.moveTo(380, yPosition).lineTo(555, yPosition).stroke();
      yPosition += 10;
      doc.font('Helvetica-Bold').fontSize(11);
      doc.text('TOTAL:', 380, yPosition, { width: 70, align: 'right' });
      doc.text(`$${parseFloat(invoice.total_amount || 0).toFixed(2)}`, 450, yPosition, { width: 105, align: 'right' });

      // Balance due
      if (invoice.balance_due && parseFloat(invoice.balance_due) > 0) {
        yPosition += 25;
        doc.font('Helvetica-Bold').fontSize(10);
        doc.fillColor('#d32f2f');
        doc.text('BALANCE DUE:', 380, yPosition, { width: 70, align: 'right' });
        doc.text(`$${parseFloat(invoice.balance_due).toFixed(2)}`, 450, yPosition, { width: 105, align: 'right' });
        doc.fillColor('#000000');
      }

      // Notes and payment terms
      yPosition = 700;
      doc.fontSize(9).font('Helvetica-Bold').text('Notes:', 40, yPosition);
      yPosition += 15;
      doc.fontSize(8).font('Helvetica');
      const notesText = invoice.notes || 'Thank you for your business!';
      doc.text(notesText, 40, yPosition, { width: 515 });

      yPosition += 40;
      if (invoice.payment_terms) {
        doc.fontSize(9).font('Helvetica-Bold').text('Payment Terms:', 40, yPosition);
        yPosition += 12;
        doc.fontSize(8).font('Helvetica').text(invoice.payment_terms, 40, yPosition, { width: 515 });
      }

      // Footer
      const pages = doc.bufferedPageRange().count;
      for (let i = 0; i < pages; i++) {
        doc.switchToPage(i);
        doc.fontSize(8).font('Helvetica').fillColor('#999999');
        doc.text(
          `Page ${i + 1} of ${pages}`,
          40,
          doc.page.height - 30,
          { width: 515, align: 'center' }
        );
        doc.fillColor('#000000');
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
   * Format date for display
   */
  static formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Format invoice status for display
   */
  static formatStatus(status) {
    const statusMap = {
      draft: 'Draft',
      sent: 'Sent',
      viewed: 'Viewed',
      partial: 'Partial Payment',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
      void: 'Void',
    };
    return statusMap[status] || status;
  }

  /**
   * Upload PDF to storage (S3 or local)
   */
  static async uploadPDFToStorage(buffer, invoicePath) {
    try {
      logger.info(`Uploading PDF to storage: ${invoicePath}`);
      // Phase 3 Note: This would integrate with attachment service
      // For now, return a placeholder path
      return invoicePath;
    } catch (error) {
      logger.error('Error in uploadPDFToStorage:', error);
      throw error;
    }
  }
}

module.exports = PDFService;
