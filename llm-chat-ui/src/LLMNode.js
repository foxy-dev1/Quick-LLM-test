import React, { useState } from 'react';
import { Handle } from 'reactflow';

const LLMNode = ({ data }) => {
  const [model, setModel] = useState(data.model || 'gemini-1.5-pro');
  const [temperature, setTemperature] = useState(data.temperature || 0);
  const [apiKey, setApiKey] = useState(data.apiKey || '');

  const handleModelChange = (event) => {
    setModel(event.target.value);
    data.model = event.target.value; // Update the node's data
  };

  const handleTemperatureChange = (event) => {
    const newValue = parseFloat(event.target.value);
    setTemperature(newValue);
    data.temperature = newValue; // Update the node's data
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
    data.apiKey = event.target.value; // Update the node's data with the new API key
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{data.label}</div>

      {/* API Key Input */}
      <div style={{ marginBottom: '10px' }}>
        <label>API Key: </label>
        <input
          type="password" // Use type="password" to mask the input with asterisks
          value={apiKey}
          onChange={handleApiKeyChange}
          style={{ width: '100%', padding: '5px', borderRadius: '5px' }}
          placeholder="Enter your API key"
        />
      </div>

      {/* Model Selection Dropdown */}
      <div style={{ marginBottom: '10px' }}>
        <label>Model: </label>
        <select value={model} onChange={handleModelChange} style={{ width: '100%', padding: '5px', borderRadius: '5px' }}>
          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
          <option value="gemini-1.5-flash-8b">Gemini 1.5 Flash 8B</option>
        </select>
      </div>

      {/* Temperature Slider */}
      <div>
        <label>Temperature: </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={temperature}
          onChange={handleTemperatureChange}
          style={{ width: '100%' }}
        />
        <div>{temperature}</div> {/* Display the current temperature value */}
      </div>

      {/* Handles for connecting edges */}
      <Handle type="source" position="right" />
      <Handle type="target" position="left" />
    </div>
  );
};

export default LLMNode;