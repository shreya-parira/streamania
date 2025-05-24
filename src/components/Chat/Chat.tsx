
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatProps {
  streamId: string;
}

const Chat: React.FC<ChatProps> = ({ streamId }) => {
  const { userData } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', username: 'QuizMaster', message: 'Welcome to the stream!', timestamp: '10:30', isAdmin: true },
    { id: '2', username: 'StreamFan23', message: 'Ready for the quiz!', timestamp: '10:31', isAdmin: false },
    { id: '3', username: 'Player101', message: 'Good luck everyone!', timestamp: '10:32', isAdmin: false },
    { id: '4', username: 'QuizMaster', message: 'First question coming up in 30 seconds', timestamp: '10:33', isAdmin: true },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        username: userData?.username || 'Anonymous',
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        isAdmin: userData?.isAdmin || false
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-green-500/20 h-full">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Live Chat
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">{messages.length} messages</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium flex items-center gap-1 ${
                    msg.isAdmin ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {msg.isAdmin && <Shield className="w-3 h-3" />}
                    {msg.username}
                    {msg.isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                  </span>
                  <span className="text-gray-500 text-xs">{msg.timestamp}</span>
                </div>
                <div className="text-gray-300 text-sm pl-4">{msg.message}</div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={userData?.isAdmin ? "Send admin message..." : "Type your message..."}
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
            <Button 
              onClick={handleSendMessage}
              className={userData?.isAdmin ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {userData?.isAdmin && (
            <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin privileges active
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Chat;
