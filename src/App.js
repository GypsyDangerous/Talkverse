import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Conversation from './components/Conversation';

function App() {
  return (
    <div className="app">
      <Sidebar/>
      <Conversation/>
    </div>
  );
}

export default App;
