import React, { type JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTheme: (theme: Theme) => void;
}

export default function ThemeSelectionModal({
  isOpen,
  onClose,
  onSelectTheme,
}: ThemeSelectionModalProps) {
  const themes: { id: Theme; label: string; icon: JSX.Element }[] = [
    { id: 'light', label: 'Light', icon: <Sun className="w-6 h-6" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-6 h-6" /> },
    { id: 'system', label: 'System', icon: <Monitor className="w-6 h-6" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Choose Your Theme
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Select your preferred theme for a better viewing experience
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {themes.map(({ id, label, icon }) => (
                  <motion.button
                    key={id}
                    onClick={() => {
                      onSelectTheme(id);
                      onClose();
                    }}
                    className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
                      {icon}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-6 text-center">
                <motion.button
                  onClick={onClose}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Maybe Later
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 