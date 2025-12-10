
import React, { useState, useEffect } from 'react';
import { civicsQuestions } from '../data/questions';
import { Question } from '../types';

interface FlashcardsProps {
  onComplete: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [localData, setLocalData] = useState<{state?: string, zip?: string} | null>(null);

  useEffect(() => {
    // Load local data
    const saved = localStorage.getItem('civicPath_location');
    if (saved) {
      setLocalData(JSON.parse(saved));
    }
    
    // Pick 10 random
    if (civicsQuestions && civicsQuestions.length > 0) {
        const shuffled = [...civicsQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
        setCards(shuffled);
    }
  }, []);

  const handleNext = () => {
    setShowAnswer(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];
  
  const isLocationQuestion = currentCard.questionText.includes('Governor') || currentCard.questionText.includes('Senator') || currentCard.questionText.includes('Representative');
  const locationText = isLocationQuestion && localData?.state ? ` (Updated for ${localData.state})` : '(Updated for your location)';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between shadow-sm z-10 pt-4">
         <button onClick={onComplete} className="text-gray-800 dark:text-white">
            <i className="fas fa-chevron-left"></i>
         </button>
         <h1 className="font-bold text-gray-900 dark:text-white text-lg">Play Audio Sentence</h1>
         <div className="w-6"></div>
      </div>

      <div className="flex-1 px-6 py-8 flex flex-col">
         
         {/* Audio Input Field Mock */}
         <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-8 flex items-center border border-gray-200 dark:border-gray-700 h-14 px-4">
             <i className="far fa-star text-gray-400 mr-3"></i>
             <span className="text-gray-400 text-sm flex-1">Play Audio Sentence</span>
         </div>

         {/* Question Card */}
         <div className="w-full bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700 mb-8 relative flex flex-col items-center justify-center min-h-[320px]">
             {showAnswer && (
                 <div className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md">
                    <i className="fas fa-check"></i>
                 </div>
             )}

             <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 leading-tight">
                {currentCard.questionText}
             </h2>
             
             {showAnswer ? (
                 <div className="animate-fade-in w-full">
                    <p className="text-2xl font-bold text-[#1a237e] dark:text-blue-300 mb-2">
                        {currentCard.correctAnswer}
                    </p>
                    {isLocationQuestion && <p className="text-xs text-gray-500 mb-8">{locationText}</p>}
                    
                    <button 
                      onClick={handleNext}
                      className="mt-4 w-full bg-[#1a237e] text-white py-4 rounded-full font-bold shadow-lg hover:bg-blue-900 transition"
                    >
                      Next Question
                    </button>
                 </div>
             ) : (
                <button 
                  onClick={() => setShowAnswer(true)}
                  className="mt-4 bg-[#1a237e] text-white px-12 py-4 rounded-full font-bold shadow-lg hover:bg-blue-900 transition-transform active:scale-95 w-full"
                >
                  Show Answer
                </button>
             )}
         </div>
         
         {/* Next Steps List */}
         <div className="mt-auto w-full">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 ml-1">Next Steps</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">1. Submit N-400</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">2. Biometrics</span>
                  <span className="text-gray-400 font-mono">5/09</span>
               </div>
               
               <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-gray-800 dark:text-gray-200">3. Interview Prep</span>
                  <div className="flex items-center gap-2">
                     <i className="fas fa-sync-alt text-gray-400 text-xs"></i>
                     <span className="text-gray-400">Oath Ceremony</span>
                     <span className="font-bold text-gray-800 dark:text-gray-200">4.6</span>
                  </div>
               </div>

               {/* Progress Bar */}
               <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mt-2">
                   <div className="bg-gray-300 dark:bg-gray-500 h-full w-2/3"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Flashcards;
