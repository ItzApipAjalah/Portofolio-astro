import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Headphones, Circle, Clock } from 'lucide-react';

interface DiscordStatus {
  d: {
    discord_user: {
      username: string;
      avatar: string;
      global_name: string;
    };
    activities: Array<{
      name: string;
      type: number;
      state: string;
      details: string;
      timestamps: {
        start: number;
        end: number;
      };
      assets: {
        large_image: string;
        large_text: string;
      };
    }>;
    discord_status: string;
    listening_to_spotify: boolean;
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
  };
}

export default function DiscordStatus() {
  const [status, setStatus] = useState<DiscordStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');
    let heartbeatInterval: number;

    ws.onopen = () => {
      // Subscribe to the user's presence
      ws.send(JSON.stringify({
        op: 2,
        d: {
          subscribe_to_id: "481734993622728715"
        }
      }));

      // Set up heartbeat
      heartbeatInterval = window.setInterval(() => {
        ws.send(JSON.stringify({ op: 3 }));
      }, 30000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
        setStatus(data);
        setLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setLoading(false);
    };

    ws.onclose = () => {
      clearInterval(heartbeatInterval);
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        setLoading(true);
      }, 5000);
    };

    return () => {
      ws.close();
      clearInterval(heartbeatInterval);
    };
  }, []);

  // Update current time every second for progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!status) return null;

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
      className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={`https://cdn.discordapp.com/avatars/481734993622728715/${status.d.discord_user.avatar}.png`}
            alt={status.d.discord_user.username}
            className="w-12 h-12 rounded-full"
          />
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${getStatusColor(status.d.discord_status)}`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {status.d.discord_user.global_name || status.d.discord_user.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {status.d.discord_status.charAt(0).toUpperCase() + status.d.discord_status.slice(1)}
          </p>
        </div>
      </div>

      {status.d.listening_to_spotify && status.d.spotify && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Headphones className="w-4 h-4" />
            <span>Listening to Spotify</span>
          </div>
          
          <div className="flex space-x-4">
            <img
              src={status.d.spotify.album_art_url}
              alt={status.d.spotify.album}
              className="w-16 h-16 rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {status.d.spotify.song}
                </p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {status.d.spotify.artist}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                {status.d.spotify.album}
              </p>
              
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatDuration(currentTime - status.d.spotify.timestamps.start)}</span>
                  <span>{formatDuration(getTotalDuration(status.d.spotify.timestamps.start, status.d.spotify.timestamps.end))}</span>
                </div>
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${calculateProgress(
                        status.d.spotify.timestamps.start,
                        status.d.spotify.timestamps.end
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 