import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode'; // Import your custom nodes
import LLMNode from './LLMNode'; // Import your custom LLM node

// Define node types
const nodeTypes = {
  custom: CustomNode, // Custom node for System Prompt
  llm: LLMNode, // Custom node for LLM
};

const initialNodes = []; // Start with an empty canvas
const initialEdges = [];

const ChatFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [response, setResponse] = useState('Waiting for response...');
  const [question, setQuestion] = useState(''); // State for dynamic input
  const [validationMessage, setValidationMessage] = useState(''); // State for validation messages
  const [isSent, setIsSent] = useState(false); // State to track if the button is clicked

  const { project } = useReactFlow(); // Hook to convert screen coordinates to flow coordinates

  const onConnect = useCallback(
    (params) => {
      // Add animated: true to enable the flowing effect
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [setEdges]
  );

  // Function to handle dragging components from the sidebar
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Function to handle dropping components onto the canvas
  const onDrop = (event) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    const position = project({ x: event.clientX, y: event.clientY });

    const newNode = {
      id: `${type}-${Date.now()}`, // Unique ID for the node
      type,
      position,
      data: { label: `${type === 'custom' ? 'System Prompt' : type === 'llm' ? 'LLM' : 'Output'} Node` },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  // Function to handle node deletion on Delete key press
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Delete') {
        const selectedNodes = nodes.filter((node) => node.selected); // Get selected nodes
        const selectedEdges = edges.filter((edge) => edge.selected); // Get selected edges

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          // Remove selected nodes and edges
          setNodes((nds) => nds.filter((node) => !node.selected));
          setEdges((eds) => eds.filter((edge) => !edge.selected));
        }
      }
    },
    [nodes, edges, setNodes, setEdges]
  );

  // Add keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleRun = async () => {
    setIsSent(true);
  
    const promptNode = nodes.find((node) => node.data.label === 'System Prompt Node');
    const llmNode = nodes.find((node) => node.data.label === 'LLM Node');
    const outputNode = nodes.find((node) => node.data.label === 'Output Node');
  
    // Validation: Check if all nodes are connected
    if (!promptNode || !llmNode || !outputNode) {
      setValidationMessage('Please connect all nodes: System Prompt -> LLM -> Output');
      setIsSent(false); // Reset the button state
      return;
    }
  
    // Validation: Check if a question is entered
    if (!question) {
      setValidationMessage('Please enter a question.');
      setIsSent(false); // Reset the button state
      return;
    }
  
    // Validation: Check if an API key is entered
    if (!llmNode.data.apiKey) {
      setValidationMessage('Please enter an API key in the LLM node.');
      setIsSent(false); // Reset the button state
      return;
    }
  
    // Clear validation message if all checks pass
    setValidationMessage('');
  
    // Extract data from the nodes
    const prompt = promptNode.data.content;
    const model = llmNode.data.model;
    const temperature = llmNode.data.temperature;
    const apiKey = llmNode.data.apiKey;
  
    // Log the payload before sending
    const payload = {
      prompt: prompt,
      question: question,
      model: model,
      temperature: temperature,
      api_key: apiKey,
    };
    console.log('Sending payload:', payload);
  
    try {
      const res = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while fetching the response.');
    } finally {
      // Reset the button state after the API call completes
      setIsSent(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '200px',
          backgroundColor: '#f4f4f4',
          padding: '10px',
          borderRight: '1px solid #ccc',
        }}
      >
        <h3>Add Nodes</h3>
        <div
          draggable
          onDragStart={(event) => onDragStart(event, 'custom')}
          style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'grab',
          }}
        >
          Add Prompt
        </div>
        <div
          draggable
          onDragStart={(event) => onDragStart(event, 'llm')}
          style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'grab',
          }}
        >
          Add LLM
        </div>
        <div
          draggable
          onDragStart={(event) => onDragStart(event, 'output')}
          style={{
            padding: '10px',
            marginBottom: '10px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'grab',
          }}
        >
          Add Output
        </div>
      </div>

      {/* React Flow Canvas */}
      <div style={{ flex: 1, position: 'relative' }} onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            style: { stroke: 'black', strokeWidth: 3 }, // Thicker and black edges
            animated: true, // Enable animation for all edges
          }}
          edgesUpdatable={true}
          edgesFocusable={true}
        >
          <Controls />
          <Background />

          {/* Output Box at the Center Bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '5px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              zIndex: 1000,
            }}
          >
            <h3>Output:</h3>
            <p>{response}</p>
          </div>
        </ReactFlow>

        {/* Send Button and Text Box */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 1000,
          }}
        >
          <input
            type="text"
            placeholder="Enter your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <button
            onClick={handleRun}
            style={{
              padding: '10px',
              borderRadius: '5px',
              border: 'none',
              backgroundColor: isSent ? '#4CAF50' : '#007bff', // Green if sent, blue otherwise
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            {isSent ? (
              <>
                <span>Sent</span>
                <span>✔️</span> {/* Tick mark */}
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>

      {/* Validation Message Area */}
      {validationMessage && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            zIndex: 1000,
          }}
        >
          {validationMessage}
        </div>
      )}
    </div>
  );
};

export default ChatFlow;