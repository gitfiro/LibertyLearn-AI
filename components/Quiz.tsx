import React, { useState } from 'react';
import { QuizCategory, Question, Difficulty } from '../types';
import { generateQuizQuestions } from '../services/geminiService';

interface QuizProps {
  onComplete: (score: number, total: number) => void;
  isPremium: boolean;
  questionsInWindow: number;
  windowStartTime: number;
  onUpgrade: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete, isPremium, questionsInWindow, windowStartTime, onUpgrade }) => {
  const [category, setCategory] = useState<QuizCategory>(QuizCategory.MIXED);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const FREE_LIMIT = 5;
  const isLimitReached = !isPremium && questionsInWindow >= FREE_LIMIT;

  // Calculate reset time
  const nextResetTime = windowStartTime + (12 * 60 * 60 * 1000);
  const now = Date.now();
  const msRemaining = Math.max(0, nextResetTime - now);
  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const startQuiz = async () => {
    if (isLimitReached) return;
    setLoading(true);
    const q = await generateQuizQuestions(category, difficulty, 5);
    setQuestions(q);
    setLoading(false);
    setCurrentIndex(0);
    setScore(0);
    setQuizStarted(true);
    setShowExplanation(false);
    setSelectedOption(null);
  };

  const handleAnswer = (option: string) => {
    if (selectedOption) return; // Prevent multiple guesses
    setSelectedOption(option);
    setShowExplanation(true);
    if (option === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      onComplete(score, questions.length);
    }
  };

  if (isLimitReached && !quizStarted) {
     return (
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-xl shadow-lg text-center border border-gray-200">
         <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fas fa-hourglass-end"></i>
         </div>
         <h2 className="text-3xl font-bold text-gray-800 mb-4">Daily Limit Reached</h2>
         <p className="text-gray-600 mb-2 text-lg">
            You have used your 5 free practice questions for this period. 
         </p>
         <p className="text-gray-500 mb-8 font-mono bg-gray-100 inline-block px-4 py-2 rounded-lg">
            Resets in: {hoursRemaining}h {minutesRemaining}m
         </p>
         <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 transform transition flex items-center justify-center gap-3 mx-auto"
         >
            <i className="fas fa-star"></i> Unlock Unlimited Access
         </button>
      </div>
     );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border-t-4 border-patriot-blue relative">
        {!isPremium && (
          <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">
            Free Access: {questionsInWindow}/{FREE_LIMIT} (Resets every 12h)
          </div>
        )}
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customize Your Practice</h2>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">Select Category</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(QuizCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  category === cat 
                  ? 'border-patriot-blue bg-blue-50 text-patriot-blue ring-2 ring-patriot-blue' 
                  : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <span className="block font-medium">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 font-semibold mb-2">Select Difficulty</label>
          <div className="flex flex-col sm:flex-row gap-3">
            {Object.values(Difficulty).map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 p-3 rounded-lg border text-center transition-all font-medium ${
                  difficulty === level
                  ? 'border-patriot-blue bg-blue-50 text-patriot-blue ring-2 ring-patriot-blue'
                  : 'border-gray-200 hover:border-blue-300 text-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startQuiz}
          disabled={loading}
          className="w-full bg-patriot-red text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i> Generating Quiz...
            </>
          ) : (
            <>Start Quiz</>
          )}
        </button>
      </div>
    );
  }

  if (questions.length === 0) return <div>Error loading questions. Please try again.</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 flex items-center justify-between text-sm font-medium text-gray-500">
        <span className="flex items-center gap-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            difficulty === Difficulty.EASY ? 'bg-green-100 text-green-800' :
            difficulty === Difficulty.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {difficulty}
          </span>
        </span>
        <span>Score: {score}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-patriot-blue h-2 rounded-full transition-all duration-500" 
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg mb-6 relative overflow-hidden">
        <span className="inline-block bg-blue-100 text-patriot-blue text-xs px-2 py-1 rounded mb-3 font-bold uppercase tracking-wider">
          {currentQ.category}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">
          {currentQ.questionText}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
             let btnClass = "border-gray-200 hover:bg-gray-50 text-gray-700";
             if (selectedOption) {
                if (option === currentQ.correctAnswer) btnClass = "bg-green-100 border-green-500 text-green-800";
                else if (option === selectedOption) btnClass = "bg-red-100 border-red-500 text-red-800";
                else btnClass = "opacity-50 border-gray-200";
             }

             return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedOption}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${btnClass}`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-300 mr-3 text-sm font-bold text-gray-500">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </div>
              </button>
             )
          })}
        </div>
      </div>

      {/* Explanation & Next */}
      {showExplanation && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-24 animate-fade-in">
          <div className="flex items-start gap-3">
             <i className="fas fa-lightbulb text-yellow-500 text-xl mt-1"></i>
             <div>
                <h4 className="font-bold text-patriot-blue mb-1">Explanation</h4>
                <p className="text-gray-700">{currentQ.explanation}</p>
             </div>
          </div>
        </div>
      )}

      {showExplanation && (
         <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 flex justify-center z-50">
            <button 
              onClick={nextQuestion}
              className="bg-patriot-blue text-white px-12 py-3 rounded-full font-bold shadow-lg hover:bg-blue-900 transition-transform hover:scale-105"
            >
              {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <i className="fas fa-arrow-right ml-2"></i>
            </button>
         </div>
      )}
    </div>
  );
};

export default Quiz;