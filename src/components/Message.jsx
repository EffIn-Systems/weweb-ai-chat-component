import React from 'react';

const Message = ({ message, userName }) => {
  const isUser = message.sender === 'user';
  const avatarText = isUser ? userName.charAt(0).toUpperCase() : 'AI';
  
  // Format message content - handle code blocks, links, etc.
  const formatContent = (content) => {
    // Simple formatting - you can enhance this
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className={`message ${message.sender} ${message.isError ? 'error' : ''}`}>
      <div className="message-avatar">
        {avatarText}
      </div>
      <div className="message-content">
        {formatContent(message.content)}
      </div>
    </div>
  );
};

export default Message;