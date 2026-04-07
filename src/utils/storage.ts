export const safeSetItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e: any) {
    if (e.name === 'QuotaExceededError') {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Storage full. Delete old invoices to free space.", variant: "error" } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('app-toast', { 
        detail: { message: "Could not save. Check browser settings.", variant: "error" } 
      }));
    }
    return false;
  }
};

export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // ignore
  }
};
