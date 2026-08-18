'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, MessageContent, MessageRole } from '@/types/message';
import { messageDB } from '@/lib/db';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载所有消息
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const msgs = await messageDB.getAll();
      // 按时间排序
      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(msgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // 添加消息
  const addMessage = useCallback(async (message: Message) => {
    await messageDB.add(message);
    setMessages((prev) => [...prev, message]);
  }, []);

  // 批量添加消息（AI 多条回复）
  const addMessages = useCallback(async (msgs: Message[]) => {
    for (const msg of msgs) {
      await messageDB.add(msg);
    }
    setMessages((prev) => [...prev, ...msgs]);
  }, []);

  // 更新消息（编辑）
  const updateMessage = useCallback(async (id: string, content: MessageContent) => {
    const message = messages.find((m) => m.id === id);
    if (!message) return;

    const updated = {
      ...message,
      content,
      editedAt: new Date().toISOString(),
    };

    await messageDB.update(updated);
    setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
  }, [messages]);

  // 删除消息
  const deleteMessage = useCallback(async (id: string) => {
    await messageDB.delete(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // 删除消息组（一次 AI 回复的所有消息）
  const deleteMessageGroup = useCallback(async (groupId: string) => {
    const groupMessages = messages.filter((m) => m.groupId === groupId);
    for (const msg of groupMessages) {
      await messageDB.delete(msg.id);
    }
    setMessages((prev) => prev.filter((m) => m.groupId !== groupId));
  }, [messages]);

  // 获取未回复的用户消息（用于判断是否显示「AI 回复」按钮）
  const getUnrepliedMessages = useCallback(() => {
    const result: Message[] = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') break; // 遇到 AI 消息就停止
      if (msg.role === 'user') result.unshift(msg);
    }
    return result;
  }, [messages]);

  return {
    messages,
    loading,
    addMessage,
    addMessages,
    updateMessage,
    deleteMessage,
    deleteMessageGroup,
    getUnrepliedMessages,
    reload: loadMessages,
  };
}
