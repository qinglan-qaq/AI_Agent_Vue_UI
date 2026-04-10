
<!-- src/components/ChatPanel.vue -->
<template>
  <div class="chat-panel">
    <div class="messages">
      <div v-for="(msg, idx) in messages" :key="idx" :class="['msg', msg.role]">
        <span class="role">{{ msg.role === 'user' ? '🧑' : '🤖' }}</span>
        <span class="content">{{ msg.content }}</span>
      </div>
    </div>
    <div class="input-area">
      <select v-model="selectedTool" class="tool-select">
        <option v-for="tool in tools" :key="tool.id" :value="tool.id">
          {{ tool.name }}
        </option>
      </select>
      <input v-model="input" @keyup.enter="handleSend" placeholder="请输入消息..." />
      <button :disabled="isLoading" @click="handleSend">发送</button>
      <button @click="handleClear" style="margin-left:8px;">清空会话</button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useAgentChat } from '../composables/useAgentChat';

const input = ref('');
const selectedTool = ref('');
const {
  messages,
  tools,
  isLoading,
  error,
  sendMessage,
  loadTools,
  clearChat,
} = useAgentChat();

onMounted(async () => {
  await loadTools();
  if (tools.value.length > 0) {
    selectedTool.value = tools.value[0].id;
  }
});

function handleSend() {
  if (!input.value.trim()) return;
  sendMessage(input.value, selectedTool.value ? [selectedTool.value] : []);
  input.value = '';
}

function handleClear() {
  clearChat();
}
</script>

<style scoped>
.chat-panel {
  max-width: 600px;
  margin: 0 auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 16px;
  background: #fafbfc;
}
.messages {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}
.msg {
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
}
.msg.user .role {
  color: #007bff;
}
.msg.assistant .role {
  color: #28a745;
}
.role {
  font-weight: bold;
  margin-right: 8px;
}
.input-area {
  display: flex;
  align-items: center;
  gap: 8px;
}
.input-area input {
  flex: 1;
  padding: 6px 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.input-area .tool-select {
  min-width: 120px;
}
.error {
  color: #d32f2f;
  margin-top: 8px;
}
</style>