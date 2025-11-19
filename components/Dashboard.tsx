import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { UserStats, UserProfile } from '../types';

interface DashboardProps {
  stats: UserStats;
  user: UserProfile | null;
  onNavigate: (view: string) => void;
  onUpgrade: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, user, onNavigate, onUpgrade }) => {
  
  const data = Object.keys(stats.masteryByTopic).map(key => ({
    name: key,
    score: stats.masteryByTopic[key],
  }));

  const COLORS = ['#3C3B6E', '#B22234', '#4B5563', '#2563EB'];
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
         <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-400 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="flex-1 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-1"><i className="fas fa-info-circle text-yellow-500 mr-2"></i> Free Basic Access</h3>
                <p className="text-gray-600 text-sm mb-3">
                   You have {questionsLeft} free questions remaining for this 12-hour period.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                   <div className="bg-yellow-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                   <span>0</span>
                   <span>{stats.questionsInWindow} used</span>
                   <span>{FREE_LIMIT} limit</span>
                </div>
             </div>
             <button 
               onClick={onUpgrade} 
               className="whitespace-nowrap bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-black transition flex items-center gap-2"
             >
                <i className="fas fa-rocket"></i> Get Unlimited Access
             </button>
         </div>
       )}

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-gray-500 font-medium">Quizzes Taken</h3>
                 <i className="fas fa-clipboard-list text-blue-500 bg-blue-100 p-2 rounded-lg"></i>
             </div>
             <p className="text-3xl font-bold text-gray-800">{stats.quizzesTaken}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-gray-500 font-medium">Questions Answered</h3>
                 <i className="fas fa-tasks text-green-500 bg-green-100 p-2 rounded-lg"></i>
             </div>
             <p className="text-3xl font-bold text-gray-800">{stats.totalQuestions}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                 <h3 className="text-gray-500 font-medium">Average Accuracy</h3>
                 <i className="fas fa-bullseye text-red-500 bg-red-100 p-2 rounded-lg"></i>
             </div>
             <p className="text-3xl font-bold text-gray-800">
                {stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0}%
             </p>
          </div>
       </div>

       {/* Chart Section */}
       <div className="bg-white p-6 rounded-xl shadow border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Topic Mastery</h3>
          <div className="h-64 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                   <YAxis hide />
                   <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                   <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={40}>
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                   </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
       </div>
    </div>
  );
};

export default Dashboard;