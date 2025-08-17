import { useState } from 'react';
import { Play, Pause, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Track } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface TrackTableProps {
  tracks: Track[];
  title?: string;
  showRank?: boolean;
  className?: string;
}

export function TrackTable({ tracks, title = "Tracks", showRank = true, className }: TrackTableProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const handlePlayPause = (track: Track) => {
    if (!track.preview_url) return;

    if (currentlyPlaying === track.id) {
      // Pause current track
      audioElements[track.id]?.pause();
      setCurrentlyPlaying(null);
    } else {
      // Stop any currently playing track
      if (currentlyPlaying && audioElements[currentlyPlaying]) {
        audioElements[currentlyPlaying].pause();
      }

      // Play new track
      if (!audioElements[track.id]) {
        const audio = new Audio(track.preview_url);
        audio.addEventListener('ended', () => setCurrentlyPlaying(null));
        setAudioElements(prev => ({ ...prev, [track.id]: audio }));
        audio.play();
      } else {
        audioElements[track.id].play();
      }
      setCurrentlyPlaying(track.id);
    }
  };

  const getArtistNames = (artists: Track['artists']) => {
    return artists.map(artist => artist.name).join(', ');
  };

  const getAlbumImage = (track: Track) => {
    return track.album.images?.[0]?.url || '/placeholder.svg';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{title}</span>
          <Badge variant="secondary">{tracks.length} tracks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className="group flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
            >
              {/* Rank */}
              {showRank && (
                <div className="w-8 text-center">
                  <span className="text-sm font-mono text-muted-foreground">
                    {track.rank || index + 1}
                  </span>
                </div>
              )}

              {/* Album Art & Play Button */}
              <div className="relative flex-shrink-0">
                <img
                  src={getAlbumImage(track)}
                  alt={track.album.name}
                  className="h-12 w-12 rounded-md object-cover"
                />
                {track.preview_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "absolute inset-0 h-12 w-12 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity",
                      currentlyPlaying === track.id && "opacity-100 bg-primary/80"
                    )}
                    onClick={() => handlePlayPause(track)}
                  >
                    {currentlyPlaying === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-foreground truncate">
                    {track.name}
                  </h4>
                  {currentlyPlaying === track.id && (
                    <div className="flex space-x-1">
                      <div className="h-3 w-1 bg-primary animate-pulse rounded-full" />
                      <div className="h-3 w-1 bg-primary animate-pulse rounded-full delay-100" />
                      <div className="h-3 w-1 bg-primary animate-pulse rounded-full delay-200" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {getArtistNames(track.artists)}
                </p>
              </div>

              {/* Album */}
              <div className="hidden md:block flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">
                  {track.album.name}
                </p>
              </div>

              {/* Release Year */}
              <div className="hidden lg:flex items-center space-x-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(track.album.release_date)}</span>
              </div>

              {/* Popularity */}
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <div className="w-12 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${track.popularity}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">
                    {track.popularity}
                  </span>
                </div>
              </div>

              {/* External Link */}
              <Button
                size="sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => window.open(track.external_urls.spotify, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}