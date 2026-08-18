import { Message, MessageType, MessageRole, MessageContent, QuoteInfo } from '@/types/message';

// 生成唯一 ID
export function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// 创建文本消息
export function createTextMessage(
  role: MessageRole,
  text: string,
  options?: {
    quote?: QuoteInfo;
    groupId?: string;
  }
): Message {
  return {
    id: genId(),
    role,
    type: 'text',
    content: {
      text,
      quote: options?.quote,
    },
    createdAt: new Date().toISOString(),
    groupId: options?.groupId,
  };
}

// 创建图片消息
export function createImageMessage(
  role: MessageRole,
  url: string,
  options?: {
    quote?: QuoteInfo;
    groupId?: string;
    alt?: string;
    width?: number;
    height?: number;
  }
): Message {
  return {
    id: genId(),
    role,
    type: 'image',
    content: {
      image: {
        url,
        alt: options?.alt,
        width: options?.width,
        height: options?.height,
      },
      quote: options?.quote,
    },
    createdAt: new Date().toISOString(),
    groupId: options?.groupId,
  };
}

// 创建表情包消息
export function createStickerMessage(
  role: MessageRole,
  sticker: { id: string; url: string; description: string; groupId?: string },
  options?: {
    groupId?: string;
  }
): Message {
  return {
    id: genId(),
    role,
    type: 'sticker',
    content: {
      sticker: {
        id: sticker.id,
        url: sticker.url,
        description: sticker.description,
        groupId: sticker.groupId,
      },
    },
    createdAt: new Date().toISOString(),
    groupId: options?.groupId,
  };
}

// 创建文件消息
export function createFileMessage(
  role: MessageRole,
  file: { name: string; size: number; type: string; url: string; extractedText?: string },
  options?: {
    quote?: QuoteInfo;
    groupId?: string;
  }
): Message {
  return {
    id: genId(),
    role,
    type: 'file',
    content: {
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
        extractedText: file.extractedText,
      },
      quote: options?.quote,
    },
    createdAt: new Date().toISOString(),
    groupId: options?.groupId,
  };
}

// 截取引用预览文本
export function createQuoteInfo(message: Message): QuoteInfo {
  let preview = '';

  if (message.content.text) {
    preview = message.content.text.slice(0, 100);
  } else if (message.content.image) {
    preview = '[图片]';
  } else if (message.content.sticker) {
    preview = `[表情] ${message.content.sticker.description}`;
  } else if (message.content.file) {
    preview = `[文件] ${message.content.file.name}`;
  }

  return {
    messageId: message.id,
    content: preview,
    senderRole: message.role,
  };
}

// 格式化文件大小
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
