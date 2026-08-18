'use client';

import { useRef, useEffect, useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { createTextMessage, createQuoteInfo, genId } from '@/lib/message-utils';
import { Message, QuoteInfo } from '@/types/message';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';

export default function ChatPage() {
  const {
    messages,
    loading,
    addMessage,
    addMessages,
    updateMessage,
    deleteMessage,
    deleteMessageGroup,
    getUnrepliedMessages,
  } = useMessages();

  const bottomRef = useRef<HTMLDivElement>(null);
  const [quotedMessage, setQuotedMessage] = useState<QuoteInfo | null>(null);
  const [aiReplying, setAiReplying] = useState(false);

  // 自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 发送文本消息
  const handleSendText = async (text: string) => {
    const message = createTextMessage('user', text, {
      quote: quotedMessage || undefined,
    });
    await addMessage(message);
    setQuotedMessage(null);
  };

  // AI 回复（占位，后续实现）
  const handleAiReply = async () => {
    const unreplied = getUnrepliedMessages();
    if (unreplied.length === 0) return;

    setAiReplying(true);
    try {
      // TODO: 调用 AI API
      // 这里先模拟回复
      const groupId = genId();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const reply1 = createTextMessage('assistant', '收到', { groupId });
      const reply2 = createTextMessage('assistant', '这个我得想想', { groupId });
      await addMessages([reply1, reply2]);
    } catch (error) {
      console.error('AI reply failed:', error);
    } finally {
      setAiReplying(false);
    }
  };

  // 引用消息
  const handleQuote = (message: Message) => {
    setQuotedMessage(createQuoteInfo(message));
  };

  // 编辑消息
  const handleEdit = async (id: string, newText: string) => {
    await updateMessage(id, { text: newText });
  };

  // 删除消息
  const handleDelete = async (message: Message) => {
    await deleteMessage(message.id);
  };

  // 重新生成（删除整组消息，重新触发 AI）
  const handleReroll = async (message: Message) => {
    if (message.groupId) {
      await deleteMessageGroup(message.groupId);
      await handleAiReply();
    }
  };

  const unrepliedCount = getUnrepliedMessages().length;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-32 scrollbar-hide">
        <MessageList
          messages={messages}
          onQuote={handleQuote}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReroll={handleReroll}
        />
        <div ref={bottomRef} />
      </div>
      <ChatInput
        onSendText={handleSendText}
        onAiReply={handleAiReply}
        quotedMessage={quotedMessage}
        onClearQuote={() => setQuotedMessage(null)}
        aiReplying={aiReplying}
        unrepliedCount={unrepliedCount}
      />
    </div>
  );
}
