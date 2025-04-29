import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Globe2, Percent, TrendingUp } from 'lucide-react';
import { createPortal } from 'react-dom';

interface CountryStats {
  country: string;
  total: number;
  percentage: string;
}

interface VisitorStats {
  visitor_count: number;
  countries: CountryStats[];
}

interface VisitorStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisitorStatsModal({ isOpen, onClose }: VisitorStatsModalProps) {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/visitors');
        if (!response.ok) {
          throw new Error('Failed to fetch visitor statistics');
        }
        const data = await response.json();
        // Sort countries by percentage in descending order
        data.countries.sort((a: CountryStats, b: CountryStats) => 
          parseFloat(b.percentage) - parseFloat(a.percentage)
        );
        setStats(data);
      } catch (err) {
        setError('Failed to load visitor statistics');
        console.error('Error fetching visitor stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-[9999] p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-xl">
              <Users className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Visitor Statistics</h3>
          </div>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </motion.button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
              <X className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <p className="text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : stats && (
          <>
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Visitors</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                  >
                    {stats.visitor_count.toLocaleString()}
                  </motion.p>
                </div>
                <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Countries</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", duration: 0.5, delay: 0.1 }}
                  >
                    {stats.countries.length}
                  </motion.p>
                </div>
              </div>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              <div className="flex items-center gap-2 px-4 mb-2">
                <TrendingUp className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">Top Countries</span>
              </div>
              
              {stats.countries.map((country, index) => (
                <motion.div
                  key={country.country}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5"
                    initial={{ width: "0%" }}
                    animate={{ width: `${parseFloat(country.percentage)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 dark:bg-blue-400/10 text-blue-500 dark:text-blue-400 font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{country.country}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {country.total.toLocaleString()} visitors
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-blue-500 dark:text-blue-400 text-lg">
                        {country.percentage}
                      </span>
                      <Percent className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>,
    document.body
  );
} 