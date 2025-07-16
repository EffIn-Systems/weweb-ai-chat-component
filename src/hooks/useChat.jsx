import { useState, useEffect, useCallback, useRef } from 'react';
import { sendToWebhook } from '../utils/api.jsx';

const useChat = ({
  webhookUrl,
  roomId,
  userId,
  userName,
  onMessage,
  onError
}) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState(() => {
    // Initialize threadId immediately
    return localStorage.getItem('ww-chat-thread') || `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  });
  const messageIdCounter = useRef(0);
  const lastRoomIdRef = useRef(roomId);
  
  // Generate message ID
  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg_${Date.now()}_${messageIdCounter.current}`;
  }, []);

  // Load messages on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ww-chat-messages');
      if (saved) {
        const parsedMessages = JSON.parse(saved);
        if (Array.isArray(parsedMessages)) {
          setMessages(parsedMessages);
          console.log('[AI-Chat] Loaded messages:', parsedMessages.length);
        }
      }
    } catch (error) {
      console.error('[AI-Chat] Error loading messages:', error);
    }
  }, []);

  // Handle roomId changes
  useEffect(() => {
    if (roomId && lastRoomIdRef.current && roomId !== lastRoomIdRef.current) {
      console.log('[AI-Chat] Room ID changed:', lastRoomIdRef.current, '->', roomId);
      
      // Clear messages for new room
      setMessages([]);
      messageIdCounter.current = 0;
      
      // Generate new thread
      const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      setThreadId(newThreadId);
      
      // Clear storage
      try {
        localStorage.removeItem('ww-chat-messages');
        localStorage.setItem('ww-chat-thread', newThreadId);
      } catch (error) {
        console.error('[AI-Chat] Error updating storage:', error);
      }
    }
    
    lastRoomIdRef.current = roomId;
  }, [roomId]);

  // Save messages
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const toSave = messages.slice(-100);
        localStorage.setItem('ww-chat-messages', JSON.stringify(toSave));
      } catch (error) {
        console.error('[AI-Chat] Error saving messages:', error);
      }
    }
  }, [messages]);

  const addMessage = useCallback((sender, content, metadata = {}) => {
    const newMessage = {
      id: generateMessageId(),
      sender,
      content,
      timestamp: new Date().toISOString(),
      threadId,
      ...metadata
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, [threadId, generateMessageId]);

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading) return;
    
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      console.error('Invalid webhook URL:', webhookUrl);
      addMessage('ai', '❌ Configuration error: Invalid webhook URL', { isError: true });
      return;
    }

    const userMessage = {
      id: generateMessageId(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      threadId
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const payload = {
        message: text,
        rfpId: roomId || 'default-room',
        userId: userId || 'anonymous',
        userName: userName || 'User',
        timestamp: new Date().toISOString(),
        messageId: userMessage.id,
        threadId,
        messageCount: messages.length + 1
      };
      
      console.log('[AI-Chat] Sending:', payload);
      
      const response = await sendToWebhook(webhookUrl, payload);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const aiContent = response.reply || response.message || response.data || 'Message received';
      const aiMessage = {
        id: generateMessageId(),
        sender: 'ai',
        content: aiContent,
        timestamp: new Date().toISOString(),
        threadId,
        responseTime: response.responseTime
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (onMessage) {
        onMessage({
          type: 'response',
          userMessage,
          aiMessage,
          response,
          threadId,
          rfpId: roomId
        });
      }
      
    } catch (error) {
      console.error('[AI-Chat] Error:', error);
      
      const errorMessage = `❌ ${error.message || 'An error occurred. Please try again.'}`;
      const errorMsg = {
        id: generateMessageId(),
        sender: 'ai',
        content: errorMessage,
        timestamp: new Date().toISOString(),
        threadId,
        isError: true
      };
      
      setMessages(prev => [...prev, errorMsg]);
      
      if (onError) {
        onError({ type: 'request_error', error, message: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  }, [webhookUrl, roomId, userId, userName, isLoading, onMessage, onError, messages.length, threadId, generateMessageId, addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    messageIdCounter.current = 0;
    
    const newThreadId = `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setThreadId(newThreadId);
    
    try {
      localStorage.removeItem('ww-chat-messages');
      localStorage.setItem('ww-chat-thread', newThreadId);
    } catch (error) {
      console.error('[AI-Chat] Error clearing storage:', error);
    }
    
    console.log('[AI-Chat] Chat cleared');
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    addMessage,
    threadId
  };
};

export default useChat;