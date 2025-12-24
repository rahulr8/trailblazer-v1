import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "firebase-auth" });

export const mmkvStorage = {
  getItem: (key: string): Promise<string | null> => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  setItem: (key: string, value: string): Promise<void> => {
    storage.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    storage.remove(key);
    return Promise.resolve();
  },
};
