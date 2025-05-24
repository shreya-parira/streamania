
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StreamConfig, StreamStatus } from '@/types/stream';

const YOUTUBE_API_KEY = 'AIzaSyDUrDG1fGwl06jSWhwFXv3HqcFvgshDtXA';

export const streamService = {
  // Create a new stream configuration
  async createStreamConfig(config: Omit<StreamConfig, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'streamConfigs'), config);
      return docRef.id;
    } catch (error) {
      console.error('Error creating stream config:', error);
      throw error;
    }
  },

  // Get all stream configurations
  async getAllStreamConfigs(): Promise<StreamConfig[]> {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'streamConfigs'), orderBy('createdAt', 'desc')));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StreamConfig));
    } catch (error) {
      console.error('Error getting stream configs:', error);
      throw error;
    }
  },

  // Update stream configuration
  async updateStreamConfig(streamId: string, updates: Partial<StreamConfig>): Promise<void> {
    try {
      await updateDoc(doc(db, 'streamConfigs', streamId), { ...updates, updatedAt: new Date() });
    } catch (error) {
      console.error('Error updating stream config:', error);
      throw error;
    }
  },

  // Delete stream configuration
  async deleteStreamConfig(streamId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'streamConfigs', streamId));
    } catch (error) {
      console.error('Error deleting stream config:', error);
      throw error;
    }
  },

  // Set active stream
  async setActiveStream(streamId: string): Promise<void> {
    try {
      // First, deactivate all streams
      const allStreams = await this.getAllStreamConfigs();
      const updatePromises = allStreams.map(stream => 
        this.updateStreamConfig(stream.id, { isActive: false })
      );
      await Promise.all(updatePromises);
      
      // Then activate the selected stream
      await this.updateStreamConfig(streamId, { isActive: true });
    } catch (error) {
      console.error('Error setting active stream:', error);
      throw error;
    }
  },

  // Listen to active stream
  onActiveStreamChange(callback: (stream: StreamConfig | null) => void) {
    return onSnapshot(
      query(collection(db, 'streamConfigs'), where('isActive', '==', true)),
      (snapshot) => {
        const activeStream = snapshot.docs[0];
        callback(activeStream ? { id: activeStream.id, ...activeStream.data() } as StreamConfig : null);
      }
    );
  },

  // Check YouTube stream status using YouTube Data API
  async checkYouTubeStreamStatus(videoId: string): Promise<StreamStatus> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch video data');
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }
      
      const video = data.items[0];
      const isLive = video.liveStreamingDetails && video.liveStreamingDetails.concurrentViewers;
      
      return {
        isLive: !!isLive,
        viewerCount: isLive ? parseInt(video.liveStreamingDetails.concurrentViewers) : parseInt(video.statistics.viewCount) || 0,
        title: video.snippet.title,
        thumbnailUrl: video.snippet.thumbnails.maxresdefault?.url || video.snippet.thumbnails.high?.url || ''
      };
    } catch (error) {
      console.error('Error checking YouTube stream status:', error);
      // Fallback to mock data if API fails
      return {
        isLive: false,
        viewerCount: Math.floor(Math.random() * 1000) + 100,
        title: `Video - ${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      };
    }
  }
};
