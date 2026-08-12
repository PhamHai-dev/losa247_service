let accessToken = '';
const listeners = new Set();
export const getAccessToken = () => accessToken;
export const setAccessToken = (token = '') => { accessToken = token; listeners.forEach((listener) => listener(token)); };
export const subscribeAccessToken = (listener) => { listeners.add(listener); return () => listeners.delete(listener); };
export const clearLegacyTokens = () => { localStorage.removeItem('losa_access_token'); localStorage.removeItem('losa_refresh_token'); };
