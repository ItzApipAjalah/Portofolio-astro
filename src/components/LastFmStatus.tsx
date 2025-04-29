import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, BarChart3 } from 'lucide-react';

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

interface LastFmArtist {
  name: string;
  playcount: string;
  url: string;
  image: {
    '#text': string;
    size: string;
  }[];
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

interface TopArtistsResponse {
  artists: {
    artist: LastFmArtist[];
  };
}

export default function LastFmStatus() {
  const [track, setTrack] = useState<LastFmTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTopArtists, setShowTopArtists] = useState(false);
  const [topArtists, setTopArtists] = useState<LastFmArtist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);

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
    const interval = setInterval(fetchLastFmData, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchTopArtists = async () => {
    setIsLoadingArtists(true);
    try {
      const response = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=library.getartists&api_key=af9ea6476e6e1e0ba3e05d18f853e9ae&user=burung25&format=json&limit=10`
      );
      const data: TopArtistsResponse = await response.json();
      setTopArtists(data.artists.artist);
    } catch (error) {
      console.error('Error fetching top artists:', error);
    } finally {
      setIsLoadingArtists(false);
    }
  };

  useEffect(() => {
    if (showTopArtists && topArtists.length === 0) {
      fetchTopArtists();
    }
  }, [showTopArtists]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="w-48 h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-32 h-3 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-24 h-3 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!track) {
    return null;
  }

  const albumArt = track.image.find(img => img.size === 'extralarge')?.['#text'] || 
                  track.image.find(img => img.size === 'large')?.['#text'] || 
                  track.image[0]?.['#text'];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              {albumArt ? (
                <motion.img
                  src={albumArt}
                  alt={`${track.name} album art`}
                  className="w-16 h-16 rounded-xl object-cover shadow-md group-hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-300">
                  <Music className="w-8 h-8 text-white" />
                </div>
              )}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {track.name}
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-0.5">
                {track.artist['#text']}
              </p>
              {track.album['#text'] && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {track.album['#text']}
                </p>
              )}
            </div>
          </div>
          <motion.button
            onClick={() => setShowTopArtists(true)}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-4 relative group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="View Top Artists"
          >
            <BarChart3 className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
            <motion.div
              className="absolute inset-0 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
              transition={{ duration: 0.2 }}
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Top Artists Modal */}
      <AnimatePresence>
        {showTopArtists && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowTopArtists(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Top Artists</h3>
                <button
                  onClick={() => setShowTopArtists(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {isLoadingArtists ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="w-24 h-3 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {topArtists.map((artist, index) => (
                    <a
                      key={artist.name}
                      href={artist.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative">
                        <span className="absolute -top-1 -left-1 w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        {artist.image.find(img => img.size === 'large')?.['#text'] ? (
                          <img
                            src={artist.image.find(img => img.size === 'large')?.['#text']}
                            alt={artist.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{artist.name}</p>
                        <p className="text-sm text-gray-500">{artist.playcount} plays</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 