
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
    // Ensure we have questions and pick 10 random ones for the session
    if (civicsQuestions && civicsQuestions.length > 0) {
        const shuffled = [...civicsQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
        setCards(shuffled);
    }
  }, []);

  const handleNext = (known: boolean) => {
    setSessionStats(prev => ({
      known: known ? prev.known + 1 : prev.known,
      learning: !known ? prev.learning + 1 : prev.learning
    }));
    
    setIsFlipped(false);
    
    // Wait for flip back animation before changing card
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }, 400); 
  };

  const handleRestart = () => {
    const shuffled = [...civicsQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionStats({ known: 0, learning: 0 });
  };

  if (!cards || cards.length === 0) {
     return (
         <div className="flex flex-col items-center justify-center min-h-[400px]">
             <div className="w-10 h-10 border-4 border-patriot-blue border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500">Loading flashcards...</p>
         </div>
     );
  }

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
             <div className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{sessionStats.known}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Mastered</p>
             </div>
             <div className="flex-1 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                <p className="text-3xl font-bold text-orange-500 dark:text-orange-400">{sessionStats.learning}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Still Learning</p>
             </div>
          </div>

          <button onClick={handleRestart} className="w-full bg-patriot-blue text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-900 transition mb-3">
            Start New Session
          </button>
          <button onClick={onComplete} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col pb-20 px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onComplete} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium flex items-center gap-2">
             <i className="fas fa-arrow-left"></i> Back
        </button>
        <div className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mb-8 overflow-hidden">
         <div className="bg-patriot-blue h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex) / cards.length) * 100}%` }}></div>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[420px]">
        {/* Card Container with Perspective */}
        <div 
          className="relative w-full h-80 cursor-pointer group"
          style={{ perspective: '1000px' }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Flipper Inner */}
          <div 
             className="relative w-full h-full shadow-xl rounded-2xl"
             style={{ 
                transformStyle: 'preserve-3d', 
                transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' 
             }}
          >
            {/* Front Side */}
            <div 
                className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center shadow-sm select-none"
                style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden'
                }}
            >
               <span className="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">Question</span>
               <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white leading-snug">
                 {currentCard.questionText}
               </h3>
               <p className="absolute bottom-6 text-sm text-patriot-blue dark:text-blue-400 font-medium opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                 <i className="fas fa-sync-alt"></i> Tap to flip
               </p>
            </div>

            {/* Back Side */}
            <div 
                className="absolute w-full h-full bg-patriot-blue rounded-2xl p-8 flex flex-col items-center justify-center text-center text-white shadow-sm select-none"
                style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                }}
            >
               <span className="absolute top-6 left-6 text-xs font-bold text-blue-200 uppercase tracking-widest bg-white/10 px-2 py-1 rounded">Answer</span>
               <h3 className="text-2xl sm:text-3xl font-bold leading-snug mb-4">
                 {currentCard.correctAnswer}
               </h3>
               <div className="mt-2 text-blue-100 text-sm opacity-90 bg-black/20 p-3 rounded-lg">
                 {currentCard.explanation}
               </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`grid grid-cols-2 gap-4 mt-8 transition-all duration-300 ${isFlipped ? 'opacity-100 transform translate-y-0' : 'opacity-50 transform translate-y-4 pointer-events-none'}`}>
           <button 
             onClick={(e) => { e.stopPropagation(); handleNext(false); }}
             className="bg-white dark:bg-gray-800 border-2 border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 py-4 rounded-xl font-bold hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 transition shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95"
           >
             <i className="fas fa-times-circle text-xl"></i>
             <span>Still Learning</span>
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); handleNext(true); }}
             className="bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400 py-4 rounded-xl font-bold hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 transition shadow-sm flex flex-col items-center justify-center gap-1 active:scale-95"
           >
             <i className="fas fa-check-circle text-xl"></i>
             <span>I Know It</span>
           </button>
        </div>
        
        {!isFlipped && (
            <div className="text-center mt-8 text-gray-400 text-sm h-[88px] flex items-center justify-center">
                Reveal the answer to rate your knowledge
            </div>
        )}
      </div>
    </div>
  );
};

export default Flashcards;
