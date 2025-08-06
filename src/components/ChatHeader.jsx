import React from 'react';

const ChatHeader = ({ isExpanded, expandable, onToggleExpand }) => {
  return (
    <div className="chat-header">
      <div className="header-left">
        <div className="status-dot"></div>
        <div className="chat-title">AI Assistant</div>
      </div>
      {expandable && (
        <button 
          className="expand-button" 
          onClick={onToggleExpand}
          aria-label={isExpanded ? 'Minimize chat' : 'Expand chat'}
        >
          <span className="expand-icon">
            {isExpanded ? '⛶' : '⛶'}
          </span>
          <span className="expand-text">
            {isExpanded ? 'Minimize' : 'Expand'}
          </span>
        </button>
      )}
    </div>
  );
};

export default ChatHeader;