
import React, { useState, useEffect } from 'react';
import { civicsQuestions } from '../data/questions';
import { Question } from '../types';

interface FlashcardsProps {
  onComplete: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ known: 0, learning: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Shuffle and pick 10 random cards for the session
    const shuffled = [...civicsQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setCards(shuffled);
  }, []);

  const handleNext = (known: boolean) => {
    setSessionStats(prev => ({
      known: known ? prev.known + 1 : prev.known,
      learning: !known ? prev.learning + 1 : prev.learning
    }));
    
    setIsFlipped(false);
    
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 300);
  };

  const handleRestart = () => {
    const shuffled = [...civicsQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionStats({ known: 0, learning: 0 });
  };

  if (cards.length === 0) return null;

  if (isFinished) {
    return (
      <div className="max-w-md mx-auto text-center pt-10 animate-fade-in">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
             <i className="fas fa-check text-3xl text-green-600 dark:text-green-400"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Session Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Great job reviewing.</p>
          
          <div className="flex gap-4 mb-8">
             <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{sessionStats.known}</p>
                <p className="text-xs text-gray-500 uppercase font-bold">Mastered</p>
             </div>
             <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                <p className="text-3xl font-bold text-orange-500">{sessionStats.learning}</p>
                <p className="text-xs text-gray-500 uppercase font-bold">Still Learning</p>
             </div>
          </div>

          <button 
            onClick={handleRestart}
            className="w-full bg-patriot-blue text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition mb-3"
          >
            Start New Session
          </button>
          <button 
            onClick={onComplete}
            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <i className="fas fa-clone text-patriot-blue dark:text-blue-400"></i> Flashcards
        </h2>
        <div className="text-sm font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-8">
         <div 
           className="bg-patriot-blue h-2 rounded-full transition-all duration-300"
           style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
         ></div>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex flex-col justify-center min-h-[400px]">
        <div 
          className="relative w-full h-80 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* Front */}
            <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center">
               <span className="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Question</span>
               <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white leading-snug">
                 {currentCard.questionText}
               </h3>
               <p className="absolute bottom-6 text-sm text-gray-400 animate-bounce">
                 Tap to reveal answer
               </p>
            </div>

            {/* Back */}
            <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-patriot-blue rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center text-white">
               <span className="absolute top-6 left-6 text-xs font-bold text-blue-200 uppercase tracking-widest">Answer</span>
               <h3 className="text-2xl sm:text-3xl font-bold leading-snug">
                 {currentCard.correctAnswer}
               </h3>
               <div className="mt-4 text-blue-100 text-sm opacity-80">
                 {currentCard.explanation}
               </div>
            </div>

          </div>
        </div>

        {/* Controls */}
        <div className={`flex justify-center gap-4 mt-10 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
           <button 
             onClick={(e) => { e.stopPropagation(); handleNext(false); }}
             className="flex-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 py-4 rounded-xl font-bold hover:bg-orange-200 dark:hover:bg-orange-900/50 transition flex flex-col items-center"
           >
             <i className="fas fa-times mb-1"></i>
             Still Learning
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); handleNext(true); }}
             className="flex-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 py-4 rounded-xl font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition flex flex-col items-center"
           >
             <i className="fas fa-check mb-1"></i>
             I Know It
           </button>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Flashcards;