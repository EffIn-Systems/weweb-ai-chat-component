import React, { useState, useEffect, useCallback } from 'react';
import ChatHeader from './components/ChatHeader.jsx';
import ChatMessages from './components/ChatMessages.jsx';
import ChatInput from './components/ChatInput.jsx';
import useChat from './hooks/useChat.jsx';
// Remove the CSS import
// import './styles/chat.css';

// Import the style injector instead
import { injectChatStyles } from './styles/chatStyles.js';

console.log('[AI-Chat] ChatApp module loaded');

const ChatApp = ({
  webhookUrl,
  roomId,
  userId,
  userName,
  placeholder,
  emptyStateMessage,
  expandable,
  theme = 'dark',
  onMessage,
  onError,
  onReady
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Inject styles on mount
  useEffect(() => {
    injectChatStyles();
  }, []);
  
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    addMessage,
    threadId
  } = useChat({
    webhookUrl,
    roomId,
    userId,
    userName,
    onMessage,
    onError
  });

  // ... rest of your component code remains the same

  // Domain check
  useEffect(() => {
    const allowedDomains = [
      'rfp.effinsystems.com',
      '.weweb.io',
      'localhost',
      '127.0.0.1'
    ];
    
    const currentDomain = window.location.hostname;
    const isAllowed = allowedDomains.some(domain => 
      currentDomain === domain || 
      currentDomain.endsWith(domain) ||
      currentDomain.includes('weweb-preview')
    );
    
    if (!isAllowed && process.env.NODE_ENV === 'production') {
      console.error('Chat widget: Unauthorized domain:', currentDomain);
      if (onError) {
        onError({ type: 'domain_error', message: 'Unauthorized domain' });
      }
      return;
    }
    
    console.log('Chat widget initialized on:', currentDomain);
  }, [onError]);

  // Initialize
  useEffect(() => {
    if (onReady) {
      onReady();
    }
    
    // Listen for API messages
    const handleApiMessage = (event) => {
      if (event.detail && event.detail.roomId === roomId) {
        if (event.detail.message) {
          sendMessage(event.detail.message);
        }
      }
    };
    
    window.addEventListener('chat-api-message', handleApiMessage);
    
    return () => {
      window.removeEventListener('chat-api-message', handleApiMessage);
    };
  }, [roomId, sendMessage, onReady]);

  const handleToggleExpand = useCallback(() => {
    if (expandable) {
      setIsExpanded(!isExpanded);
    }
  }, [isExpanded, expandable]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to clear
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && e.target.id === 'chat-input') {
        e.preventDefault();
        clearChat();
      }
      
      // Escape to close expanded view
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearChat, isExpanded]);

  // Expose methods to parent - UPDATED TO INCLUDE threadId
  useEffect(() => {
    window.chatInstance = {
      sendMessage,
      clearChat,
      addMessage,
      getMessages: () => messages,
      getThreadId: () => threadId,
      getCurrentRfpId: () => roomId  // Add this for debugging
    };
    
    console.log(`[AI-Chat] Exposed API for RFP: ${roomId}, thread: ${threadId}`);
    
    return () => {
      delete window.chatInstance;
    };
  }, [roomId, messages, sendMessage, clearChat, addMessage, threadId]);

  return (
    <>
      {isExpanded && expandable && (
        <div className="chat-overlay" onClick={handleToggleExpand} />
      )}
      <div className={`chat-container chat-theme-${theme} ${isExpanded ? 'expanded' : ''}`}>
        <ChatHeader 
          isExpanded={isExpanded}
          expandable={expandable}
          onToggleExpand={handleToggleExpand}
        />
        <ChatMessages 
          messages={messages}
          userName={userName}
          emptyStateMessage={emptyStateMessage}
          isLoading={isLoading}
        />
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          placeholder={placeholder}
        />
      </div>
    </>
  );
};

export default ChatApp;