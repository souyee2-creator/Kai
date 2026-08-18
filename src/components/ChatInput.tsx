'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { QuoteInfo } from '@/types/message';

interface Props {
  onSendText: (text: string) => void;
  onAiReply: () => void;
  quotedMessage: QuoteInfo | null;
  onClearQuote: () => void;
  aiReplying?: boolean;
  unrepliedCount?: number;
  disabled?: boolean;
}

export default function ChatInput({
  onSendText,
  onAiReply,
  quotedMessage,
  onClearQuote,
  aiReplying,
  unrepliedCount = 0,
  disabled,
}: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText('');
  }, [text, onSendText]);

  const showAiReplyButton = unrepliedCount > 0;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 bg-white border-t border-gray-100">
      {/* 引用预览 */}
      {quotedMessage && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">
              回复 {quotedMessage.senderRole === 'user' ? '我' : 'Kai'}
            </p>
            <p className="text-sm text-gray-900 truncate">{quotedMessage.content}</p>
          </div>
          <button
            onClick={onClearQuote}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
            aria-label="取消引用"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* AI 回复按钮 */}
      {showAiReplyButton && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <button
            onClick={onAiReply}
            disabled={aiReplying}
            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {aiReplying ? '回复中...' : `让 Kai 回复 (${unrepliedCount} 条未读)`}
          </button>
        </div>
      )}

      {/* 输入区 */}
      <div className="px-4 py-3">
        <div className="mx-auto flex max-w-md items-end gap-2">
          {/* 附件按钮（占位） */}
          <button
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="添加附件"
            title="图片、文件（开发中）"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </button>

          {/* 输入框 */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 resize-none overflow-hidden rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-[15px] text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:bg-white transition-colors"
            disabled={disabled || aiReplying}
            aria-label="消息输入框"
          />

          {/* 表情按钮（占位） */}
          <button
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="表情包"
            title="表情包（开发中）"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </button>

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={disabled || aiReplying || !text.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-opacity disabled:opacity-20"
            aria-label="发送消息"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
