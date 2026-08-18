import { Message } from '@/types/message';

interface Props {
  message: Message;
  isFirst: boolean; // 是否是这组连续消息的第一条（显示头像）
  isLast: boolean;  // 是否是这组连续消息的最后一条（气泡圆角不同）
}

export default function MessageBubble({ message, isFirst, isLast }: Props) {
  const isUser = message.role === 'user';

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

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* 头像占位 */}
      {!isUser && (
        <div className="w-8 shrink-0">
          {isLast && (
            <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-white text-xs font-medium">K</span>
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-[65%] px-3.5 py-2 text-[15px] leading-relaxed ${getBubbleRadius()} ${
          isUser
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {/* 用户头像占位 */}
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
