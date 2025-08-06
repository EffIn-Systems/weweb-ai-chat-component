const DEFAULT_TIMEOUT = 30000; // 30 seconds

export const sendToWebhook = async (webhookUrl, payload) => {
  const startTime = Date.now();
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    // Check if response is ok
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
    }
    
    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Try to parse as JSON anyway
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        // If not JSON, wrap the text response
        data = { message: text };
      }
    }
    
    // Add response time to data
    return {
      ...data,
      responseTime
    };
    
  } catch (error) {
    // Handle different error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - the server took too long to respond');
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error('Failed to fetch - please check your internet connection and webhook URL');
    } else {
      throw error;
    }
  }
};

// Helper to validate webhook URL
export const validateWebhookUrl = (url) => {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Helper to format error messages
export const formatErrorMessage = (error) => {
  if (error.message.includes('404')) {
    return 'Webhook not found. Please check the URL.';
  } else if (error.message.includes('401') || error.message.includes('403')) {
    return 'Authentication failed. Please check your credentials.';
  } else if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  } else if (error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  } else if (error.message.includes('Failed to fetch')) {
    return 'Connection failed. Please check your internet connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
};