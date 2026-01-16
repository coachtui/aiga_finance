const Anthropic = require('@anthropic-ai/sdk');
const pdf = require('pdf-parse');
const logger = require('./logger');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Call Claude API with vision to extract invoice data
 * @param {string} imageBase64 - Base64 encoded image
 * @param {string} mediaType - MIME type (image/jpeg, image/png, application/pdf)
 * @returns {Promise<object>} Extracted invoice data
 */
async function callClaudeVision(imageBase64, mediaType = 'image/jpeg') {
  try {
    // Craft prompt for invoice extraction
    const prompt = `You are an expert at extracting structured data from invoices and receipts.
Analyze this invoice/receipt image and extract the following information in JSON format:

{
  "vendorName": "Company or vendor name",
  "amount": "Total amount as a number (no currency symbols)",
  "transactionDate": "Date in YYYY-MM-DD format",
  "description": "Brief description of goods/services",
  "invoiceNumber": "Invoice or receipt number if visible",
  "currency": "Currency code (USD, EUR, etc.) or USD if not specified",
  "lineItems": "List of line items as a text string, e.g., 'Item 1 ($100), Item 2 ($50)'",
  "confidence": "Your confidence level: high, medium, or low"
}

Important instructions:
- If a field is not found or unclear, use null
- For amount, extract only the final total (not subtotals or line items)
- For transactionDate, convert any date format to YYYY-MM-DD
- For confidence, assess based on image quality and data visibility
- Return ONLY valid JSON, no additional text

Extract the data now:`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    });

    // Extract text content from response
    const textContent = response.content.find(block => block.type === 'text');
    if (!textContent) {
      throw new Error('No text content in Claude response');
    }

    // Parse JSON response
    const extractedData = parseInvoiceResponse(textContent.text);

    logger.info('Successfully extracted invoice data via Claude Vision', {
      confidence: extractedData.confidence,
      vendor: extractedData.vendorName
    });

    return extractedData;
  } catch (error) {
    logger.error('Error calling Claude Vision API', { error: error.message });
    throw new Error(`OCR extraction failed: ${error.message}`);
  }
}

/**
 * Parse Claude's JSON response and structure the data
 * @param {string} responseText - Raw text response from Claude
 * @returns {object} Structured invoice data
 */
function parseInvoiceResponse(responseText) {
  try {
    // Try to extract JSON from response (Claude might add markdown formatting)
    let jsonText = responseText.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);

    // Validate and normalize the data
    return {
      vendorName: parsed.vendorName || null,
      amount: parsed.amount ? parseFloat(parsed.amount) : null,
      transactionDate: parsed.transactionDate || null,
      description: parsed.description || null,
      invoiceNumber: parsed.invoiceNumber || null,
      currency: parsed.currency || 'USD',
      lineItems: parsed.lineItems || null,
      confidence: parsed.confidence || 'medium',
      rawData: parsed // Store original response
    };
  } catch (error) {
    logger.error('Error parsing Claude response', { error: error.message, responseText });
    // Return default structure if parsing fails
    return {
      vendorName: null,
      amount: null,
      transactionDate: null,
      description: null,
      invoiceNumber: null,
      currency: 'USD',
      lineItems: null,
      confidence: 'low',
      rawData: { error: 'Failed to parse response', responseText }
    };
  }
}

/**
 * Extract text from PDF buffer for OCR processing
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text content
 */
async function extractTextFromPdf(pdfBuffer) {
  try {
    const data = await pdf(pdfBuffer);
    logger.info(`Extracted ${data.text.length} characters from PDF`);
    return data.text;
  } catch (error) {
    logger.error('Error extracting text from PDF', { error: error.message });
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

/**
 * Convert PDF to image and extract invoice data
 * For simplicity, we'll try to extract text first. If that fails, we'd need pdf2pic library
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<object>} Extracted invoice data
 */
async function extractFromPdf(pdfBuffer) {
  try {
    // First, try to extract text from PDF
    const textContent = await extractTextFromPdf(pdfBuffer);

    // Use Claude with text prompt for text-based PDFs
    const prompt = `You are an expert at extracting structured data from invoice text.
Analyze this invoice text and extract the following information in JSON format:

{
  "vendorName": "Company or vendor name",
  "amount": "Total amount as a number (no currency symbols)",
  "transactionDate": "Date in YYYY-MM-DD format",
  "description": "Brief description of goods/services",
  "invoiceNumber": "Invoice or receipt number if visible",
  "currency": "Currency code (USD, EUR, etc.) or USD if not specified",
  "lineItems": "List of line items as a text string",
  "confidence": "Your confidence level: high, medium, or low"
}

Important:
- If a field is not found, use null
- For amount, extract only the final total
- For transactionDate, convert to YYYY-MM-DD format
- Return ONLY valid JSON

Invoice text:
${textContent}

Extract the data now:`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    if (!textBlock) {
      throw new Error('No text content in Claude response');
    }

    const extractedData = parseInvoiceResponse(textBlock.text);

    logger.info('Successfully extracted invoice data from PDF text', {
      confidence: extractedData.confidence,
      vendor: extractedData.vendorName
    });

    return extractedData;
  } catch (error) {
    logger.error('Error extracting from PDF', { error: error.message });
    throw error;
  }
}

/**
 * Extract invoice data from image buffer
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {string} mimeType - MIME type (image/jpeg, image/png, etc.)
 * @returns {Promise<object>} Extracted invoice data
 */
async function extractFromImage(imageBuffer, mimeType = 'image/jpeg') {
  try {
    const imageBase64 = imageBuffer.toString('base64');
    return await callClaudeVision(imageBase64, mimeType);
  } catch (error) {
    logger.error('Error extracting from image', { error: error.message });
    throw error;
  }
}

/**
 * Validate extracted invoice data
 * @param {object} data - Extracted invoice data
 * @returns {Array<string>} Array of validation error messages
 */
function validateExtractedData(data) {
  const errors = [];

  if (!data.vendorName) {
    errors.push('Vendor name not found');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Invalid or missing amount');
  }

  if (!data.transactionDate) {
    errors.push('Transaction date not found');
  } else {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.transactionDate)) {
      errors.push('Invalid date format (expected YYYY-MM-DD)');
    }
  }

  return errors;
}

module.exports = {
  callClaudeVision,
  parseInvoiceResponse,
  extractTextFromPdf,
  extractFromPdf,
  extractFromImage,
  validateExtractedData
};
