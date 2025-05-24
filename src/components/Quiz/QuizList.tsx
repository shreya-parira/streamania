
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { quizService } from '@/services/quizService';
import { Quiz } from '@/types/quiz';
import { Play, Square, Trash2 } from 'lucide-react';

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQuizzes = async () => {
    setLoading(true);
    try {
      const quizData = await quizService.getAllQuizzes();
      setQuizzes(quizData);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
  }, []);

  const handleActivateQuiz = async (quizId: string) => {
    try {
      // First deactivate all quizzes
      await Promise.all(
        quizzes.map(quiz => 
          quiz.id !== quizId && quiz.isActive 
            ? quizService.updateQuizStatus(quiz.id, false)
            : Promise.resolve()
        )
      );
      
      // Then activate the selected quiz
      await quizService.updateQuizStatus(quizId, true);
      await loadQuizzes();
    } catch (error) {
      console.error('Error activating quiz:', error);
    }
  };

  const handleDeactivateQuiz = async (quizId: string) => {
    try {
      await quizService.updateQuizStatus(quizId, false);
      await loadQuizzes();
    } catch (error) {
      console.error('Error deactivating quiz:', error);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white flex justify-between items-center">
          Created Quizzes
          <Button onClick={loadQuizzes} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {quizzes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Question</TableHead>
                <TableHead className="text-gray-300">Options</TableHead>
                <TableHead className="text-gray-300">Time Limit</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="text-white max-w-xs truncate">{quiz.question}</TableCell>
                  <TableCell className="text-gray-300">{quiz.options.length} options</TableCell>
                  <TableCell className="text-gray-300">{quiz.timeLimit}s</TableCell>
                  <TableCell>
                    <Badge variant={quiz.isActive ? "default" : "secondary"}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {quiz.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {quiz.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeactivateQuiz(quiz.id)}
                          className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Square className="w-3 h-3" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleActivateQuiz(quiz.id)}
                          className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No quizzes created yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizList;
