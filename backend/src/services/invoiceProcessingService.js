const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const ocrHelper = require('../utils/ocrHelper');
const sessionStore = require('../utils/sessionStore');
const logger = require('../utils/logger');
const Category = require('../models/Category');

/**
 * Process uploaded files and extract invoice data
 * @param {Array} files - Array of uploaded files from Multer
 * @param {string} userId - User ID for category detection
 * @param {object} options - Processing options (defaultCategoryId, etc.)
 * @returns {Promise<object>} Session ID and extracted expenses
 */
async function processUploadedFiles(files, userId, options = {}) {
  try {
    const sessionId = uuidv4();
    const extractedExpenses = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      logger.info(`Processing file ${i + 1}/${files.length}: ${file.originalname}`);

      try {
        let extractedData;

        // Route to appropriate extractor based on MIME type
        if (file.mimetype === 'application/pdf') {
          extractedData = await ocrHelper.extractFromPdf(file.buffer);
        } else if (file.mimetype.startsWith('image/')) {
          extractedData = await ocrHelper.extractFromImage(file.buffer, file.mimetype);
        } else if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          extractedData = await parseCSV(file.buffer);
        } else if (
          file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          file.originalname.match(/\.(xlsx|xls)$/)
        ) {
          extractedData = await parseExcel(file.buffer);
        } else {
          throw new Error(`Unsupported file type: ${file.mimetype}`);
        }

        // CSV/Excel returns array of expenses, PDF/image returns single expense
        if (Array.isArray(extractedData)) {
          // Multiple expenses from CSV/Excel
          for (const expense of extractedData) {
            const categoryId = await detectCategory(expense.vendorName, expense.description, userId);
            extractedExpenses.push({
              tempId: uuidv4(),
              fileName: file.originalname,
              fileSize: file.size,
              fileMimeType: file.mimetype,
              ...expense,
              categoryId: categoryId || options.defaultCategoryId || null,
              paymentMethodId: options.defaultPaymentMethodId || null
            });
          }
        } else {
          // Single expense from PDF/image
          const categoryId = await detectCategory(extractedData.vendorName, extractedData.description, userId);
          extractedExpenses.push({
            tempId: uuidv4(),
            fileName: file.originalname,
            fileSize: file.size,
            fileMimeType: file.mimetype,
            ...extractedData,
            categoryId: categoryId || options.defaultCategoryId || null,
            paymentMethodId: options.defaultPaymentMethodId || null
          });
        }
      } catch (error) {
        logger.error(`Error processing file ${file.originalname}`, { error: error.message });
        // Add failed entry so user knows which file failed
        extractedExpenses.push({
          tempId: uuidv4(),
          fileName: file.originalname,
          fileSize: file.size,
          fileMimeType: file.mimetype,
          error: error.message,
          confidence: 'low',
          vendorName: null,
          amount: null,
          transactionDate: null,
          description: null
        });
      }
    }

    // Store extracted data in session (1 hour expiry)
    const sessionData = {
      userId,
      extractedExpenses,
      files: files.map(f => ({
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
        buffer: f.buffer.toString('base64') // Store for later attachment
      })),
      createdAt: new Date().toISOString()
    };

    await sessionStore.set(`bulk-import:${sessionId}`, sessionData, 3600);

    logger.info(`Processed ${files.length} files, extracted ${extractedExpenses.length} expenses`, {
      sessionId,
      userId
    });

    return {
      sessionId,
      extractedExpenses: extractedExpenses.map(e => {
        // Don't return file buffers in response, just metadata
        const { fileBuffer, ...expenseWithoutBuffer } = e;
        return expenseWithoutBuffer;
      })
    };
  } catch (error) {
    logger.error('Error processing uploaded files', { error: error.message });
    throw error;
  }
}

/**
 * Parse CSV file to expense objects
 * @param {Buffer} fileBuffer - CSV file buffer
 * @returns {Promise<Array>} Array of expense objects
 */
