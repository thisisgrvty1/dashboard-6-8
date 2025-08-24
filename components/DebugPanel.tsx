import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useDebug } from '../hooks/useDebug';

const DebugPanel: React.FC = () => {
  const { debugLogs, clearLogs, exportLogs } = useDebug();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warn': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Bug size={16} className="text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Debug Panel ({debugLogs.length})
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {isExpanded && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportLogs();
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Export logs"
                >
                  <Download size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearLogs();
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  title="Clear logs"
                >
                  <Trash2 size={14} className="text-gray-600 dark:text-gray-400" />
                </button>
              </>
            )}
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-96 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No debug logs yet
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {debugLogs.map((log) => (
                      <div key={log.id} className="p-3">
                        <div 
                          className="flex items-start space-x-2 cursor-pointer"
                          onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                        >
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getLevelColor(log.level)}`}>
                            {log.level.toUpperCase()}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(log.timestamp)}
                            </div>
                            <div className="text-sm text-gray-900 dark:text-white truncate">
                              {log.message}
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {selectedLog === log.id && log.data && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2 overflow-hidden"
                            >
                              <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32 text-gray-800 dark:text-gray-200">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DebugPanel;