<template>
  <div
    class="ww-chat-container"
    :style="containerStyle"
    :data-room="chatConfig.roomId"
    ref="elementRoot"
  />
</template>

<script>
import React from 'react'
import ReactDOM from 'react-dom/client'
import { nextTick } from 'vue'
import ChatApp from './ChatApp.jsx'

export default {
  name: 'AIChat',
  props: { content: { type: Object, required: true } },
  data: () => ({ 
    root: null,
    reactComponent: null
  }),

  computed: {
    containerStyle() {
      return { 
        height: '100%', 
        width: '100%', 
        position: 'relative', 
        minHeight: '400px' 
      }
    },
    chatConfig() {
      const c = this.content
      return {
        webhookUrl: c.webhookUrl || 'https://hooks.make.com/',
        roomId: c.roomId || 'default-room',
        userId: c.userId || 'anonymous',
        userName: c.userName || 'User',
        placeholder: c.placeholder || 'Type or paste your message…',
        emptyStateMessage: c.emptyStateMessage || 'How can I help?',
        expandable: c.expandable !== false,
        theme: c.theme || 'dark'
      }
    }
  },

  watch: { 
    chatConfig: { 
      deep: true, 
      handler() { 
        // Just update the existing component, don't re-render
        if (this.root) {
          this.updateReactComponent()
        }
      } 
    }
  },

  mounted() {
    console.log('[AI-Chat] Vue mounted')
    if (typeof wwLib !== 'undefined') {
      (wwLib.wwElement?.useCreate || wwLib.useCreateElement)
        ?.call(wwLib, this.$el)
    }
    nextTick(() => this.renderChat())
  },
  
  beforeUnmount() {
    if (this.root) {
      try {
        this.root.unmount()
      } catch (error) {
        console.error('[AI-Chat] Error unmounting:', error)
      }
      this.root = null
    }
  },

  methods: {
    renderChat() {
      const mountPoint = this.$refs.elementRoot || this.$el
      if (!mountPoint) {
        console.warn('[AI-Chat] No mount point found')
        return
      }

      try {
        if (!this.root) {
          this.root = ReactDOM.createRoot(mountPoint)
        }

        this.updateReactComponent()
      } catch (error) {
        console.error('[AI-Chat] Error rendering:', error)
      }
    },

    updateReactComponent() {
      if (!this.root) return

      console.log('[AI-Chat] Updating with roomId:', this.chatConfig.roomId)
      
      this.root.render(
        React.createElement(ChatApp, {
          ...this.chatConfig,
          key: this.chatConfig.roomId, // React key for proper re-render
          onMessage: this.handleMessage,
          onError: this.handleError,
          onReady: this.handleReady
        })
      )
    },

    handleMessage(data) {
      console.log('[AI-Chat] Message event:', data)
      this.$emit('message', data)
    },
    
    handleError(err) {
      console.error('[AI-Chat] Error event:', err)
      this.$emit('error', err)
    },
    
    handleReady() {
      console.log('[AI-Chat] Ready event')
      this.$emit('ready')
    }
  }
}
</script>

<style>
.ww-chat-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}
</style>