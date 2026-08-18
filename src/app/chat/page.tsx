'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/message';
import MessageList from '@/components/MessageList';
import ChatInput from '@/components/ChatInput';

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '在。',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    role: 'assistant',
    content: '想聊什么',
    createdAt: new Date().toISOString(),
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 scrollbar-hide">
        <MessageList messages={messages} />
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
}
