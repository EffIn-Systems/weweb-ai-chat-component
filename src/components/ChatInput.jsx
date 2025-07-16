import React, { useState, useRef, useEffect } from 'react';

const ChatInput = ({ onSendMessage, isLoading, placeholder }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };
  
  useEffect(() => {
    adjustHeight();
  }, [message]);
  
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e) => {
    // Send on Enter without Shift
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="input-wrapper">
        <textarea
          ref={textareaRef}
          id="chat-input"
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows="3"
          disabled={isLoading}
          aria-label="Chat message input"
        />
        <button 
          type="submit"
          className="send-button"
          disabled={!message.trim() || isLoading}
          aria-label="Send message"
        >
          {isLoading ? (
            <span className="loading-dots">
              <span>•</span>
              <span>•</span>
              <span>•</span>
            </span>
          ) : (
            'Send'
          )}
        </button>
      </form>
      <div className="shortcuts-hint">
        Shift+Enter for new line • Enter to send • Ctrl+K to clear<br />
        For optimal performance, clear chat after ~10 messages
      </div>
    </div>
  );
};

export default ChatInput;