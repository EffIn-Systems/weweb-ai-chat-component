import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="message ai typing">
      <div className="message-avatar">AI</div>
      <div className="message-content">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
