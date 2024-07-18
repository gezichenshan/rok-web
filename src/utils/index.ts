export class CacheStorage {
  get(key: string) {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }
  set(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  remove(key: string) {
    localStorage.removeItem(key);
  }
  clearAll() {
    return localStorage.clear();
  }
}
export const cacheStorage = new CacheStorage();
