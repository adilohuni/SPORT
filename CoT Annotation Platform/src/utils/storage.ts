import { RunData } from '../App';

const DB_NAME = 'PromptGridStudio';
const DB_VERSION = 1;
const STORE_NAME = 'runs';

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('lastModified', 'lastModified', { unique: false });
      }
    };
  });
};

// Save a run to IndexedDB
export const saveRun = async (run: RunData): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(run);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => db.close();
  });
};

// Load a run from IndexedDB by ID
export const loadRun = async (id: string): Promise<RunData | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result;
      if (result) {
        // Convert date strings back to Date objects
        result.lastModified = new Date(result.lastModified);
        result.comments = result.comments.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
          replies: c.replies.map((r: any) => ({
            ...r,
            timestamp: new Date(r.timestamp),
          })),
        }));
      }
      resolve(result || null);
    };

    transaction.oncomplete = () => db.close();
  });
};

// Load all runs from IndexedDB
export const loadAllRuns = async (): Promise<RunData[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result.map((run: any) => ({
        ...run,
        lastModified: new Date(run.lastModified),
        comments: run.comments.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
          replies: c.replies.map((r: any) => ({
            ...r,
            timestamp: new Date(r.timestamp),
          })),
        })),
      }));
      resolve(results);
    };

    transaction.oncomplete = () => db.close();
  });
};

// Delete a run from IndexedDB
export const deleteRun = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => db.close();
  });
};

// Clear all runs from IndexedDB
export const clearAllRuns = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();

    transaction.oncomplete = () => db.close();
  });
};
