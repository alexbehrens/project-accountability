import React from 'react';
import ApiKeyGate from './components/ApiKeyGate';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <ApiKeyGate>
      <Dashboard />
    </ApiKeyGate>
  );
}

export default App; 