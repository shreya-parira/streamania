
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { streamService } from '@/services/streamService';
import { StreamConfig } from '@/types/stream';
import { Play, Square, Trash2, Youtube, Twitch, Eye } from 'lucide-react';
import StreamConfigForm from './StreamConfigForm';

const StreamManager: React.FC = () => {
  const [streams, setStreams] = useState<StreamConfig[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStreams = async () => {
    setLoading(true);
    try {
      const streamData = await streamService.getAllStreamConfigs();
      setStreams(streamData);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();
  }, []);

  const handleActivateStream = async (streamId: string) => {
    try {
      await streamService.setActiveStream(streamId);
      await loadStreams();
    } catch (error) {
      console.error('Error activating stream:', error);
    }
  };

  const handleDeactivateStream = async (streamId: string) => {
    try {
      await streamService.updateStreamConfig(streamId, { isActive: false });
      await loadStreams();
    } catch (error) {
      console.error('Error deactivating stream:', error);
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    if (window.confirm('Are you sure you want to delete this stream configuration?')) {
      try {
        await streamService.deleteStreamConfig(streamId);
        await loadStreams();
      } catch (error) {
        console.error('Error deleting stream:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <StreamConfigForm onStreamCreated={loadStreams} />
      
      <Card className="bg-gray-800/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex justify-between items-center">
            Stream Sources
            <Button onClick={loadStreams} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {streams.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Platform</TableHead>
                  <TableHead className="text-gray-300">Title</TableHead>
                  <TableHead className="text-gray-300">Stream ID</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Viewers</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {streams.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell className="text-white">
                      <div className="flex items-center gap-2">
                        {stream.platform === 'youtube' ? (
                          <Youtube className="w-4 h-4 text-red-500" />
                        ) : (
                          <Twitch className="w-4 h-4 text-purple-500" />
                        )}
                        {stream.platform}
                      </div>
                    </TableCell>
                    <TableCell className="text-white">{stream.title}</TableCell>
                    <TableCell className="text-gray-300">{stream.streamId}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {stream.isActive && (
                          <Badge className="bg-green-600">Active</Badge>
                        )}
                        <Badge variant={stream.isLive ? "default" : "secondary"}>
                          {stream.isLive ? 'Live' : 'Offline'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {stream.viewerCount && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {stream.viewerCount.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {stream.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivateStream(stream.id)}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            <Square className="w-3 h-3" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateStream(stream.id)}
                            className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStream(stream.id)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No stream sources configured yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamManager;
