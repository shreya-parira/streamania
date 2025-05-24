
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChatMessage, ChatModerationAction, ChatSettings, UserModerationStatus } from '@/types/chat';

export const chatService = {
  // Send a message
  async sendMessage(message: Omit<ChatMessage, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'chatMessages'), message);
    return docRef.id;
  },

  // Get messages for a stream
  async getMessages(streamId?: string): Promise<ChatMessage[]> {
    let q = query(collection(db, 'chatMessages'), orderBy('timestamp', 'desc'));
    if (streamId) {
      q = query(collection(db, 'chatMessages'), where('streamId', '==', streamId), orderBy('timestamp', 'desc'));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatMessage));
  },

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    await updateDoc(doc(db, 'chatMessages', messageId), { isDeleted: true });
  },

  // Bulk delete messages from user
  async bulkDeleteUserMessages(userId: string): Promise<void> {
    const messages = await getDocs(query(collection(db, 'chatMessages'), where('userId', '==', userId)));
    const deletePromises = messages.docs.map(messageDoc => 
      updateDoc(messageDoc.ref, { isDeleted: true })
    );
    await Promise.all(deletePromises);
  },

  // Create moderation action
  async createModerationAction(action: Omit<ChatModerationAction, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'chatModerationActions'), action);
    return docRef.id;
  },

  // Get user moderation history
  async getUserModerationHistory(userId: string): Promise<ChatModerationAction[]> {
    const querySnapshot = await getDocs(
      query(collection(db, 'chatModerationActions'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ChatModerationAction));
  },

  // Get chat settings
  async getChatSettings(): Promise<ChatSettings> {
    const settingsDoc = await getDoc(doc(db, 'chatSettings', 'global'));
    if (settingsDoc.exists()) {
      return settingsDoc.data() as ChatSettings;
    }
    return {
      slowMode: false,
      slowModeDelay: 10,
      bannedKeywords: [],
      autoDeleteKeywords: []
    };
  },

  // Update chat settings
  async updateChatSettings(settings: ChatSettings): Promise<void> {
    await setDoc(doc(db, 'chatSettings', 'global'), settings);
  },

  // Check if user is moderated
  async getUserModerationStatus(userId: string): Promise<UserModerationStatus | null> {
    const statusDoc = await getDoc(doc(db, 'userModerationStatus', userId));
    if (statusDoc.exists()) {
      return statusDoc.data() as UserModerationStatus;
    }
    return null;
  },

  // Update user moderation status
  async updateUserModerationStatus(userId: string, status: UserModerationStatus): Promise<void> {
    await setDoc(doc(db, 'userModerationStatus', userId), status);
  }
};