async function parseCSV(fileBuffer) {
  try {
    const csvContent = fileBuffer.toString('utf-8');

    // Parse CSV with headers
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: true
    });

    const expenses = [];

    for (const record of records) {
      // Map CSV columns to expense fields (flexible column names)
      const expense = {
        vendorName: record.Vendor || record.vendor || record.Merchant || record.merchant || null,
        amount: parseFloat(record.Amount || record.amount || record.Total || record.total || 0),
        transactionDate: normalizeDate(record.Date || record.date || record.TransactionDate || record.transaction_date),
        description: record.Description || record.description || record.Notes || record.notes || null,
        invoiceNumber: record.InvoiceNumber || record.invoice_number || record.Invoice || record.invoice || null,
        currency: record.Currency || record.currency || 'USD',
        lineItems: null,
        confidence: 'high', // CSV data is structured, so high confidence
        notes: record.Notes || record.notes || null
      };

      // Validate required fields
      if (expense.vendorName && expense.amount > 0 && expense.transactionDate) {
        expenses.push(expense);
      } else {
        logger.warn('Skipping invalid CSV row', { record });
      }
    }

    logger.info(`Parsed ${expenses.length} expenses from CSV`);
    return expenses;
  } catch (error) {
    logger.error('Error parsing CSV', { error: error.message });
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

/**
 * Parse Excel file to expense objects
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Promise<Array>} Array of expense objects
 */
async function parseExcel(fileBuffer) {
  try {
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Use first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with headers
    const records = XLSX.utils.sheet_to_json(worksheet);

    const expenses = [];

    for (const record of records) {
      // Map Excel columns to expense fields (flexible column names)
      const expense = {
        vendorName: record.Vendor || record.vendor || record.Merchant || record.merchant || null,
        amount: parseFloat(record.Amount || record.amount || record.Total || record.total || 0),
        transactionDate: normalizeDate(record.Date || record.date || record.TransactionDate || record.transaction_date),
        description: record.Description || record.description || record.Notes || record.notes || null,
        invoiceNumber: record.InvoiceNumber || record.invoice_number || record.Invoice || record.invoice || null,
        currency: record.Currency || record.currency || 'USD',
        lineItems: null,
        confidence: 'high', // Excel data is structured
        notes: record.Notes || record.notes || null
      };

      // Validate required fields
      if (expense.vendorName && expense.amount > 0 && expense.transactionDate) {
        expenses.push(expense);
      } else {
        logger.warn('Skipping invalid Excel row', { record });
      }
    }

    logger.info(`Parsed ${expenses.length} expenses from Excel`);
    return expenses;
  } catch (error) {
    logger.error('Error parsing Excel', { error: error.message });
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
}

/**
 * Normalize date to YYYY-MM-DD format
 * @param {string|Date|number} dateValue - Date in various formats
 * @returns {string|null} Date in YYYY-MM-DD format or null
 */
function normalizeDate(dateValue) {
  if (!dateValue) return null;

  try {
    let date;

    if (typeof dateValue === 'number') {
      // Excel serial date number
      date = XLSX.SSF.parse_date_code(dateValue);
      return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) {
      return null;
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  } catch (error) {
    logger.warn('Error normalizing date', { dateValue, error: error.message });
    return null;
  }
}

/**
 * Detect category for expense based on vendor name and description
 * @param {string} vendorName - Vendor/merchant name
 * @param {string} description - Expense description
 * @param {string} userId - User ID (currently not used, but for future user-specific learning)
 * @returns {Promise<string|null>} Category ID or null
 */
async function detectCategory(vendorName, description, userId) {
  try {
    // Fetch all expense categories
    const categories = await Category.findAll({
      where: { type: 'expense', is_active: true }
    });

    // Keyword mappings for common categories
    const keywordMappings = {
      'Software': ['software', 'saas', 'subscription', 'adobe', 'microsoft', 'google workspace', 'slack', 'zoom', 'dropbox', 'github', 'license'],
      'Infrastructure': ['aws', 'azure', 'gcp', 'google cloud', 'hosting', 'server', 'cloud', 'digital ocean', 'heroku', 'vercel', 'netlify'],
      'Office Supplies': ['office depot', 'staples', 'paper', 'supplies', 'printer', 'toner', 'stationery'],
      'Marketing': ['marketing', 'advertising', 'google ads', 'facebook ads', 'linkedin ads', 'social media', 'seo', 'mailchimp'],
      'Professional Services': ['consulting', 'legal', 'accounting', 'lawyer', 'attorney', 'cpa', 'consultant', 'professional'],
      'Travel': ['airline', 'hotel', 'uber', 'lyft', 'rental car', 'airbnb', 'expedia', 'booking'],
      'Utilities': ['electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'telecom'],
      'Equipment': ['equipment', 'hardware', 'computer', 'laptop', 'monitor', 'desk', 'chair', 'furniture']
    };

    // Combine vendor name and description for matching
    const searchText = `${vendorName || ''} ${description || ''}`.toLowerCase();

    // Find best matching category
    let bestMatch = null;
    let highestScore = 0;

    for (const category of categories) {
      const categoryName = category.name;
      const keywords = keywordMappings[categoryName] || [];

      // Count keyword matches
      let score = 0;
      for (const keyword of keywords) {
        if (searchText.includes(keyword.toLowerCase())) {
          score++;
        }
      }

      // Also check if category name itself appears in search text
      if (searchText.includes(categoryName.toLowerCase())) {
        score += 2; // Higher weight for direct match
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = category.id;
      }
    }

    if (bestMatch && highestScore > 0) {
      logger.debug(`Detected category for vendor "${vendorName}"`, { categoryId: bestMatch, score: highestScore });
      return bestMatch;
    }

    return null;
  } catch (error) {
    logger.error('Error detecting category', { error: error.message });
    return null;
  }
}

/**
 * Retrieve session data for review
 * @param {string} sessionId - Session ID
 * @param {string} userId - User ID for verification
 * @returns {Promise<object|null>} Session data or null
 */
async function getSessionData(sessionId, userId) {
  try {
    const sessionData = await sessionStore.get(`bulk-import:${sessionId}`);

    if (!sessionData) {
      logger.warn('Session not found or expired', { sessionId });
      return null;
    }

    // Verify user owns this session
    if (sessionData.userId !== userId) {
      logger.warn('Session user mismatch', { sessionId, requestingUserId: userId, sessionUserId: sessionData.userId });
      return null;
    }

    return sessionData;
  } catch (error) {
    logger.error('Error retrieving session data', { error: error.message, sessionId });
    return null;
  }
}

/**
 * Store extracted data in session
 * @param {string} sessionId - Session ID
 * @param {object} data - Data to store
 * @returns {Promise<boolean>} Success status
 */
async function storeExtractedData(sessionId, data) {
  try {
    await sessionStore.set(`bulk-import:${sessionId}`, data, 3600);
    return true;
  } catch (error) {
    logger.error('Error storing extracted data', { error: error.message, sessionId });
    return false;
  }
}

/**
 * Delete session data (cleanup after confirmation)
 * @param {string} sessionId - Session ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteSessionData(sessionId) {
  try {
    await sessionStore.delete(`bulk-import:${sessionId}`);
    return true;
  } catch (error) {
    logger.error('Error deleting session data', { error: error.message, sessionId });
    return false;
  }
}

module.exports = {
  processUploadedFiles,
  parseCSV,
  parseExcel,
  normalizeDate,
  detectCategory,
  getSessionData,
  storeExtractedData,
  deleteSessionData
};
