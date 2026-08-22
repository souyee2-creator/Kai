'use client';

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/message';
import { formatFileSize } from '@/lib/message-utils';

interface Props {
  message: Message;
  isFirst: boolean;
  isLast: boolean;
  onQuote?: (message: Message) => void;
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (message: Message) => void;
  onReroll?: (message: Message) => void;
}

export default function MessageBubble({
  message,
  isFirst,
  isLast,
  onQuote,
  onEdit,
  onDelete,
  onReroll,
}: Props) {
  const isUser = message.role === 'user';
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content.text || '');
  const [menuPosition, setMenuPosition] = useState<'above' | 'below'>('below');
  const menuRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  // 气泡圆角：连续消息中间的气泡圆角更小
  const getBubbleRadius = () => {
    if (isUser) {
      if (isFirst && isLast) return 'rounded-2xl rounded-br-md';
      if (isFirst) return 'rounded-2xl rounded-br-md';
      if (isLast) return 'rounded-2xl rounded-tr-md';
      return 'rounded-2xl rounded-tr-md rounded-br-md';
    } else {
      if (isFirst && isLast) return 'rounded-2xl rounded-bl-md';
      if (isFirst) return 'rounded-2xl rounded-bl-md';
      if (isLast) return 'rounded-2xl rounded-tl-md';
      return 'rounded-2xl rounded-tl-md rounded-bl-md';
    }
  };

  // 长按显示菜单，自动判断显示在上方还是下方
  const handleLongPress = () => {
    if (!editing) {
      if (bubbleRef.current) {
        const rect = bubbleRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        // 如果气泡底部距视口底部不足 120px，菜单显示在上方
        if (viewportHeight - rect.bottom < 120) {
          setMenuPosition('above');
        } else {
          setMenuPosition('below');
        }
      }
      setShowMenu(true);
    }
  };

  // 点击外部关闭菜单
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: TouchEvent | MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // 复制文本
  const handleCopy = () => {
    const text =
      message.content.text ||
      message.content.sticker?.description ||
      message.content.file?.name ||
      '';
    navigator.clipboard.writeText(text);
    setShowMenu(false);
  };

  // 引用
  const handleQuote = () => {
    onQuote?.(message);
    setShowMenu(false);
  };

  // 编辑
  const handleEditStart = () => {
    setEditing(true);
    setShowMenu(false);
  };
  const handleEditSave = () => {
    if (editText.trim() && editText !== message.content.text) {
      onEdit?.(message.id, editText.trim());
    }
    setEditing(false);
  };
  const handleEditCancel = () => {
    setEditText(message.content.text || '');
    setEditing(false);
  };

  // 删除
  const handleDelete = () => {
    onDelete?.(message);
    setShowMenu(false);
  };

  // 重新生成
  const handleReroll = () => {
    onReroll?.(message);
    setShowMenu(false);
  };

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* AI 头像 */}
      {!isUser && (
        <div className="w-8 shrink-0">
          {isLast && (
            <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-medium">K</span>
            </div>
          )}
        </div>
      )}

      <div className="relative flex flex-col gap-1">
        {/* 引用预览 */}
        {message.content.quote && (
          <div className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200 max-w-[280px]">
            <span className="font-medium">
              {message.content.quote.senderRole === 'user' ? '我' : 'Kai'}:
            </span>{' '}
            {message.content.quote.content}
          </div>
        )}

        {/* 消息气泡 */}
        <div
          ref={bubbleRef}
          className={`relative max-w-[280px] select-none ${getBubbleRadius()} ${
            isUser ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
          }`}
          onContextMenu={(e) => {
            e.preventDefault();
            handleLongPress();
          }}
          onTouchStart={(e) => {
            // 阻止系统文字选择
            e.currentTarget.style.webkitUserSelect = 'none';
            const timer = setTimeout(handleLongPress, 500);
            const cancel = () => clearTimeout(timer);
            document.addEventListener('touchend', cancel, { once: true });
            document.addEventListener('touchmove', cancel, { once: true });
          }}
        >
          {/* 文本消息 */}
          {message.type === 'text' && !editing && (
            <div className="px-3.5 py-2 text-[15px] leading-relaxed">
              <p className="whitespace-pre-wrap break-words">{message.content.text}</p>
            </div>
          )}

          {/* 编辑模式 */}
          {editing && (
            <div className="p-2 select-text">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full min-h-[60px] px-2 py-1 text-[15px] bg-white text-gray-900 border border-gray-300 rounded-lg resize-none outline-none"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEditSave}
                  className="flex-1 px-3 py-1 text-sm bg-gray-900 text-white rounded-lg"
                >
                  保存
                </button>
                <button
                  onClick={handleEditCancel}
                  className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-900 rounded-lg"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* 图片消息 */}
          {message.type === 'image' && message.content.image && (
            <div className="p-1">
              <img
                src={message.content.image.url}
                alt={message.content.image.alt || '图片'}
                className="max-w-full rounded-lg"
              />
            </div>
          )}

          {/* 表情包消息 */}
          {message.type === 'sticker' && message.content.sticker && (
            <div className="p-2">
              <img
                src={message.content.sticker.url}
                alt={message.content.sticker.description}
                className="w-32 h-32 object-contain"
              />
            </div>
          )}

          {/* 文件消息 */}
          {message.type === 'file' && message.content.file && (
            <div className="px-3.5 py-2 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                  <polyline points="13 2 13 9 20 9"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium truncate">{message.content.file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(message.content.file.size)}</p>
              </div>
            </div>
          )}
        </div>

        {/* 长按菜单 - 横向排列 */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-[60]"
              onClick={() => setShowMenu(false)}
            />
            <div
              ref={menuRef}
              className="absolute z-[70] bg-white rounded-xl shadow-lg border border-gray-200 px-1 py-1.5 flex items-center gap-0.5"
              style={{
                [isUser ? 'right' : 'left']: 0,
                ...(menuPosition === 'above'
                  ? { bottom: '100%', marginBottom: '4px' }
                  : { top: '100%', marginTop: '4px' }),
              }}
            >
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap"
              >
                复制
              </button>
              <button
                onClick={handleQuote}
                className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap"
              >
                引用
              </button>
              {isUser && message.type === 'text' && (
                <button
                  onClick={handleEditStart}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap"
                >
                  编辑
                </button>
              )}
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg whitespace-nowrap"
              >
                删除
              </button>
              {!isUser && message.groupId && (
                <button
                  onClick={handleReroll}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg whitespace-nowrap"
                >
                  重新生成
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* 用户头像 */}
      {isUser && (
        <div className="w-8 shrink-0">
          {isLast && (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 text-xs font-medium">我</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
