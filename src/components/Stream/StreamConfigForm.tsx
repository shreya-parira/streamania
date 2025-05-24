
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { streamService } from '@/services/streamService';
import { Youtube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StreamConfigFormProps {
  onStreamCreated: () => void;
}

interface FormData {
  title: string;
  platform: 'youtube';
  streamInput: string;
}

const StreamConfigForm: React.FC<StreamConfigFormProps> = ({ onStreamCreated }) => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<FormData>({
    defaultValues: {
      title: '',
      platform: 'youtube',
      streamInput: ''
    }
  });

  const extractVideoId = (input: string): string => {
    // If it's already a video ID (11 characters, alphanumeric)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }
    
    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    throw new Error('Invalid YouTube URL or video ID');
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const videoId = extractVideoId(data.streamInput);
      
      await streamService.createStreamConfig({
        title: data.title,
        platform: 'youtube',
        streamId: videoId,
        isActive: false,
        isLive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      toast({
        title: "Stream source added successfully",
        description: "Your stream has been configured and is ready to use.",
      });
      
      form.reset();
      onStreamCreated();
    } catch (error) {
      console.error('Error creating stream config:', error);
      toast({
        title: "Failed to add stream",
        description: error instanceof Error ? error.message : "There was an error adding the stream. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white">Add New Stream Source</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{ required: "Stream title is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Stream Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter stream title" 
                      className="bg-gray-700/50 border-gray-600 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="text-gray-300">Platform</FormLabel>
              <div className="flex items-center gap-2 p-3 bg-gray-700/50 border border-gray-600 rounded-md">
                <Youtube className="w-4 h-4 text-red-500" />
                <span className="text-white">YouTube</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="streamInput"
              rules={{ required: "YouTube URL or Video ID is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">YouTube URL or Video ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                      className="bg-gray-700/50 border-gray-600 text-white"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              {loading ? 'Creating...' : 'Add Stream Source'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StreamConfigForm;
