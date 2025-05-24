
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Eye, Youtube } from 'lucide-react';
import { streamService } from '@/services/streamService';
import { StreamConfig } from '@/types/stream';
import Chat from '@/components/Chat/Chat';

interface LiveStreamProps {
  streamId?: string;
  showChat?: boolean;
}

const LiveStream: React.FC<LiveStreamProps> = ({ streamId, showChat = true }) => {
  const [activeStream, setActiveStream] = useState<StreamConfig | null>(null);
  const [viewerCount, setViewerCount] = useState(1247);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const unsubscribe = streamService.onActiveStreamChange((stream) => {
      setActiveStream(stream);
      if (stream) {
        // Check stream status immediately
        checkStreamStatus(stream);
        
        // Update viewer count periodically
        const interval = setInterval(async () => {
          await checkStreamStatus(stream);
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
      } else {
        setIsOnline(false);
      }
    });

    return unsubscribe;
  }, []);

  const checkStreamStatus = async (stream: StreamConfig) => {
    try {
      const status = await streamService.checkYouTubeStreamStatus(stream.streamId);
      setViewerCount(status.viewerCount);
      setIsOnline(status.isLive);
      
      // Update stream status in database
      await streamService.updateStreamConfig(stream.id, {
        isLive: status.isLive,
        viewerCount: status.viewerCount
      });
    } catch (error) {
      console.error('Error updating stream status:', error);
      setIsOnline(false);
    }
  };

  const getEmbedUrl = (stream: StreamConfig) => {
    return `https://www.youtube.com/embed/${stream.streamId}?autoplay=1&mute=1`;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 backdrop-blur-sm border-green-500/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              {activeStream ? (
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  {activeStream.title}
                </div>
              ) : (
                'Live Quiz Championship'
              )}
            </CardTitle>
            <div className="flex items-center gap-2 text-gray-300">
              <Eye className="w-4 h-4" />
              <span>{viewerCount.toLocaleString()} viewers</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
            {activeStream ? (
              <iframe
                src={getEmbedUrl(activeStream)}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-white text-lg font-medium">No Active Stream</div>
                  <div className="text-gray-400">Waiting for admin to start a stream</div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              {isOnline ? 'Stream is online' : 'Stream offline'}
            </span>
            <span>
              {activeStream ? 'YouTube • HD' : 'No source'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Chat section - only show if stream is online and chat is enabled */}
      {showChat && isOnline && activeStream && (
        <Chat streamId={activeStream.id} />
      )}
    </div>
  );
};

export default LiveStream;
