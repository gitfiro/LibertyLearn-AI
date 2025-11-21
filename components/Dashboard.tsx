
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { UserStats, UserProfile } from '../types';

interface DashboardProps {
  stats: UserStats;
  user: UserProfile | null;
  onNavigate: (view: string) => void;
  onUpgrade: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, user, onNavigate, onUpgrade }) => {
  const [isAlertExpanded, setIsAlertExpanded] = React.useState(false);
  
  // Map data with detailed performance stats for the tooltip
  const data = Object.keys(stats.masteryByTopic).map(key => ({
    topic: key,
    score: stats.masteryByTopic[key],
    details: stats.performanceByTopic?.[key] || { correct: 0, total: 0 }
  }));

  const FREE_LIMIT = 5;
  const questionsLeft = Math.max(0, FREE_LIMIT - stats.questionsInWindow);
  const progressPercent = Math.min(100, (stats.questionsInWindow / FREE_LIMIT) * 100);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 z-50">
          <h4 className="font-bold text-patriot-blue dark:text-blue-300 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">{item.topic}</h4>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
               <span className="text-xs text-gray-500 dark:text-gray-400">Mastery</span>
               <span className="font-bold text-patriot-red dark:text-red-400">{item.score}%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
               <span className="text-xs text-gray-500 dark:text-gray-400">Correct</span>
               <span className="font-medium text-gray-700 dark:text-gray-200">
                 {item.details.total > 0 ? `${item.details.correct}/${item.details.total}` : 'N/A'}
               </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
       {/* Hero Section */}
       <div className="bg-gradient-to-r from-patriot-blue to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-2xl sm:text-3xl font-bold">
                 Welcome, {user ? user.name.split(' ')[0] : 'Future Citizen'}!
               </h1>
               {stats.isPremium && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide"><i className="fas fa-crown mr-1" aria-hidden="true"></i> Premium</span>}
            </div>
            <p className="text-blue-100 mb-6 max-w-lg text-sm sm:text-base">Your complete preparation hub for the Naturalization Test.</p>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-8xl sm:text-9xl transform translate-x-10 -translate-y-10">
             <i className="fas fa-flag-usa" aria-hidden="true"></i>
          </div>
       </div>

       {/* USCIS Alert Section */}
       <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 rounded-r-xl shadow-sm animate-fade-in transition-all duration-300">
         <button 
            onClick={() => setIsAlertExpanded(!isAlertExpanded)}
            className="w-full flex items-start sm:items-center gap-4 p-5 text-left focus:outline-none hover:bg-orange-100/50 dark:hover:bg-orange-900/30 transition-colors rounded-r-xl group"
            aria-expanded={isAlertExpanded}
         >
            <div className="flex-shrink-0 mt-1 sm:mt-0">
               <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                 <i className="fas fa-bullhorn text-orange-600 dark:text-orange-400 text-lg" aria-hidden="true"></i>
               </div>
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-center">
                   <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wide flex items-center gap-2">
                     USCIS 2025 Test Alert
                     <span className="bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 text-[10px] px-2 py-0.5 rounded-full">New</span>
                   </h3>
                   <i className={`fas fa-chevron-down text-orange-400 transition-transform duration-300 ${isAlertExpanded ? 'rotate-180' : ''}`}></i>
               </div>
               {!isAlertExpanded && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Click to read about the new 2025 test changes...
                  </p>
               )}
            </div>
         </button>

         {isAlertExpanded && (
            <div className="px-5 pb-5 pl-5 sm:pl-[4.5rem] animate-fade-in">
               <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-3">
                  USCIS is implementing the <strong>2025 naturalization civics test</strong> to align with Executive Order 14161. Your test version depends on your filing date:
               </p>
               
               <div className="grid gap-3 sm:grid-cols-2 bg-white/60 dark:bg-black/20 p-3 rounded-lg border border-orange-100 dark:border-orange-800/30">
                  <div className="p-2">
                     <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">File Before Oct 20, 2025</p>
                     <div className="flex items-center gap-2">
                       <i className="fas fa-check-circle text-green-500"></i>
                       <p className="font-bold text-patriot-blue dark:text-blue-300">2008 Civics Test</p>
                     </div>
                     <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 pl-6">This app prepares you for this version.</p>
                  </div>
                  <div className="p-2 border-t sm:border-t-0 sm:border-l border-orange-200 dark:border-orange-800/30">
                     <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">File On/After Oct 20, 2025</p>
                     <div className="flex items-center gap-2">
                       <i className="fas fa-info-circle text-orange-500"></i>
                       <p className="font-bold text-gray-800 dark:text-white">2025 Civics Test</p>
                     </div>
                     <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 pl-6">Based on 2020 test with modifications.</p>
                  </div>
               </div>
            </div>
         )}
       </div>

       {/* Practice Center Grid */}
       <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
             <i className="fas fa-layer-group text-patriot-red" aria-hidden="true"></i> Practice Center
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {/* 1. Civics Quiz */}
             <button 
               onClick={() => onNavigate('QUIZ')}
               className="bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-patriot-blue dark:hover:border-blue-400 transition-all text-left group active:scale-[0.98]"
             >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-patriot-blue dark:text-blue-300 text-xl mb-4 group-hover:scale-110 transition-transform">
                   <i className="fas fa-question" aria-hidden="true"></i>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Civics Quiz</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Master the 100 official questions.</p>
             </button>

             {/* 2. Reading Test */}
             <button 
               onClick={() => onNavigate('READING')}
               className={`bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all text-left group relative overflow-hidden active:scale-[0.98] ${!stats.isPremium ? 'opacity-75' : 'hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-400'}`}
             >
                {!stats.isPremium && (
                   <div className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] px-2 py-1 rounded font-bold uppercase">
                      <i className="fas fa-lock" aria-label="Locked feature"></i> Locked
                   </div>
                )}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-xl mb-4 group-hover:scale-110 transition-transform">
                   <i className="fas fa-book-reader" aria-hidden="true"></i>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Reading Test</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Practice reading sentences aloud.</p>
             </button>

             {/* 3. Writing Test */}
             <button 
               onClick={() => onNavigate('WRITING')}
               className={`bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all text-left group relative overflow-hidden active:scale-[0.98] ${!stats.isPremium ? 'opacity-75' : 'hover:shadow-md hover:border-teal-500 dark:hover:border-teal-400'}`}
             >
                 {!stats.isPremium && (
                   <div className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] px-2 py-1 rounded font-bold uppercase">
                      <i className="fas fa-lock" aria-label="Locked feature"></i> Locked
                   </div>
                )}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center text-teal-600 dark:text-teal-300 text-xl mb-4 group-hover:scale-110 transition-transform">
                   <i className="fas fa-pen-alt" aria-hidden="true"></i>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Writing Test</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Listen and type sentences.</p>
             </button>

             {/* 4. Live Interview */}
             <button 
               onClick={() => onNavigate('LIVE_INTERVIEW')}
               className={`bg-white dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all text-left group relative overflow-hidden active:scale-[0.98] ${!stats.isPremium ? 'opacity-75' : 'hover:shadow-md hover:border-patriot-red dark:hover:border-red-400'}`}
             >
                {!stats.isPremium && (
                   <div className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] px-2 py-1 rounded font-bold uppercase">
                      <i className="fas fa-lock" aria-label="Locked feature"></i> Locked
                   </div>
                )}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center text-patriot-red dark:text-red-300 text-xl mb-4 group-hover:scale-110 transition-transform">
                   <i className="fas fa-microphone-alt" aria-hidden="true"></i>
                </div>
                <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">Mock Interview</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Voice simulation with AI Officer.</p>
             </button>
          </div>
       </div>

       {/* Stats & Charts Section */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left Col: Stats */}
           <div className="lg:col-span-1 space-y-6">
               {/* Free Plan Tracker */}
               {!stats.isPremium && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-yellow-400 transition-colors">
                      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2 flex justify-between">
                          <span>Daily Free Questions</span>
                          <span className="text-yellow-600">{stats.questionsInWindow}/{FREE_LIMIT}</span>
                      </h3>
                      <div 
                        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4"
                        role="progressbar"
                        aria-valuenow={progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Daily free question limit progress"
                      >
                        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <button onClick={onUpgrade} className="w-full py-3 rounded-lg bg-gray-900 dark:bg-black text-white text-xs font-bold active:opacity-90 hover:bg-gray-800 transition-colors">
                          Unlock Unlimited Access
                      </button>
                  </div>
               )}

               <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors">
                   <h3 className="text-gray-500 dark:text-gray-400 font-medium mb-4">Overview</h3>
                   <div className="grid grid-cols-2 gap-4 text-center">
                       <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                           <p className="text-3xl font-bold text-patriot-blue dark:text-blue-300">{stats.quizzesTaken}</p>
                           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Quizzes</p>
                       </div>
                       <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                           <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                              {stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
                           </p>
                           <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">Accuracy</p>
                       </div>
                   </div>
               </div>
           </div>

           {/* Right Col: Radar Chart */}
           <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors flex flex-col min-h-[350px]">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-gray-800 dark:text-white text-lg">Topic Mastery</h3>
                 {stats.totalQuestions > 0 && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                       Live Data
                    </span>
                 )}
               </div>
               
               <div className="flex-1 relative w-full h-full">
                   {/* Screen Reader Only Table for Chart Data */}
                   <table className="sr-only">
                      <caption>Topic Mastery breakdown by percentage</caption>
                      <thead>
                        <tr>
                          <th scope="col">Topic</th>
                          <th scope="col">Mastery Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.map((item) => (
                          <tr key={item.topic}>
                            <td>{item.topic}</td>
                            <td>{item.score}%</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>

                   <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                      <PolarGrid 
                        gridType="polygon" 
                        stroke="#e5e7eb" 
                        strokeDasharray="3 3" 
                        className="dark:stroke-gray-700"
                      />
                      <PolarAngleAxis 
                        dataKey="topic" 
                        tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} 
                        tickLine={false}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={false} 
                        axisLine={false} 
                      />
                      <Radar
                        name="Mastery"
                        dataKey="score"
                        stroke="#B22234"
                        strokeWidth={3}
                        fill="#B22234"
                        fillOpacity={0.3}
                        isAnimationActive={true}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#B22234', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    </RadarChart>
                 </ResponsiveContainer>
                 
                 {stats.totalQuestions === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-[2px] rounded-xl text-center p-6">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 text-gray-400">
                           <i className="fas fa-chart-pie text-xl" aria-hidden="true"></i>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-bold">No Data Available</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Complete quizzes to see your knowledge breakdown.</p>
                        <button onClick={() => onNavigate('QUIZ')} className="mt-4 text-patriot-blue font-bold text-sm hover:underline">Start a Quiz</button>
                    </div>
                 )}
               </div>
           </div>
       </div>
    </div>
  );
};

export default Dashboard;
