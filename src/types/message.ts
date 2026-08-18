// 消息类型枚举
export type MessageType = 'text' | 'image' | 'file' | 'sticker';

// 消息角色
export type MessageRole = 'user' | 'assistant';

// 文件信息
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  url: string; // blob URL 或远程 URL
  extractedText?: string; // 解析出的文本内容（PDF/Word/PPT）
}

// 图片信息
export interface ImageInfo {
  url: string; // blob URL 或远程 URL
  width?: number;
  height?: number;
  alt?: string;
}

// 表情包信息
export interface StickerInfo {
  id: string; // 表情包 ID
  url: string;
  description: string; // 表情释义
  groupId?: string; // 所属分组
}

// 引用信息
export interface QuoteInfo {
  messageId: string; // 被引用的消息 ID
  content: string; // 引用内容预览（纯文本，截取前 100 字）
  senderRole: MessageRole;
}

// 消息内容（联合类型）
export interface MessageContent {
  text?: string; // 文本内容
  image?: ImageInfo; // 图片
  file?: FileInfo; // 文件
  sticker?: StickerInfo; // 表情包
  quote?: QuoteInfo; // 引用的消息
}

// 消息主体
export interface Message {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: MessageContent;
  createdAt: string; // ISO 时间戳
  editedAt?: string; // 编辑时间
  groupId?: string; // 消息组 ID（同一轮对话的多条消息共享）
}

// 消息组（一次 AI 回复可能包含多条消息）
export interface MessageGroup {
  id: string;
  messages: Message[];
  createdAt: string;
}

// 表情包分组
export interface StickerGroup {
  id: string;
  name: string;
  stickers: StickerInfo[];
  createdAt: string;
}
