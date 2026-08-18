// IndexedDB 封装层

const DB_NAME = 'NocturneDB';
const DB_VERSION = 1;

// 数据库表
const STORES = {
  messages: 'messages',
  stickerGroups: 'stickerGroups',
  stickers: 'stickers',
  blobs: 'blobs', // 存储图片/文件的 blob 数据
};

let dbInstance: IDBDatabase | null = null;

// 初始化数据库
export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 消息表
      if (!db.objectStoreNames.contains(STORES.messages)) {
        const messageStore = db.createObjectStore(STORES.messages, { keyPath: 'id' });
        messageStore.createIndex('createdAt', 'createdAt', { unique: false });
        messageStore.createIndex('groupId', 'groupId', { unique: false });
      }

      // 表情包分组表
      if (!db.objectStoreNames.contains(STORES.stickerGroups)) {
        db.createObjectStore(STORES.stickerGroups, { keyPath: 'id' });
      }

      // 表情包表
      if (!db.objectStoreNames.contains(STORES.stickers)) {
        const stickerStore = db.createObjectStore(STORES.stickers, { keyPath: 'id' });
        stickerStore.createIndex('groupId', 'groupId', { unique: false });
      }

      // Blob 存储表（key: blob URL, value: blob 数据）
      if (!db.objectStoreNames.contains(STORES.blobs)) {
        db.createObjectStore(STORES.blobs, { keyPath: 'id' });
      }
    };
  });
}

// 通用增删改查操作
export async function dbGet<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function dbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(value);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbDelete(storeName: string, key: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// 按索引查询
export async function dbGetByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// 消息相关操作
export const messageDB = {
  async getAll() {
    return dbGetAll<any>(STORES.messages);
  },
  async add(message: any) {
    return dbPut(STORES.messages, message);
  },
  async update(message: any) {
    return dbPut(STORES.messages, message);
  },
  async delete(id: string) {
    return dbDelete(STORES.messages, id);
  },
  async getByGroupId(groupId: string) {
    return dbGetByIndex<any>(STORES.messages, 'groupId', groupId);
  },
};

// 表情包相关操作
export const stickerDB = {
  async getAllGroups() {
    return dbGetAll<any>(STORES.stickerGroups);
  },
  async addGroup(group: any) {
    return dbPut(STORES.stickerGroups, group);
  },
  async deleteGroup(id: string) {
    return dbDelete(STORES.stickerGroups, id);
  },
  async getStickers(groupId: string) {
    return dbGetByIndex<any>(STORES.stickers, 'groupId', groupId);
  },
  async addSticker(sticker: any) {
    return dbPut(STORES.stickers, sticker);
  },
  async deleteSticker(id: string) {
    return dbDelete(STORES.stickers, id);
  },
};

// Blob 相关操作
export const blobDB = {
  async save(id: string, blob: Blob) {
    return dbPut(STORES.blobs, { id, blob });
  },
  async get(id: string): Promise<Blob | undefined> {
    const result = await dbGet<{ id: string; blob: Blob }>(STORES.blobs, id);
    return result?.blob;
  },
  async delete(id: string) {
    return dbDelete(STORES.blobs, id);
  },
};
