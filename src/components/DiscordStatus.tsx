import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Music, Headphones, Circle, Clock, Wifi, WifiOff } from 'lucide-react';
import LastFmStatus from './LastFmStatus';

interface DiscordActivity {
  name: string;
  type: number;
  details?: string;
  state?: string;
  timestamps?: {
    start?: number;
    end?: number;
  };
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  application_id?: string;
}

interface DiscordData {
  discord_user: {
    username: string;
    avatar: string;
    global_name: string;
  };
  activities: DiscordActivity[];
  discord_status: string;
  active_on_discord: boolean;
  spotify?: {
    album: string;
    album_art_url: string;
    artist: string;
    song: string;
    timestamps: {
      start: number;
      end: number;
    };
  };
  listening_to_spotify: boolean;
}

interface WebSocketMessage {
  op: number;
  d?: any;
  t?: string;
}

const DISCORD_ID = '481734993622728715';
const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_DELAY = 5000;
const MAX_RECONNECT_ATTEMPTS = 5;

export default function DiscordStatus() {
  const [discordData, setDiscordData] = useState<DiscordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback to REST API if WebSocket fails
  const fetchDiscordDataREST = async () => {
    try {
      const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
      const data = await response.json();
      if (data.success) {
        console.log('Fetched Discord data via REST:', data.data);
        setDiscordData(data.data);
        setIsLoading(false);
      } else {
        throw new Error('Failed to fetch Discord data');
      }
    } catch (error) {
      console.error('Error fetching Discord data via REST:', error);
      setError('Failed to fetch Discord data');
      setIsLoading(false);
    }
  };

  const connect = () => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }

      console.log('Attempting to connect to Lanyard WebSocket...');
      const ws = new WebSocket('wss://api.lanyard.rest/socket');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Lanyard WebSocket');
        setIsConnected(true);
        setReconnectAttempts(0);
        setError(null);
        
        // Subscribe to updates for specific Discord user
        const subscribeMessage = {
          op: 2,
          d: {
            subscribe_to_id: DISCORD_ID
          }
        };
        console.log('Sending subscribe message:', subscribeMessage);
        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', message);
          
          switch (message.op) {
            case 1: // Hello
              console.log('Received Hello message, starting heartbeat');
              if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
              }
              heartbeatIntervalRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ op: 3 }));
                  console.log('Sent heartbeat');
                }
              }, HEARTBEAT_INTERVAL);
              break;

            case 0: // Event
              if (message.t === 'INIT_STATE' || message.t === 'PRESENCE_UPDATE') {
                console.log('Received Discord data:', message.d);
                if (message.t === 'INIT_STATE') {
                  // For INIT_STATE, the data is directly in message.d
                  setDiscordData(message.d);
                  setIsLoading(false);
                } else if (message.t === 'PRESENCE_UPDATE' && message.d) {
                  // For PRESENCE_UPDATE, update the existing data
                  setDiscordData(prevData => ({
                    ...prevData,
                    ...message.d
                  }));
                  setIsLoading(false);
                }
              }
              break;

            default:
              console.log('Unhandled message type:', message.op);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          setError('Error processing WebSocket message');
        }
      };

      ws.onclose = (event) => {
        console.log('Disconnected from Lanyard WebSocket:', event.code, event.reason);
        setIsConnected(false);
        cleanup();

        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, RECONNECT_DELAY);
        } else {
          console.log('Max reconnection attempts reached, falling back to REST API');
          setError('WebSocket connection failed');
          fetchDiscordDataREST();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setError('Failed to connect to WebSocket');
      setIsLoading(false);
      fetchDiscordDataREST();
    }
  };

  const cleanup = () => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  // Initial connection
  useEffect(() => {
    connect();
    return cleanup;
  }, []);

  // Update current time every second for progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="space-y-3 flex-1">
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Connection Error</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setError(null);
              setIsLoading(true);
              connect();
            }}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
          </button>
        </div>
      </motion.div>
    );
  }

  if (!discordData || !discordData.discord_user) {
    return <LastFmStatus />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "idle":
        return "bg-yellow-500";
      case "dnd":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const calculateProgress = (start: number, end: number) => {
    const total = end - start;
    const current = currentTime - start;
    return Math.min(Math.max((current / total) * 100, 0), 100);
  };

  const getTotalDuration = (start: number, end: number) => {
    return end - start;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={`https://cdn.discordapp.com/avatars/${DISCORD_ID}/${discordData.discord_user.avatar}`}
              alt={discordData.discord_user.username}
              className="w-12 h-12 rounded-full border-2 border-white/20 dark:border-gray-700"
            />
            <div 
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(discordData.discord_status)}`} 
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {discordData.discord_user.global_name || discordData.discord_user.username}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {discordData.discord_status.charAt(0).toUpperCase() + discordData.discord_status.slice(1)}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ opacity: isConnected ? 1 : 0.5 }}
          title={isConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
          className="text-gray-400 dark:text-gray-500"
        >
          {isConnected ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4" />
          )}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {discordData.listening_to_spotify && discordData.spotify && (
          <motion.div
            key="spotify"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Headphones className="w-4 h-4" />
              <span>Listening to Spotify</span>
            </div>
            
            <div className="flex space-x-4">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={discordData.spotify.album_art_url}
                alt={discordData.spotify.album}
                className="w-16 h-16 rounded-xl object-cover shadow-md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {discordData.spotify.song}
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {discordData.spotify.artist}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {discordData.spotify.album}
                </p>
                
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatDuration(currentTime - discordData.spotify.timestamps.start)}</span>
                    <span>{formatDuration(getTotalDuration(discordData.spotify.timestamps.start, discordData.spotify.timestamps.end))}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${calculateProgress(
                          discordData.spotify.timestamps.start,
                          discordData.spotify.timestamps.end
                        )}%`
                      }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!discordData.listening_to_spotify && discordData.activities && discordData.activities.length > 0 && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {discordData.activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    {activity.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.details || activity.state || 'Playing'}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!discordData.listening_to_spotify && (!discordData.activities || discordData.activities.length === 0) && (
          <motion.div
            key="lastfm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LastFmStatus />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 