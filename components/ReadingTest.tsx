
import React, { useState, useEffect, useRef } from 'react';
import { getReadingSentence, evaluateReading } from '../services/geminiService';

interface ReadingTestProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

const ReadingTest: React.FC<ReadingTestProps> = ({ isPremium, onUpgrade }) => {
  const [sentence, setSentence] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<{correct: boolean, feedback: string} | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const loadNewSentence = async () => {
    setIsLoading(true);
    setResult(null);
    setAudioURL(null);
    const s = await getReadingSentence();
    setSentence(s);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isPremium) {
      loadNewSentence();
    }
  }, [isPremium]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Convert blob to base64 for Gemini
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          setIsEvaluating(true);
          const evalResult = await evaluateReading(sentence, base64Audio, audioBlob.type);
          setResult(evalResult);
          setIsEvaluating(false);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 px-4 sm:px-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-book-reader text-3xl sm:text-4xl text-indigo-600 dark:text-indigo-400" aria-hidden="true"></i>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-3">Reading Test Locked</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          Practice reading English sentences aloud with AI-powered pronunciation feedback. Upgrade to Premium to access this feature.
        </p>
        <button
          onClick={onUpgrade}
          className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-base sm:text-lg shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
        >
          <i className="fas fa-crown" aria-hidden="true"></i> Unlock Reading Test
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8 text-white relative">
             <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2"><i className="fas fa-book-reader mr-2" aria-hidden="true"></i> Reading Test</h2>
                <p className="text-purple-100">Read the sentence below clearly into your microphone.</p>
             </div>
             <i className="fas fa-quote-right absolute -bottom-4 -right-4 text-8xl opacity-10" aria-hidden="true"></i>
          </div>

          <div className="p-8 flex flex-col items-center text-center min-h-[400px] justify-center" aria-live="polite">
             
             {isLoading ? (
               <div className="flex flex-col items-center gap-3">
                 <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-gray-500 dark:text-gray-400">Generating sentence...</p>
               </div>
             ) : (
               <>
                 <div className="mb-12">
                    <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest font-bold mb-4">Read this sentence</p>
                    <h3 className="text-3xl md:text-4xl font-serif font-medium text-gray-800 dark:text-white leading-tight">
                      "{sentence}"
                    </h3>
                 </div>

                 {!result && !isEvaluating && (
                   <button
                     onClick={isRecording ? stopRecording : startRecording}
                     aria-label={isRecording ? "Stop Recording" : "Start Recording"}
                     className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all transform hover:scale-105 ${
                       isRecording 
                       ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' 
                       : 'bg-indigo-600 text-white hover:bg-indigo-700'
                     }`}
                   >
                     <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`} aria-hidden="true"></i>
                   </button>
                 )}

                 {isEvaluating && (
                   <div className="flex flex-col items-center gap-3 animate-fade-in">
                     <div className="flex gap-1">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                     </div>
                     <p className="text-indigo-600 font-medium">Analyzing your pronunciation...</p>
                   </div>
                 )}

                 {result && (
                   <div className="w-full max-w-md animate-fade-in">
                      <div className={`p-6 rounded-xl border-2 mb-6 ${
                        result.correct 
                        ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200' 
                        : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                      }`}>
                         <div className="text-5xl mb-3">
                           {result.correct ? <i className="fas fa-check-circle text-green-500" aria-hidden="true"></i> : <i className="fas fa-times-circle text-red-500" aria-hidden="true"></i>}
                         </div>
                         <h4 className="text-xl font-bold mb-2">{result.correct ? "Excellent Reading!" : "Needs Improvement"}</h4>
                         <p className="text-lg">{result.feedback}</p>
                      </div>

                      <div className="flex gap-3 justify-center">
                         {audioURL && (
                            <button onClick={() => new Audio(audioURL).play()} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 transition">
                               <i className="fas fa-play mr-2" aria-hidden="true"></i> My Recording
                            </button>
                         )}
                         <button 
                           onClick={loadNewSentence}
                           className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow transition flex items-center gap-2"
                         >
                           Next Sentence <i className="fas fa-arrow-right" aria-hidden="true"></i>
                         </button>
                      </div>
                   </div>
                 )}

                 {isRecording && <p className="mt-4 text-red-500 font-bold animate-pulse" role="status">Recording... Tap to stop</p>}
                 {!isRecording && !result && !isEvaluating && <p className="mt-4 text-gray-400">Tap the microphone to begin</p>}
               </>
             )}
          </div>
       </div>
    </div>
  );
};

export default ReadingTest;
