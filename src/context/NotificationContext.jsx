import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    isLoading: false
  });

  const showStatus = useCallback(({ type = 'success', title, message, isLoading = false }) => {
    setConfig({ type, title, message, isLoading });
    setIsOpen(true);
  }, []);

  const hideStatus = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Promise-based helper to mimic toast.promise behavior
  const showPromise = useCallback(async (promise, { loading, success, error }) => {
    showStatus({ type: 'loading', title: 'Processing', message: loading, isLoading: true });
    
    try {
      const result = await promise;
      showStatus({ 
        type: 'success', 
        title: typeof success === 'function' ? success(result).title : 'Success',
        message: typeof success === 'function' ? success(result).message : success,
        isLoading: false 
      });
      return result;
    } catch (err) {
      showStatus({ 
        type: 'error', 
        title: 'Operation Failed',
        message: typeof error === 'function' ? error(err) : (err.message || error),
        isLoading: false 
      });
      throw err;
    }
  }, [showStatus]);

  return (
    <NotificationContext.Provider value={{ isOpen, ...config, showStatus, hideStatus, showPromise }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
