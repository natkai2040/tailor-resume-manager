export const storage = {
  async set(key, value) {
    if (typeof window.storage !== 'undefined') {
      return await window.storage.set(key, value);
    } else {
      localStorage.setItem(key, value);
      return { key, value };
    }
  },
  async get(key) {
    if (typeof window.storage !== 'undefined') {
      return await window.storage.get(key);
    } else {
      const value = localStorage.getItem(key);
      return value ? { key, value } : null;
    }
  }
};