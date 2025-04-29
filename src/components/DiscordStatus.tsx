import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Music, Headphones, Circle, Clock } from 'lucide-react';
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

export default function DiscordStatus() {
  const [discordData, setDiscordData] = useState<DiscordData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const fetchDiscordData = async () => {
      try {
        const response = await fetch('https://api.lanyard.rest/v1/users/481734993622728715');
        const data = await response.json();
        setDiscordData(data.data);
      } catch (error) {
        console.error('Error fetching Discord data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscordData();
    const interval = setInterval(fetchDiscordData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
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
        className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!discordData) {
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
      className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={`https://cdn.discordapp.com/avatars/481734993622728715/${discordData.discord_user.avatar}.png`}
            alt={discordData.discord_user.username}
            className="w-12 h-12 rounded-full"
          />
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(discordData.discord_status)}`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {discordData.discord_user.global_name || discordData.discord_user.username}
          </h3>
          <p className="text-sm text-gray-500">
            {discordData.discord_status.charAt(0).toUpperCase() + discordData.discord_status.slice(1)}
          </p>
        </div>
      </div>

      {discordData.listening_to_spotify && discordData.spotify && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Headphones className="w-4 h-4" />
            <span>Listening to Spotify</span>
          </div>
          
          <div className="flex space-x-4">
            <img
              src={discordData.spotify.album_art_url}
              alt={discordData.spotify.album}
              className="w-16 h-16 rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-medium text-gray-800 truncate">
                  {discordData.spotify.song}
                </p>
              </div>
              <p className="text-xs text-gray-600 truncate">
                {discordData.spotify.artist}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {discordData.spotify.album}
              </p>
              
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatDuration(currentTime - discordData.spotify.timestamps.start)}</span>
                  <span>{formatDuration(getTotalDuration(discordData.spotify.timestamps.start, discordData.spotify.timestamps.end))}</span>
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${calculateProgress(
                        discordData.spotify.timestamps.start,
                        discordData.spotify.timestamps.end
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!discordData.listening_to_spotify && discordData.activities.length > 0 && (
        <div className="mt-4">
          {discordData.activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {activity.name}
                </p>
                <p className="text-xs text-gray-500">
                  {activity.details || activity.state || 'Playing'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!discordData.listening_to_spotify && discordData.activities.length === 0 && (
        <LastFmStatus />
      )}
    </motion.div>
  );
} 