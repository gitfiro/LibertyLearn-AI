
import React, { useState, useEffect } from 'react';
import { QuizCategory, Question, Difficulty } from '../types';
import { civicsQuestions } from '../data/questions';

interface QuizProps {
  onComplete: (score: number, total: number, breakdown: Record<string, { correct: number; total: number }>) => void;
  isPremium: boolean;
  questionsInWindow: number;
  windowStartTime: number;
  onUpgrade: () => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete, isPremium, questionsInWindow, windowStartTime, onUpgrade }) => {
  const [category, setCategory] = useState<QuizCategory>(QuizCategory.MIXED);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [resultsHistory, setResultsHistory] = useState<{category: string, correct: boolean}[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<string>("--:--:--");

  const FREE_LIMIT = 5;
  const isLimitReached = !isPremium && questionsInWindow >= FREE_LIMIT;

  useEffect(() => {
    if (isPremium) return;

    const updateTimer = () => {
      const nextResetTime = windowStartTime + (12 * 60 * 60 * 1000);
      const now = Date.now();
      const msRemaining = Math.max(0, nextResetTime - now);

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (msRemaining <= 0) {
        setTimeRemaining("00h 00m 00s");
      } else {
        const h = Math.floor(msRemaining / (1000 * 60 * 60));
        const m = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((msRemaining % (1000 * 60)) / 1000);
        setTimeRemaining(`${pad(h)}h ${pad(m)}m ${pad(s)}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [windowStartTime, isPremium]);

  const startQuiz = () => {
    if (isLimitReached) return;

    // 1. Filter by Category
    let pool = civicsQuestions;
    if (category !== QuizCategory.MIXED) {
      pool = civicsQuestions.filter(q => q.category === category);
    }

    // 2. Shuffle
    const shuffled = [...pool].sort(() => 0.5 - Math.random());

    // 3. Slice to requested count (handle if pool is smaller than count)
    const selected = shuffled.slice(0, Math.min(questionCount, pool.length));

    setQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setResultsHistory([]);
    setQuizStarted(true);
    setShowExplanation(false);
    setSelectedOption(null);
  };

  const handleAnswer = (option: string) => {
    if (selectedOption) return; // Prevent multiple guesses
    
    const isCorrect = option === questions[currentIndex].correctAnswer;
    setSelectedOption(option);
    setShowExplanation(true);
    
    if (isCorrect) {
      setScore(s => s + 1);
    }

    setResultsHistory(prev => [...prev, {
        category: questions[currentIndex].category,
        correct: isCorrect
    }]);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Calculate breakdown
      const breakdown: Record<string, { correct: number; total: number }> = {};
      resultsHistory.forEach(r => {
          if (!breakdown[r.category]) {
              breakdown[r.category] = { correct: 0, total: 0 };
          }
          breakdown[r.category].total += 1;
          if (r.correct) {
              breakdown[r.category].correct += 1;
          }
      });
      onComplete(score, questions.length, breakdown);
    }
  };

  if (isLimitReached && !quizStarted) {
     return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg text-center border border-gray-200 dark:border-gray-700 transition-colors">
         <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fas fa-hourglass-end" aria-hidden="true"></i>
         </div>
         <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Daily Limit Reached</h2>
         <p className="text-gray-600 dark:text-gray-300 mb-2 text-lg">
            You have used your 5 free practice questions for this period. 
         </p>
         <p className="text-gray-500 dark:text-gray-400 mb-8 font-mono bg-gray-100 dark:bg-gray-700 inline-block px-4 py-2 rounded-lg flex items-center gap-2 mx-auto">
            <i className="fas fa-stopwatch" aria-hidden="true"></i> Resets in: <span className="font-bold text-patriot-blue dark:text-blue-300">{timeRemaining}</span>
         </p>
         <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-xl hover:scale-105 transform transition flex items-center justify-center gap-3 mx-auto"
         >
            <i className="fas fa-star" aria-hidden="true"></i> Unlock Unlimited Access
         </button>
      </div>
     );
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-md border-t-4 border-patriot-blue transition-colors flex flex-col">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 w-full">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">Customize Your Practice</h2>
          {!isPremium && (
            <div className="w-full sm:w-auto bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs px-3 py-2 rounded-lg border border-yellow-200 dark:border-yellow-800 shadow-sm flex flex-col sm:items-end items-center justify-center">
              <div className="font-bold mb-1"><i className="fas fa-bolt text-yellow-500 mr-1" aria-hidden="true"></i> {questionsInWindow}/{FREE_LIMIT} Used</div>
               <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-end gap-1">
                 <i className="fas fa-clock" aria-hidden="true"></i> Reset: <span className="font-mono font-medium">{timeRemaining}</span>
               </div>
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label id="category-label" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Select Category</label>
          <div role="group" aria-labelledby="category-label" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.values(QuizCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
                className={`p-4 rounded-lg border text-left transition-all ${
                  category === cat 
                  ? 'border-patriot-blue bg-blue-50 dark:bg-blue-900/30 text-patriot-blue dark:text-blue-300 ring-2 ring-patriot-blue' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="block font-medium">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <label id="count-label" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Number of Questions</label>
          <div role="group" aria-labelledby="count-label" className="flex flex-wrap gap-3">
            {[5, 10, 20, 50].map((count) => (
              <button
                key={count}
                onClick={() => setQuestionCount(count)}
                aria-pressed={questionCount === count}
                className={`flex-1 min-w-[80px] p-3 rounded-lg border text-center transition-all font-medium ${
                  questionCount === count
                  ? 'border-patriot-blue bg-blue-50 dark:bg-blue-900/30 text-patriot-blue dark:text-blue-300 ring-2 ring-patriot-blue'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
          {!isPremium && questionCount > 5 && (
             <p className="text-xs text-orange-500 mt-2"><i className="fas fa-exclamation-triangle" aria-hidden="true"></i> Free plan limited to 5 questions.</p>
          )}
        </div>

        <button
          onClick={startQuiz}
          className="w-full bg-patriot-red text-white py-3 rounded-lg font-bold text-lg shadow-md hover:bg-red-700 transition-colors flex justify-center items-center gap-2"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (questions.length === 0) return (
    <div className="text-center p-8">
      <p className="dark:text-gray-200">No questions found for this category. Please try another selection.</p>
      <button onClick={() => setQuizStarted(false)} className="text-patriot-blue dark:text-blue-400 font-bold mt-4">Go Back</button>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto relative pb-32">
      {/* Progress Bar */}
      <div className="mb-6 flex items-center justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
        </span>
        <span>Score: {score}</span>
      </div>
      <div 
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8"
        role="progressbar" 
        aria-valuenow={((currentIndex) / questions.length) * 100} 
        aria-valuemin={0} 
        aria-valuemax={100}
        aria-label="Quiz progress"
      >
        <div 
          className="bg-patriot-blue h-2 rounded-full transition-all duration-500" 
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg mb-6 relative overflow-hidden transition-colors">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-patriot-blue dark:text-blue-300 text-xs px-2 py-1 rounded mb-3 font-bold uppercase tracking-wider">
          {currentQ.category}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-6">
          {currentQ.questionText}
        </h3>

        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
             let btnClass = "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200";
             let ariaLabel = `Option ${String.fromCharCode(65 + idx)}: ${option}`;
             
             if (selectedOption) {
                if (option === currentQ.correctAnswer) {
                    btnClass = "bg-green-100 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-200";
                    ariaLabel += " (Correct Answer)";
                }
                else if (option === selectedOption) {
                    btnClass = "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-200";
                    ariaLabel += " (Incorrect selection)";
                }
                else btnClass = "opacity-50 border-gray-200 dark:border-gray-700 dark:text-gray-400";
             }

             return (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={!!selectedOption}
                aria-label={ariaLabel}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${btnClass}`}
              >
                <div className="flex items-center">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 mr-3 text-sm font-bold text-gray-500 dark:text-gray-300" aria-hidden="true">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </div>
              </button>
             )
          })}
        </div>

        {/* Explanation - Expanded inside the card */}
        <div aria-live="polite">
          {showExplanation && (
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5 rounded-xl animate-fade-in">
              <div className="flex items-start gap-3">
                <i className="fas fa-lightbulb text-yellow-500 text-xl mt-1" aria-hidden="true"></i>
                <div>
                    <h4 className="font-bold text-patriot-blue dark:text-blue-300 mb-1">Explanation</h4>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{currentQ.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showExplanation && (
         <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-center z-[60] transition-colors shadow-2xl">
            <button 
              onClick={nextQuestion}
              autoFocus
              className="bg-patriot-blue text-white px-12 py-3 rounded-full font-bold shadow-lg hover:bg-blue-900 transition-transform hover:scale-105 flex items-center gap-2"
            >
              {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'} <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
         </div>
      )}
    </div>
  );
};

export default Quiz;
