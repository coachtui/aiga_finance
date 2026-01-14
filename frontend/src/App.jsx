import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                EquipmentAI Finance
              </h1>
              <p className="text-gray-600 mb-8">
                Business Finance Tracker - Coming Soon
              </p>
              <div className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg">
                System Initializing...
              </div>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
