import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatDevLayout from './components/chatdev/ChatDevLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<ChatDevLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
