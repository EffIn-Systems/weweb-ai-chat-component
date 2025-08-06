import React, { useRef, useEffect } from 'react';
import Message from './Message.jsx';
import TypingIndicator from './TypingIndicator.jsx';

const ChatMessages = ({ messages, userName, emptyStateMessage, isLoading }) => {
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);
  
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-messages">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">{emptyStateMessage}</div>
          <div className="empty-state-subtitle">
            Try: "Find the optimal case study for this response"
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          userName={userName}
        />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;