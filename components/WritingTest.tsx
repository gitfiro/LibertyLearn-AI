
import React, { useState, useEffect, useRef } from 'react';
import { getWritingSentence, generateSpeech } from '../services/geminiService';

// Helper to convert base64 to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM (16-bit little endian, 24kHz, mono) to AudioBuffer
function pcmToAudioBuffer(data: Uint8Array, ctx: AudioContext, sampleRate: number): AudioBuffer {
  // Create Int16Array view of the PCM data
  // Ensure the buffer byte length is a multiple of 2
  if (data.length % 2 !== 0) {
      // Padding if necessary (though unusual for valid 16-bit PCM)
      const newData = new Uint8Array(data.length + 1);
      newData.set(data);
      data = newData;
  }
  
  const pcm16 = new Int16Array(data.buffer);
  const frameCount = pcm16.length;
  
  // Create an AudioBuffer with the specific sample rate of the source (24kHz)
  // The AudioContext will handle resampling to the hardware rate during playback
  const audioBuffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  // Convert Int16 to Float32
  for (let i = 0; i < frameCount; i++) {
      // Normalize between -1.0 and 1.0
      channelData[i] = pcm16[i] / 32768.0;
  }
  
  return audioBuffer;
}

interface WritingTestProps {
  isPremium: boolean;
  onUpgrade: () => void;
}

const WritingTest: React.FC<WritingTestProps> = ({ isPremium, onUpgrade }) => {
  const [targetSentence, setTargetSentence] = useState<string>("");
  const [audioData, setAudioData] = useState<string | null>(null); // Base64
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  const loadNewExercise = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setUserInput("");
    setAudioData(null);
    setIsPlaying(false);
    
    try {
        const text = await getWritingSentence();
        setTargetSentence(text);
        const audio = await generateSpeech(text);
        setAudioData(audio);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium) {
      loadNewExercise();
    }
    return () => {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
    };
  }, [isPremium]);

  const playAudio = async () => {
    if (!audioData) return;
    
    try {
        setIsPlaying(true);
        
        // Initialize AudioContext on user interaction
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const ctx = audioContextRef.current;
        
        // Resume context if suspended (browsers often suspend auto-created contexts)
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        // Convert Base64 string to Uint8Array
        const bytes = base64ToUint8Array(audioData);
        
        // Decode raw PCM data manually because Gemini returns raw PCM (no headers)
        // Gemini TTS model 'gemini-2.5-flash-preview-tts' uses 24000Hz sample rate
        const buffer = pcmToAudioBuffer(bytes, ctx, 24000); 
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        
        source.onended = () => setIsPlaying(false);
        source.start(0);
        
    } catch (e) {
        console.error("Audio playback error", e);
        setIsPlaying(false);
    }
  };

  const checkAnswer = () => {
    setIsSubmitted(true);
  };

  // Clean string for comparison (remove punctuation, extra spaces, lowercase)
  const clean = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").trim();
  
  const isCorrect = clean(userInput) === clean(targetSentence);

  if (!isPremium) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 px-4 sm:px-8 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-pen-alt text-3xl sm:text-4xl text-teal-600 dark:text-teal-400" aria-hidden="true"></i>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-3">Writing Test Locked</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          Practice writing English sentences from audio dictation. Upgrade to Premium to access this feature.
        </p>
        <button
          onClick={onUpgrade}
          className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-base sm:text-lg shadow-lg hover:scale-105 transition flex items-center justify-center gap-2"
        >
          <i className="fas fa-crown" aria-hidden="true"></i> Unlock Writing Test
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-8 text-white relative">
             <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2"><i className="fas fa-pen-alt mr-2" aria-hidden="true"></i> Writing Test</h2>
                <p className="text-teal-100">Listen to the sentence and type exactly what you hear.</p>
             </div>
             <i className="fas fa-headphones-alt absolute -bottom-4 -right-4 text-8xl opacity-10" aria-hidden="true"></i>
          </div>

          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]" aria-live="polite">
             {isLoading ? (
                <div className="flex flex-col items-center gap-3">
                   <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-gray-500 dark:text-gray-400">Preparing audio exercise...</p>
                </div>
             ) : (
                <div className="w-full max-w-lg">
                   {/* Audio Control */}
                   <div className="flex justify-center mb-8">
                      <button
                         onClick={playAudio}
                         disabled={isPlaying}
                         aria-label={isPlaying ? "Playing audio" : "Play sentence audio"}
                         className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform hover:scale-105 ${
                            isPlaying 
                            ? 'bg-teal-100 text-teal-600 border-4 border-teal-200' 
                            : 'bg-teal-600 text-white hover:bg-teal-700 border-4 border-teal-200/30'
                         }`}
                      >
                         <i className={`fas ${isPlaying ? 'fa-volume-up animate-pulse' : 'fa-play'} text-3xl mb-1`} aria-hidden="true"></i>
                         <span className="text-xs font-bold uppercase">{isPlaying ? 'Playing' : 'Listen'}</span>
                      </button>
                   </div>

                   {/* Input Area */}
                   <div className="mb-6 relative">
                      <textarea
                         value={userInput}
                         onChange={(e) => setUserInput(e.target.value)}
                         disabled={isSubmitted}
                         placeholder="Type the sentence here..."
                         aria-label="Type the sentence you heard"
                         className={`w-full p-4 text-lg rounded-xl border-2 focus:ring-2 focus:ring-teal-500 outline-none min-h-[120px] resize-none transition-colors ${
                            isSubmitted
                             ? isCorrect 
                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                                : 'border-red-300 bg-red-50 dark:bg-red-900/20'
                             : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white'
                         }`}
                      />
                      {isSubmitted && (
                        <div className="absolute top-4 right-4 text-2xl" aria-hidden="true">
                           {isCorrect ? <i className="fas fa-check-circle text-green-500"></i> : <i className="fas fa-times-circle text-red-500"></i>}
                        </div>
                      )}
                   </div>

                   {/* Feedback / Result */}
                   {isSubmitted && (
                      <div className="mb-8 animate-fade-in">
                         {!isCorrect && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                               <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Correct Sentence:</p>
                               <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{targetSentence}</p>
                            </div>
                         )}
                         {isCorrect && (
                            <p className="text-center text-green-600 dark:text-green-400 font-bold text-lg">
                               Perfect! You got it right.
                            </p>
                         )}
                      </div>
                   )}

                   {/* Actions */}
                   <div className="flex justify-center gap-4">
                      {!isSubmitted ? (
                         <button
                           onClick={checkAnswer}
                           disabled={!userInput.trim()}
                           className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-lg shadow hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                           Check Answer
                         </button>
                      ) : (
                         <button
                           onClick={loadNewExercise}
                           className="w-full py-3 rounded-xl bg-gray-800 dark:bg-gray-700 text-white font-bold text-lg shadow hover:bg-gray-900 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                         >
                           Next Exercise <i className="fas fa-arrow-right" aria-hidden="true"></i>
                         </button>
                      )}
                   </div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default WritingTest;
