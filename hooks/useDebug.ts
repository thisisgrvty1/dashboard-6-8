import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface DebugLog {
  id: string;
  timestamp: string;
  level: 'log' | 'warn' | 'error';
  message: string;
  data?: any;
}

export const useDebug = () => {
  const [isDebugEnabled, setIsDebugEnabled] = useLocalStorage<boolean>('debug_enabled', false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addLog = useCallback((level: 'log' | 'warn' | 'error', message: string, data?: any) => {
    if (!isDebugEnabled) return;

    const logEntry: DebugLog = {
      id: `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    // Also log to browser console
    const consoleMethod = level === 'log' ? console.log : level === 'warn' ? console.warn : console.error;
    if (data !== undefined) {
      consoleMethod(`[DEBUG] ${message}`, data);
    } else {
      consoleMethod(`[DEBUG] ${message}`);
    }

    setDebugLogs(prev => [logEntry, ...prev].slice(0, 1000)); // Keep last 1000 logs
  }, [isDebugEnabled]);

  const debugLog = useCallback((message: string, data?: any) => {
    addLog('log', message, data);
  }, [addLog]);

  const debugWarn = useCallback((message: string, data?: any) => {
    addLog('warn', message, data);
  }, [addLog]);

  const debugError = useCallback((message: string, data?: any) => {
    addLog('error', message, data);
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    const logsJson = JSON.stringify(debugLogs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [debugLogs]);

  return {
    isDebugEnabled,
    setIsDebugEnabled,
    debugLogs,
    debugLog,
    debugWarn,
    debugError,
    clearLogs,
    exportLogs
  };
};