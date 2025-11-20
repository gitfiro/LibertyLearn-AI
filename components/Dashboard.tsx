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
  
  const data = Object.keys(stats.masteryByTopic).map(key => ({
    topic: key,
    score: stats.masteryByTopic[key],
  }));

  const FREE_LIMIT = 5;
  // Calculate remaining based on the 12h window, not total questions
  const questionsLeft = Math.max(0, FREE_LIMIT - stats.questionsInWindow);
  const progressPercent = Math.min(100, (stats.questionsInWindow / FREE_LIMIT) * 100);

  return (
    <div className="space-y-8 animate-fade-in">
       {/* Hero Section */}
       <div className="bg-gradient-to-r from-patriot-blue to-blue-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <h1 className="text-3xl font-bold">
                 Welcome back, {user ? user.name.split(' ')[0] : 'Future Citizen'}!
               </h1>
               {stats.isPremium && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide"><i className="fas fa-crown mr-1"></i> Premium</span>}
            </div>
            <p className="text-blue-100 mb-6 max-w-lg">You are on the path to the American Dream. Continue your preparation with our AI-powered tools.</p>
            <div className="flex flex-wrap gap-4">
                <button onClick={() => onNavigate('QUIZ')} className="bg-white text-patriot-blue px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition shadow-lg">
                    <i className="fas fa-pen-alt mr-2"></i> Take a Quiz
                </button>
                {stats.isPremium ? (
                   <button onClick={() => onNavigate('LIVE_INTERVIEW')} className="bg-patriot-red text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition shadow-lg">
                       <i className="fas fa-microphone mr-2"></i> Mock Interview
                   </button>
                ) : (
                   <button onClick={onUpgrade} className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold hover:from-yellow-500 hover:to-orange-600 transition shadow-lg">
                       <i className="fas fa-crown mr-2"></i> Upgrade Plan
                   </button>
                )}
            </div>
          </div>
          <div className="absolute right-0 top-0 opacity-10 text-9xl transform translate-x-10 -translate-y-10">
             <i className="fas fa-flag-usa"></i>
          </div>
       </div>

       {/* Free Plan Status Card */}
       {!stats.isPremium && (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border-l-4 border-yellow-400 flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
             <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1"><i className="fas fa-info-circle text-yellow-500 mr-2"></i> Free Basic Access</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                   You have {questionsLeft} free questions remaining for this 12-hour period.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                   <div className="bg-yellow-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                   <span>0</span>
                   <span>{stats.questionsInWindow} used</span>
                   <span>{FREE_LIMIT} limit</span>
                </div>
             </div>
             <button 
               onClick={onUpgrade} 
               className="whitespace-nowrap bg-gray-900 dark:bg-black text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-black transition flex items-center gap-2"
             >
                <i className="fas fa-rocket"></i> Get Unlimited Access
             </button>
         </div>
       )}

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-gray-500 dark:text-gray-400 font-medium">Quizzes Taken</h3>
                 <i className="fas fa-clipboard-list text-blue-500 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg"></i>
             </div>
             <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.quizzesTaken}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-gray-500 dark:text-gray-400 font-medium">Questions Answered</h3>
                 <i className="fas fa-tasks text-green-500 bg-green-100 dark:bg-green-900/30 p-2 rounded-lg"></i>
             </div>
             <p className="text-3xl font-bold text-gray-800 dark:text-white">{stats.totalQuestions}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-gray-500 dark:text-gray-400 font-medium">Average Accuracy</h3>
                 <i className="fas fa-bullseye text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg"></i>
             </div>
             <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
             </p>
          </div>
       </div>

       {/* Topic Mastery - Radar Chart & Breakdowns */}
       <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Topic Mastery Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visualizing your strengths across civics categories</p>
            </div>
             <span className="hidden sm:block text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Real-time Analysis</span>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Radar Chart */}
              <div className="h-80 w-full lg:w-1/2 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                      <PolarGrid gridType="polygon" stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="topic" 
                        tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 600 }} 
                      />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Mastery"
                        dataKey="score"
                        stroke="#B22234"
                        strokeWidth={3}
                        fill="#B22234"
                        fillOpacity={0.2}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                        itemStyle={{ color: '#B22234', fontWeight: 'bold' }}
                        formatter={(value: number) => [`${value}%`, 'Score']}
                      />
                    </RadarChart>
                 </ResponsiveContainer>
                 
                 {/* Empty State Overlay if no data */}
                 {stats.totalQuestions === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Take a quiz to see your analysis</p>
                        </div>
                    </div>
                 )}
              </div>
              
              {/* Detailed Breakdown Cards */}
              <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {data.map((item, idx) => (
                     <div key={idx} className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-blue-200 hover:shadow-md transition-all bg-gray-50 dark:bg-gray-700/50 group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider truncate pr-2" title={item.topic}>{item.topic}</span>
                            {item.score >= 80 ? <i className="fas fa-check-circle text-green-500"></i> : 
                             item.score >= 50 ? <i className="fas fa-adjust text-yellow-500"></i> : 
                             <i className="fas fa-exclamation-circle text-red-400"></i>}
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-2xl font-bold text-gray-800 dark:text-white group-hover:text-patriot-blue dark:group-hover:text-blue-300 transition-colors">{item.score}%</span>
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-1.5 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                        item.score >= 80 ? 'bg-green-500' : 
                                        item.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`} 
                                    style={{ width: `${item.score}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                            {item.score >= 80 ? 'Excellent mastery' : item.score >= 50 ? 'Keep practicing' : 'Needs attention'}
                        </p>
                     </div>
                 ))}
              </div>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;