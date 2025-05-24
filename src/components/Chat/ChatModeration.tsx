
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { chatService } from '@/services/chatService';
import { ChatMessage, ChatModerationAction, ChatSettings } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import { Trash, Ban, Volume, VolumeX } from 'lucide-react';

const ChatModeration = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [moderationHistory, setModerationHistory] = useState<ChatModerationAction[]>([]);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    slowMode: false,
    slowModeDelay: 10,
    bannedKeywords: [],
    autoDeleteKeywords: []
  });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [muteReason, setMuteReason] = useState('');
  const [muteDuration, setMuteDuration] = useState('30');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    loadMessages();
    loadChatSettings();
  }, []);

  const loadMessages = async () => {
    try {
      const messages = await chatService.getMessages();
      setMessages(messages.filter(msg => !msg.isDeleted));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadChatSettings = async () => {
    try {
      const settings = await chatService.getChatSettings();
      setChatSettings(settings);
    } catch (error) {
      console.error('Error loading chat settings:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      toast({
        title: "Message deleted",
        description: "The message has been removed from chat.",
      });
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Failed to delete message",
        description: "There was an error deleting the message.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDeleteUserMessages = async (userId: string, username: string) => {
    try {
      await chatService.bulkDeleteUserMessages(userId);
      toast({
        title: "Messages deleted",
        description: `All messages from ${username} have been removed.`,
      });
      loadMessages();
    } catch (error) {
      console.error('Error bulk deleting messages:', error);
      toast({
        title: "Failed to delete messages",
        description: "There was an error deleting the messages.",
        variant: "destructive"
      });
    }
  };

  const handleMuteUser = async (userId: string, username: string) => {
    if (!muteReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for muting the user.",
        variant: "destructive"
      });
      return;
    }

    try {
      const duration = parseInt(muteDuration);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + duration);

      await chatService.createModerationAction({
        userId,
        username,
        actionType: 'mute',
        reason: muteReason,
        duration,
        moderatorId: 'admin', // Replace with actual admin ID
        moderatorUsername: 'Admin',
        createdAt: new Date(),
        expiresAt
      });

      await chatService.updateUserModerationStatus(userId, {
        userId,
        username,
        isMuted: true,
        isBanned: false,
        muteExpiresAt: expiresAt
      });

      toast({
        title: "User muted",
        description: `${username} has been muted for ${duration} minutes.`,
      });
      
      setMuteReason('');
      setSelectedUserId('');
    } catch (error) {
      console.error('Error muting user:', error);
      toast({
        title: "Failed to mute user",
        description: "There was an error muting the user.",
        variant: "destructive"
      });
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    if (!muteReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for banning the user.",
        variant: "destructive"
      });
      return;
    }

    try {
      await chatService.createModerationAction({
        userId,
        username,
        actionType: 'ban',
        reason: muteReason,
        moderatorId: 'admin', // Replace with actual admin ID
        moderatorUsername: 'Admin',
        createdAt: new Date()
      });

      await chatService.updateUserModerationStatus(userId, {
        userId,
        username,
        isMuted: false,
        isBanned: true
      });

      toast({
        title: "User banned",
        description: `${username} has been permanently banned from chat.`,
      });
      
      setMuteReason('');
      setSelectedUserId('');
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Failed to ban user",
        description: "There was an error banning the user.",
        variant: "destructive"
      });
    }
  };

  const handleAddKeyword = (type: 'banned' | 'autoDelete') => {
    if (!newKeyword.trim()) return;

    const updatedSettings = { ...chatSettings };
    if (type === 'banned') {
      updatedSettings.bannedKeywords = [...updatedSettings.bannedKeywords, newKeyword.trim()];
    } else {
      updatedSettings.autoDeleteKeywords = [...updatedSettings.autoDeleteKeywords, newKeyword.trim()];
    }
    
    setChatSettings(updatedSettings);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string, type: 'banned' | 'autoDelete') => {
    const updatedSettings = { ...chatSettings };
    if (type === 'banned') {
      updatedSettings.bannedKeywords = updatedSettings.bannedKeywords.filter(k => k !== keyword);
    } else {
      updatedSettings.autoDeleteKeywords = updatedSettings.autoDeleteKeywords.filter(k => k !== keyword);
    }
    setChatSettings(updatedSettings);
  };

  const handleUpdateChatSettings = async () => {
    try {
      await chatService.updateChatSettings(chatSettings);
      toast({
        title: "Settings updated",
        description: "Chat moderation settings have been saved.",
      });
    } catch (error) {
      console.error('Error updating chat settings:', error);
      toast({
        title: "Failed to update settings",
        description: "There was an error saving the settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="bg-gray-800/50 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white">Chat Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-700/50">
            <TabsTrigger value="messages" className="text-white data-[state=active]:bg-green-600">Messages</TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-green-600">Settings</TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-green-600">History</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="mt-4">
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Message</TableHead>
                    <TableHead className="text-gray-300">Time</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.slice(0, 20).map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="text-white">{message.username}</TableCell>
                      <TableCell className="text-gray-300 max-w-xs truncate">{message.message}</TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMessage(message.id)}
                            className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                          >
                            <Trash className="w-3 h-3" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUserId(message.userId)}
                                className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                              >
                                <VolumeX className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-white">Moderate User: {message.username}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-gray-300">Reason</Label>
                                  <Textarea
                                    value={muteReason}
                                    onChange={(e) => setMuteReason(e.target.value)}
                                    placeholder="Enter reason for moderation action..."
                                    className="bg-gray-700/50 border-gray-600 text-white"
                                  />
                                </div>
                                <div>
                                  <Label className="text-gray-300">Mute Duration</Label>
                                  <Select value={muteDuration} onValueChange={setMuteDuration}>
                                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="1">1 minute</SelectItem>
                                      <SelectItem value="5">5 minutes</SelectItem>
                                      <SelectItem value="30">30 minutes</SelectItem>
                                      <SelectItem value="60">1 hour</SelectItem>
                                      <SelectItem value="1440">24 hours</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleMuteUser(message.userId, message.username)}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                                  >
                                    Mute User
                                  </Button>
                                  <Button
                                    onClick={() => handleBanUser(message.userId, message.username)}
                                    variant="destructive"
                                    className="flex-1"
                                  >
                                    Ban User
                                  </Button>
                                </div>
                                <Button
                                  onClick={() => handleBulkDeleteUserMessages(message.userId, message.username)}
                                  variant="outline"
                                  className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10"
                                >
                                  Delete All Messages from User
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Slow Mode</h3>
                  <p className="text-gray-400 text-sm">Limit message frequency</p>
                </div>
                <Switch
                  checked={chatSettings.slowMode}
                  onCheckedChange={(checked) => setChatSettings({ ...chatSettings, slowMode: checked })}
                />
              </div>
              
              {chatSettings.slowMode && (
                <div>
                  <Label className="text-gray-300">Delay between messages (seconds)</Label>
                  <Input
                    type="number"
                    value={chatSettings.slowModeDelay}
                    onChange={(e) => setChatSettings({ ...chatSettings, slowModeDelay: Number(e.target.value) })}
                    min="1"
                    max="300"
                    className="bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>
              )}

              <div>
                <h3 className="text-white font-medium mb-2">Banned Keywords</h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add banned keyword..."
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button onClick={() => handleAddKeyword('banned')} className="bg-red-600 hover:bg-red-700">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {chatSettings.bannedKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="bg-red-600/20 text-red-400 px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword, 'banned')}
                        className="text-red-300 hover:text-red-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white font-medium mb-2">Auto-Delete Keywords</h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add auto-delete keyword..."
                    className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Button onClick={() => handleAddKeyword('autoDelete')} className="bg-yellow-600 hover:bg-yellow-700">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {chatSettings.autoDeleteKeywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-sm flex items-center gap-1"
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword, 'autoDelete')}
                        className="text-yellow-300 hover:text-yellow-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <Button onClick={handleUpdateChatSettings} className="w-full bg-green-600 hover:bg-green-700">
                Save Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="text-center py-8">
              <p className="text-gray-400">Moderation history will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatModeration;
