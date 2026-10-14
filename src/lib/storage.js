export const readLocal = (k) => { try { return window.localStorage.getItem(k); } catch { return null; } };
export const writeLocal = (k, v) => { try { window.localStorage.setItem(k, v); } catch { /* ignore */ } };
export const readSession = (k) => { try { return window.sessionStorage.getItem(k); } catch { return null; } };
export const writeSession = (k, v) => { try { window.sessionStorage.setItem(k, v); } catch { /* ignore */ } };
