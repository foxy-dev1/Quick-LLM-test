import React, { useState } from 'react';
import { Handle } from 'reactflow';

const CustomNode = ({ data }) => {
  const [prompt, setPrompt] = useState(data.content || '');

  const handleChange = (e) => {
    setPrompt(e.target.value);
    data.content = e.target.value; // Update the node's data
  };

  return (
    <div style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{data.label}</div>
      <textarea
        value={prompt}
        onChange={handleChange}
        placeholder="Enter system prompt..."
        style={{ width: '100%', minHeight: '50px', padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
      />
      {/* Add a handle for connecting edges */}
      <Handle type="source" position="right" />
    </div>
  );
};

export default CustomNode;