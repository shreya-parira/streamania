
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { quizService } from '@/services/quizService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface QuizCreationFormProps {
  onClose: () => void;
}

const QuizCreationForm: React.FC<QuizCreationFormProps> = ({ onClose }) => {
  const { userData } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState('0');
  const [timeLimit, setTimeLimit] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.isAdmin) {
      toast({
        title: "Access denied",
        description: "Only admins can create quizzes.",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a quiz question.",
        variant: "destructive"
      });
      return;
    }

    if (options.some(option => !option.trim())) {
      toast({
        title: "All options required",
        description: "Please fill in all answer options.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      const quizOptions = options.map((text, index) => ({
        id: index.toString(),
        text: text.trim()
      }));

      await quizService.createQuiz({
        question: question.trim(),
        options: quizOptions,
        correctOptionId: correctOption,
        isActive: false,
        timeLimit,
        createdAt: new Date(),
        createdBy: userData.uid
      });

      toast({
        title: "Quiz created successfully",
        description: "Quiz has been saved and can be activated from the quiz management panel.",
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Failed to create quiz",
        description: "There was an error creating the quiz. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800/50 border-green-500/20">
      <CardHeader>
        <CardTitle className="text-white">Create New Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-gray-300">Question</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your quiz question..."
              required
              className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
          
          <div>
            <Label className="text-gray-300">Answer Options</Label>
            <div className="space-y-2 mt-2">
              {options.map((option, index) => (
                <Input
                  key={index}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}...`}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Correct Answer</Label>
            <RadioGroup value={correctOption} onValueChange={setCorrectOption} className="mt-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`}
                    className="border-gray-600 text-green-400"
                  />
                  <Label htmlFor={`option-${index}`} className="text-gray-300">
                    Option {index + 1}: {option || '(empty)'}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-gray-300">Time Limit (seconds)</Label>
            <Input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min="10"
              max="300"
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuizCreationForm;
