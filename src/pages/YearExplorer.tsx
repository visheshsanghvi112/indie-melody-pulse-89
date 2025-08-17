import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Music, Disc3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrackTable } from '@/components/TrackTable';
import { apiService, Track, Artist, Genre } from '@/lib/apiClient';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';

const COLORS = ['#1DB954', '#1ed760', '#1aa34a', '#17853a', '#146b2e'];

export default function YearExplorer() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMarket, setSelectedMarket] = useState('IN');
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topGenres, setTopGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tracks');

  const years = Array.from({ length: 26 }, (_, i) => 2025 - i);
  const markets = [
    { value: 'IN', label: 'India' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
    { value: 'AU', label: 'Australia' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [];
      
      if (activeTab === 'tracks') {
        promises.push(
          apiService.getTopYear(selectedYear, selectedMarket)
            .then(response => setTopTracks(response.tracks || []))
            .catch(() => setTopTracks([]))
        );
      } else if (activeTab === 'artists') {
        promises.push(
          apiService.getTopArtists(selectedYear, selectedMarket)
            .then(response => setTopArtists(response.artists || []))
            .catch(() => setTopArtists([]))
        );
      } else if (activeTab === 'genres') {
        promises.push(
          apiService.getTopGenres(selectedYear, selectedMarket)
            .then(response => setTopGenres(response.genres || []))
            .catch(() => setTopGenres([]))
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to fetch year data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to load year data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMarket, activeTab]);

  const getChartData = () => {
    if (activeTab === 'tracks') {
      return topTracks.slice(0, 10).map((track, index) => ({
        name: track.name.length > 20 ? track.name.substring(0, 20) + '...' : track.name,
        popularity: track.popularity,
        rank: index + 1,
      }));
    } else if (activeTab === 'artists') {
      return topArtists.slice(0, 10).map((artist, index) => ({
        name: artist.name.length > 20 ? artist.name.substring(0, 20) + '...' : artist.name,
        popularity: artist.popularity,
        followers: artist.followers.total,
        rank: index + 1,
      }));
    } else if (activeTab === 'genres') {
      return topGenres.map(genre => ({
        name: genre.name,
        count: genre.count,
        percentage: genre.percentage,
      }));
    }
    return [];
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center glow-effect">
            <Calendar className="h-6 w-6 text-primary-foreground animate-music-note" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Year Explorer</h1>
            <p className="text-muted-foreground">
              Discover musical trends across different years and markets
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Year</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Market</label>
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {markets.map(market => (
                  <SelectItem key={market.value} value={market.value}>
                    {market.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button 
              onClick={fetchData} 
              disabled={loading}
              className="bg-gradient-primary hover:opacity-90 transition-all duration-300"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-in">
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="tracks" className="flex items-center space-x-2">
            <Music className="h-4 w-4" />
            <span>Top Tracks</span>
          </TabsTrigger>
          <TabsTrigger value="artists" className="flex items-center space-x-2">
            <Disc3 className="h-4 w-4" />
            <span>Top Artists</span>
          </TabsTrigger>
          <TabsTrigger value="genres" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Top Genres</span>
          </TabsTrigger>
        </TabsList>

        {/* Tracks Tab */}
        <TabsContent value="tracks" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-fade-in delay-100">
              <CardHeader>
                <CardTitle>Top Tracks Chart</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="popularity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Quick Stats
                  <Badge variant="secondary">{selectedYear}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{topTracks.length}</div>
                    <div className="text-sm text-muted-foreground">Total Tracks</div>
                  </div>
                  <div className="text-center p-4 bg-music-gold/5 rounded-lg">
                    <div className="text-2xl font-bold text-music-gold">
                      {topTracks.length > 0 ? Math.round(topTracks.reduce((acc, track) => acc + track.popularity, 0) / topTracks.length) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Popularity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          ) : (
            <TrackTable 
              tracks={topTracks} 
              title={`Top Tracks - ${selectedYear}`}
              className="animate-fade-in delay-300"
            />
          )}
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-fade-in delay-100">
              <CardHeader>
                <CardTitle>Artists Popularity</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={80}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="popularity" fill="hsl(var(--music-blue))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in delay-200">
              <CardHeader>
                <CardTitle>Top Artists List</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topArtists.slice(0, 5).map((artist, index) => (
                      <div key={artist.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <span className="text-sm font-mono text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <img
                          src={artist.images[0]?.url || '/placeholder.svg'}
                          alt={artist.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-foreground">{artist.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {artist.followers.total.toLocaleString()} followers
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {artist.popularity}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Genres Tab */}
        <TabsContent value="genres" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-fade-in delay-100">
              <CardHeader>
                <CardTitle>Genre Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-64 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="hsl(var(--primary))"
                        dataKey="percentage"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in delay-200">
              <CardHeader>
                <CardTitle>Genre Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topGenres.map((genre, index) => (
                      <div key={genre.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-mono text-muted-foreground w-6">
                            {index + 1}
                          </span>
                          <span className="font-medium text-foreground">{genre.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${genre.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">
                            {genre.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}