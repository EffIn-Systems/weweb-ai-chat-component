// This file is now much simpler or even unnecessary
// You could even delete this file and handle storage directly in useChat

const STORAGE_KEY = 'ww-chat-messages';
const THREAD_KEY = 'ww-chat-thread';
const MAX_MESSAGES = 100;

export const saveMessages = (messages) => {
  try {
    const messagesToStore = messages.slice(-MAX_MESSAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
  } catch (error) {
    console.error('Failed to save messages:', error);
  }
};

export const loadMessages = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const messages = JSON.parse(saved);
      if (Array.isArray(messages)) {
        return messages;
      }
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
  return [];
};

export const clearMessages = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear messages:', error);
  }
};