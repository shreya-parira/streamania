
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Quiz, QuizAnswer } from '@/types/quiz';

export const quizService = {
  // Create a new quiz
  async createQuiz(quiz: Omit<Quiz, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'quizzes'), {
        ...quiz,
        createdAt: quiz.createdAt || new Date(),
        isActive: quiz.isActive || false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz. Please check your permissions.');
    }
  },

  // Get all quizzes
  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'quizzes'), orderBy('createdAt', 'desc')));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      } as Quiz));
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw new Error('Failed to fetch quizzes');
    }
  },

  // Update quiz status
  async updateQuizStatus(quizId: string, isActive: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'quizzes', quizId), { isActive });
    } catch (error) {
      console.error('Error updating quiz status:', error);
      throw new Error('Failed to update quiz status');
    }
  },

  // Submit quiz answer
  async submitAnswer(answer: Omit<QuizAnswer, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'quizAnswers'), {
        ...answer,
        submittedAt: answer.submittedAt || new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw new Error('Failed to submit answer');
    }
  },

  // Get answers for a quiz
  async getQuizAnswers(quizId: string): Promise<QuizAnswer[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'quizAnswers'), where('quizId', '==', quizId))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt?.toDate ? doc.data().submittedAt.toDate() : new Date(doc.data().submittedAt)
      } as QuizAnswer));
    } catch (error) {
      console.error('Error fetching quiz answers:', error);
      throw new Error('Failed to fetch quiz answers');
    }
  },

  // Listen to active quiz
  onActiveQuizChange(callback: (quiz: Quiz | null) => void) {
    return onSnapshot(
      query(collection(db, 'quizzes'), where('isActive', '==', true)),
      (snapshot) => {
        const activeQuiz = snapshot.docs[0];
        if (activeQuiz) {
          const data = activeQuiz.data();
          callback({
            id: activeQuiz.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
          } as Quiz);
        } else {
          callback(null);
        }
      }
    );
  }
};
