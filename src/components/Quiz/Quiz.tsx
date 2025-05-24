
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trophy, Clock, Coins } from 'lucide-react';

interface QuizProps {
  streamId: string;
}

const Quiz: React.FC<QuizProps> = ({ streamId }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [betAmount, setBetAmount] = useState(10);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const mockQuiz = {
    question: "Which planet is closest to the Sun?",
    options: [
      { id: 'a', text: 'Venus' },
      { id: 'b', text: 'Mercury' },
      { id: 'c', text: 'Mars' },
      { id: 'd', text: 'Earth' }
    ]
  };

  const handleSubmit = () => {
    setHasAnswered(true);
    // In real implementation, submit answer to Firebase
  };

  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-yellow-500/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Live Quiz
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <Coins className="w-4 h-4" />
              <span>Win: {betAmount * 2} points</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!hasAnswered ? (
          <div className="space-y-6">
            <div className="text-white text-lg font-medium">
              {mockQuiz.question}
            </div>
            
            <div className="flex gap-2 mb-4">
              <Label className="text-gray-300">Bet Amount:</Label>
              {[10, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  variant={betAmount === amount ? "default" : "outline"}
                  size="sm"
                  className={betAmount === amount 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "border-green-500/20 text-green-400 hover:bg-green-500/10"
                  }
                >
                  {amount} pts
                </Button>
              ))}
            </div>

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-3">
                {mockQuiz.options.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value={option.id} 
                      id={option.id}
                      className="border-gray-600 text-green-400"
                    />
                    <Label 
                      htmlFor={option.id} 
                      className="text-white cursor-pointer flex-1 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer || timeLeft === 0}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
            >
              Submit Answer & Bet {betAmount} Points
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-green-400" />
            </div>
            <div className="text-white text-lg font-medium mb-2">Answer Submitted!</div>
            <div className="text-gray-400">Results will be revealed shortly...</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Quiz;
