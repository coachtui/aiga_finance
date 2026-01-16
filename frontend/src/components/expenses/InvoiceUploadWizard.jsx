import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadAndExtract, useConfirmImport } from '../../hooks/useBulkImport';
import FileUpload from '../common/FileUpload';
import ExpenseReviewTable from './ExpenseReviewTable';
import LoadingSpinner from '../common/LoadingSpinner';

export default function InvoiceUploadWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Upload, 2: Processing, 3: Review, 4: Confirmation
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [extractedData, setExtractedData] = useState([]);
  const [reviewedExpenses, setReviewedExpenses] = useState([]);
  const [importResult, setImportResult] = useState(null);

  const uploadAndExtract = useUploadAndExtract();
  const confirmImport = useConfirmImport();

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleUploadAndProcess = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    // Move to processing step
    setStep(2);

    try {
      const response = await uploadAndExtract.mutateAsync({
        files: selectedFiles,
        options: {}
      });

      const { sessionId: newSessionId, extractedExpenses } = response.data.data;

      setSessionId(newSessionId);
      setExtractedData(extractedExpenses);
      setReviewedExpenses(extractedExpenses); // Initialize with extracted data

      // Move to review step
      setStep(3);
    } catch (error) {
      // Error is already shown by the mutation's onError
      // Return to upload step
      setStep(1);
    }
  };

  const handleReviewUpdate = (updatedExpenses) => {
    setReviewedExpenses(updatedExpenses);
  };

  const handleConfirm = async () => {
    // Filter out excluded expenses (those marked with exclude flag)
    const expensesToCreate = reviewedExpenses.filter(expense => !expense.exclude);

    if (expensesToCreate.length === 0) {
      alert('Please select at least one expense to import');
      return;
    }

    try {
      const response = await confirmImport.mutateAsync({
        sessionId,
        expenses: expensesToCreate
      });

      setImportResult(response.data.data);
      setStep(4); // Move to confirmation step
    } catch (error) {
      // Error is already shown by the mutation's onError
    }
  };

  const handleBackToUpload = () => {
    setStep(1);
    setSelectedFiles([]);
    setSessionId(null);
    setExtractedData([]);
    setReviewedExpenses([]);
  };

  const handleImportMore = () => {
    setStep(1);
    setSelectedFiles([]);
    setSessionId(null);
    setExtractedData([]);
    setReviewedExpenses([]);
    setImportResult(null);
  };

  const handleViewExpenses = () => {
    navigate('/expenses');
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[
          { num: 1, label: 'Upload' },
          { num: 2, label: 'Processing' },
          { num: 3, label: 'Review' },
          { num: 4, label: 'Confirm' }
        ].map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === s.num
                    ? 'bg-primary-600 text-white'
                    : step > s.num
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="text-xs mt-1 text-gray-600">{s.label}</span>
            </div>
            {index < 3 && (
              <div className={`w-16 h-1 mx-2 ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Supported Formats</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• PDF invoices and receipts</li>
              <li>• Image files (JPG, PNG)</li>
              <li>• CSV/Excel files with expense data</li>
              <li>• Maximum 10 files, 10MB each</li>
            </ul>
          </div>

          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx,.xls"
            maxFiles={10}
            maxSize={10}
          />

          <div className="flex justify-end">
            <button
              onClick={handleUploadAndProcess}
              disabled={selectedFiles.length === 0 || uploadAndExtract.isPending}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload & Process Files
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Processing */}
      {step === 2 && (
        <div className="py-12 text-center">
          <LoadingSpinner size="lg" />
          <h3 className="text-lg font-semibold text-gray-900 mt-6">Processing Files...</h3>
          <p className="text-gray-600 mt-2">
            Extracting data from {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
          </p>
          <p className="text-sm text-gray-500 mt-4">This may take a few moments</p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-900 mb-2">Review Extracted Data</h3>
            <p className="text-sm text-yellow-700">
              Please review the extracted information and make any necessary corrections before creating expenses.
            </p>
          </div>

          <ExpenseReviewTable
            expenses={reviewedExpenses}
            onUpdate={handleReviewUpdate}
          />

          <div className="flex justify-between">
            <button
              onClick={handleBackToUpload}
              className="btn btn-secondary"
            >
              ← Back to Upload
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmImport.isPending}
              className="btn btn-primary disabled:opacity-50"
            >
              {confirmImport.isPending ? 'Creating Expenses...' : 'Confirm & Create Expenses'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && importResult && (
        <div className="space-y-6">
          {importResult.created > 0 && importResult.failed === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">Import Successful!</h3>
              <p className="text-green-700">
                Successfully created {importResult.created} expense{importResult.created > 1 ? 's' : ''}
              </p>
            </div>
          )}

          {importResult.failed > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Some Imports Failed</h3>
              <p className="text-red-700 mb-4">
                Created {importResult.created} expense{importResult.created > 1 ? 's' : ''},
                but {importResult.failed} failed
              </p>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>
                        • {error.vendorName || 'Unknown'}: {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleViewExpenses}
              className="btn btn-primary"
            >
              View Expenses
            </button>
            <button
              onClick={handleImportMore}
              className="btn btn-secondary"
            >
              Import More Invoices
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
