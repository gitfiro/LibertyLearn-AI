
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { UserStats, UserProfile, View } from '../types';

interface DashboardProps {
  stats: UserStats;
  user: UserProfile | null;
  onNavigate: (view: View) => void;
  onUpgrade: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, user, onNavigate, onUpgrade }) => {
  const masteryPercentage = stats.totalQuestions > 0 
    ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) 
    : 0;
  
  // Normalized score out of 100 for the visual
  const score = Math.min(100, Math.max(0, masteryPercentage));
  const data = [
    { name: 'Mastered', value: score },
    { name: 'Remaining', value: 100 - score }
  ];
  const COLORS = ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.2)'];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 animate-fade-in">
       {/* Header Section with Circular Progress */}
       <div className="bg-[#1a237e] pt-6 pb-12 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden z-10">
          <div className="flex justify-between items-center mb-4 text-white">
             <div className="w-8"></div> {/* Spacer for alignment */}
             <h1 className="font-semibold text-lg">Mastery Dashboard</h1>
             <button className="opacity-80 hover:opacity-100" onClick={() => onNavigate(View.QUIZ)} aria-label="Start Quiz">
                <i className="fas fa-play"></i>
             </button>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
             <div className="w-56 h-56 relative">
                {/* Background Circle */}
                <div className="absolute inset-0 rounded-full border-[12px] border-white/10"></div>
                
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                         data={data}
                         cx="50%"
                         cy="50%"
                         innerRadius={80}
                         outerRadius={94}
                         startAngle={90}
                         endAngle={-270}
                         dataKey="value"
                         stroke="none"
                         cornerRadius={10}
                      >
                         {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                      </Pie>
                   </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                   <span className="text-5xl font-bold">{score}<span className="text-3xl text-white/60">/100</span></span>
                   <span className="text-xs text-blue-200 mt-1 uppercase tracking-wide">Questions Mastered</span>
                   <div className="mt-2">
                      <i className="fas fa-chart-line opacity-80"></i>
                   </div>
                </div>
             </div>
          </div>
       </div>

       {/* Learning Path Section */}
       <div className="px-6 relative z-20 -mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 mb-6 transition-colors">
             <h2 className="text-gray-800 dark:text-white font-bold mb-6 text-center text-lg">Your Personalized Learning Path</h2>
             
             <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => onNavigate(View.FLASHCARDS)}
                  className="bg-[#3b82f6] hover:bg-blue-600 text-white rounded-2xl p-3 py-6 flex flex-col items-center justify-center gap-3 aspect-[3/4] shadow-lg transition-transform active:scale-95 group"
                >
                   <i className="fas fa-star text-3xl group-hover:scale-110 transition-transform"></i>
                   <span className="text-[10px] font-bold leading-tight text-center">Review Your<br/>Questions</span>
                </button>

                <button 
                  onClick={() => onNavigate(View.QUIZ)}
                  className="bg-[#ef4444] hover:bg-red-600 text-white rounded-2xl p-3 py-6 flex flex-col items-center justify-center gap-3 aspect-[3/4] shadow-lg transition-transform active:scale-95 group"
                >
                   <i className="fas fa-sync-alt text-3xl group-hover:rotate-180 transition-transform duration-500"></i>
                   <span className="text-[10px] font-bold leading-tight text-center">Practice Your<br/>Weaknesses</span>
                </button>

                <button 
                   onClick={() => onNavigate(View.QUIZ)}
                   className="bg-[#f59e0b] hover:bg-yellow-600 text-white rounded-2xl p-3 py-6 flex flex-col items-center justify-center gap-3 aspect-[3/4] shadow-lg transition-transform active:scale-95 group"
                >
                   <i className="fas fa-check-circle text-3xl group-hover:scale-110 transition-transform"></i>
                   <span className="text-[10px] font-bold leading-tight text-center">Daily Civics<br/>Quiz</span>
                </button>
             </div>
          </div>
       </div>
       
       {/* Bottom Actions */}
       <div className="px-6 flex gap-4 mt-2 pb-8">
          <button onClick={() => onNavigate(View.NEWS)} className="flex-1 bg-white dark:bg-gray-800 py-4 px-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2 text-[#1a237e] dark:text-blue-300 font-bold text-sm hover:shadow-md transition-shadow">
             <i className="fas fa-newspaper"></i> Latest News
          </button>
          <button onClick={() => onNavigate(View.FIND_ATTORNEY)} className="flex-1 bg-white dark:bg-gray-800 py-4 px-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 font-bold text-sm hover:shadow-md transition-shadow hover:text-patriot-blue dark:hover:text-blue-300">
             <i className="fas fa-gavel"></i> Find Lawyer
          </button>
       </div>
    </div>
  );
};

export default Dashboard;
