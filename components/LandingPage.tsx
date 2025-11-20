import React from 'react';
import { View } from '../types';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans text-patriot-slate dark:text-gray-100 flex flex-col transition-colors">
      {/* Navigation */}
      <nav className="w-full border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-patriot-blue rounded-xl flex items-center justify-center text-white shadow-md transform transition hover:rotate-12">
              <i className="fas fa-star"></i>
            </div>
            <span className="font-bold text-2xl text-patriot-blue dark:text-white tracking-tight">Citizen <span className="text-patriot-red">Achiever</span></span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate(View.LOGIN)} 
              className="text-gray-600 dark:text-gray-300 font-semibold hover:text-patriot-blue dark:hover:text-white transition hidden sm:block"
            >
              Sign In
            </button>
            <button 
              onClick={() => onNavigate(View.LOGIN)} 
              className="bg-patriot-blue text-white px-6 py-2.5 rounded-full font-bold shadow-lg hover:bg-blue-900 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex-1 flex flex-col justify-center relative overflow-hidden pt-16 pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 opacity-5 dark:opacity-10 pointer-events-none">
           <i className="fas fa-flag-usa text-[600px] absolute top-10 right-10 transform rotate-12 text-patriot-blue dark:text-white"></i>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
            Master Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-patriot-blue to-patriot-red dark:from-blue-400 dark:to-red-400">US Citizenship Test</span>
          </h1>
          
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Prepare with confidence using our adaptive AI tutor. Practice real-time voice interviews, master the 100 civics questions, and track your progress.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md mx-auto">
            <button 
              onClick={() => onNavigate(View.DASHBOARD)} 
              className="flex-1 bg-patriot-red text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-red-700 hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Free Practice <i className="fas fa-arrow-right"></i>
            </button>
            <button 
               onClick={() => onNavigate(View.DASHBOARD)}
               className="flex-1 bg-white dark:bg-transparent dark:text-white text-gray-700 border-2 border-gray-200 dark:border-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-patriot-blue dark:hover:border-white hover:text-patriot-blue transition-all flex items-center justify-center gap-2"
            >
               <i className="fas fa-play-circle"></i> Try Demo
            </button>
          </div>
          
          <p className="mt-6 text-sm text-gray-400">
             <i className="fas fa-check-circle text-green-500 mr-1"></i> Updated for 2008 Civics Test
             <span className="mx-3">•</span>
             <i className="fas fa-check-circle text-green-500 mr-1"></i> No credit card required
          </p>
        </div>
      </header>

      {/* Feature Grid */}
      <section className="bg-gray-50 dark:bg-gray-800 py-24 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-patriot-blue dark:text-white mb-4">Everything You Need to Pass</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">We combine official USCIS study materials with cutting-edge AI to create the most effective study companion available.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all group">
                 <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-patriot-blue dark:text-blue-300 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i className="fas fa-microphone-alt"></i>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI Mock Interviews</h3>
                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Practice talking to a virtual USCIS officer. Our AI listens to your speech and provides real-time feedback to help you ace the interview.
                 </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all group">
                 <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center text-patriot-red dark:text-red-300 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i className="fas fa-brain"></i>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Adaptive Quizzes</h3>
                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Stop wasting time on questions you already know. Our system tracks your mastery and focuses on your weak spots automatically.
                 </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all group">
                 <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 text-2xl mb-6 group-hover:scale-110 transition-transform">
                    <i className="fas fa-comment-dots"></i>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">24/7 Civics Tutor</h3>
                 <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Confused about the "Rule of Law"? Just ask. Your personal AI tutor is always available to explain complex concepts simply.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-patriot-blue relative overflow-hidden">
         <div className="absolute inset-0 opacity-10">
            <i className="fas fa-star text-9xl absolute -top-10 -left-10 text-white"></i>
            <i className="fas fa-star text-9xl absolute bottom-10 right-10 text-white"></i>
         </div>
         <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to become a U.S. Citizen?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of applicants who are studying smarter, not harder. Start your free preparation today.</p>
            <button 
               onClick={() => onNavigate(View.LOGIN)}
               className="bg-white text-patriot-blue px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:bg-blue-50 transition-all transform hover:scale-105"
            >
               Create Free Account
            </button>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                   <i className="fas fa-star text-gray-600"></i>
                   <span className="font-bold text-gray-300">Citizen Achiever</span>
                </div>
                <p className="text-xs text-gray-500">&copy; 2025 Citizen Achiever. Not affiliated with USCIS.</p>
            </div>
            <div className="flex gap-6 text-sm">
               <button onClick={() => onNavigate(View.FAQ)} className="hover:text-white transition">FAQ</button>
               <button onClick={() => onNavigate(View.TERMS)} className="hover:text-white transition">Terms</button>
               <button onClick={() => onNavigate(View.PRIVACY)} className="hover:text-white transition">Privacy</button>
               <button onClick={() => onNavigate(View.SUPPORT)} className="hover:text-white transition">Contact</button>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default LandingPage;