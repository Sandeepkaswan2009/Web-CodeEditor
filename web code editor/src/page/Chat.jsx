import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import '../styles/chat.css';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      // Show loading state
      setMessages([...newMessages, { role: 'assistant', content: '...' }]);

      const response = await axios.post('http://localhost:5000/api/chat/generate', {
        prompt: input
      });

      // Update with actual response
      setMessages([...newMessages, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, there was an error generating the response.' 
      }]);
    }
  };

  const copyCode = async (code, button) => {
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copied!';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = 'Copy code';
        button.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      button.textContent = 'Failed to copy';
      setTimeout(() => {
        button.textContent = 'Copy code';
      }, 2000);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  const retryLastMessage = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage.role === 'user') {
        // Remove the last AI response
        const newMessages = messages.slice(0, -1);
        setMessages(newMessages);
        // Here you would make a new API call with the last user message
        const mockResponse = "Here's a new response:\n```javascript\nconsole.log('Retried response');\n```";
        setMessages([...newMessages, { role: 'assistant', content: mockResponse }]);
      }
    }
  };

  const formatMessage = (message) => {
    // Check if the message is code output
    if (message.includes('```')) {
      const parts = message.split(/(```[\s\S]*?```)/);
      return (
        <div className="message-content">
          {parts.map((part, index) => {
            if (part.startsWith('```')) {
              const code = part.slice(3, -3);
              const language = code.split('\n')[0];
              const actualCode = code.split('\n').slice(1).join('\n');
              
              return (
                <div key={index} className="code-block-container">
                  <div className="code-header">
                    <span className="language-tag">{language}</span>
                    <button 
                      onClick={(e) => copyCode(actualCode, e.target)}
                      className="copy-button"
                    >
                      Copy code
                    </button>
                  </div>
                  <div className="code-content">
                    <div className="editor-wrapper">
                      <Editor
                        height="200px"
                        theme="vs-dark"
                        language={language.toLowerCase()}
                        value={actualCode}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          lineNumbers: 'on',
                          renderLineHighlight: 'none',
                          contextmenu: false,
                          fontSize: 14,
                          lineHeight: 1.5,
                          folding: false,
                          automaticLayout: true,
                          wordWrap: 'on'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            }
            
            // For regular text, use the existing structured format
            return (
              <div key={index} className="message-section">
                {part.split('\n').map((line, lineIndex) => {
                  if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                    return <li key={lineIndex} className="list-item">{line.trim().substring(1)}</li>;
                  }
                  if (line.trim().match(/^[a-z]\./) || line.trim().match(/^\d+\./)) {
                    return <div key={lineIndex} className="section-header">{line}</div>;
                  }
                  return <div key={lineIndex} className="section-text">{line}</div>;
                })}
              </div>
            );
          })}
        </div>
      );
    }

    // For non-code messages, use the existing structured format
    const sections = message.split(/(?=^\d+\.)/gm);
    return (
      <div className="message-content">
        {sections.map((section, index) => {
          if (!section.trim()) return null;
          return (
            <div key={index} className="message-section">
              {section.split('\n').map((line, lineIndex) => {
                if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                  return <li key={lineIndex} className="list-item">{line.trim().substring(1)}</li>;
                }
                if (line.trim().match(/^[a-z]\./) || line.trim().match(/^\d+\./)) {
                  return <div key={lineIndex} className="section-header">{line}</div>;
                }
                return <div key={lineIndex} className="section-text">{line}</div>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Chat</h2>
        <div className="chat-actions">
          <button 
            onClick={retryLastMessage} 
            className="action-button"
            disabled={messages.length < 2}
          >
            🔄 Retry
          </button>
          <button 
            onClick={clearChat} 
            className="action-button"
            disabled={messages.length === 0}
          >
            🗑️ Clear
          </button>
        </div>
      </div>
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {formatMessage(message.content)}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="chat-input"
        />
      </form>
    </div>
  );
};

export default Chat; 