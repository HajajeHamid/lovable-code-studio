import React from 'react';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 text-xl font-bold">Lovable Clone</header>
      <Dashboard />
    </div>
  );
}
