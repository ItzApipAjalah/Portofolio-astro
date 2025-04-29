import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface LastFmTrack {
  name: string;
  artist: {
    '#text': string;
  };
  album: {
    '#text': string;
  };
  image: {
    '#text': string;
    size: string;
  }[];
  date?: {
    uts: string;
    '#text': string;
  };
}

interface LastFmResponse {
  recenttracks: {
    track: LastFmTrack[];
    '@attr': {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}

export default function LastFmStatus() {
  const [track, setTrack] = useState<LastFmTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLastFmData = async () => {
      try {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=burung25&api_key=af9ea6476e6e1e0ba3e05d18f853e9ae&format=json&limit=1`
        );
        const data: LastFmResponse = await response.json();
        
        if (data.recenttracks?.track?.[0]) {
          setTrack(data.recenttracks.track[0]);
        }
      } catch (error) {
        console.error('Error fetching Last.fm data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastFmData();
    const interval = setInterval(fetchLastFmData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
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

  if (!track) {
    return null;
  }

  const albumArt = track.image.find(img => img.size === 'extralarge')?.['#text'] || 
                  track.image.find(img => img.size === 'extralarge')?.['#text'] || 
                  track.image[0]?.['#text'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-center gap-3">
        {albumArt ? (
          <img
            src={albumArt}
            alt={`${track.name} album art`}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Music className="w-5 h-5 text-white" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
            {track.name}
          </p>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">
            {track.artist['#text']}
          </p>
          {track.album['#text'] && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">
              {track.album['#text']}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
} 