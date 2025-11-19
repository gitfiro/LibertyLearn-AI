import React, { useState, useEffect } from 'react';
import { View, UserStats, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import LiveInterview from './components/LiveInterview';
import FindAttorney from './components/FindAttorney';
import PaymentPage from './components/PaymentPage';
import InfoPage from './components/InfoPage';
import Resources from './components/Resources';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const defaultStats: UserStats = {
    quizzesTaken: 0,
    totalCorrect: 0,
    totalQuestions: 0,
    masteryByTopic: {
      'American Government': 0,
      'American History': 0,
      'Integrated Civics': 0,
      'Civic Duties': 0
    },
    isPremium: false,
    questionsInWindow: 0,
    windowStartTime: Date.now()
  };

  const [userStats, setUserStats] = useState<UserStats>(defaultStats);

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('libertyLearnUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView(View.DASHBOARD);
    }
  }, []);

  // Load Stats specific to the User ID whenever user changes
  useEffect(() => {
    if (user) {
      const storageKey = `libertyLearn_stats_${user.id}`;
      const savedStats = localStorage.getItem(storageKey);
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      } else {
        // New user or no history, start fresh
        setUserStats({
          ...defaultStats, 
          windowStartTime: Date.now() // Ensure fresh timer
        });
      }
    }
  }, [user]);

  // Persist stats whenever they change, if a user is logged in
  useEffect(() => {
    if (user && user.id) {
      const storageKey = `libertyLearn_stats_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(userStats));
    }
  }, [userStats, user]);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('libertyLearnUser', JSON.stringify(loggedInUser));
    setCurrentView(View.DASHBOARD);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('libertyLearnUser');
    // Stats will reset to default via the useEffect when user becomes null, but we manually clear to be safe for UI
    setUserStats(defaultStats);
    setCurrentView(View.LOGIN);
    setIsProfileMenuOpen(false);
  };

  const handleQuizComplete = (score: number, total: number) => {
    setUserStats(prev => ({
      ...prev,
      quizzesTaken: prev.quizzesTaken + 1,
      totalCorrect: prev.totalCorrect + score,
      totalQuestions: prev.totalQuestions + total,
      questionsInWindow: prev.questionsInWindow + total
    }));
    setTimeout(() => setCurrentView(View.DASHBOARD), 2000);
  };

  const handleUpgrade = () => {
    setCurrentView(View.PAYMENT);
  };

  const handlePaymentSuccess = () => {
    setUserStats(prev => ({ ...prev, isPremium: true }));
    setCurrentView(View.DASHBOARD);
  };

  const handleNavigate = (view: View) => {
    // Check for 12-hour window reset
    const now = Date.now();
    const WINDOW_DURATION = 12 * 60 * 60 * 1000; // 12 hours
    
    if (!userStats.isPremium && (now - userStats.windowStartTime > WINDOW_DURATION)) {
       setUserStats(prev => ({
         ...prev,
         questionsInWindow: 0,
         windowStartTime: now
       }));
    }

    setCurrentView(view);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // If current view is LOGIN, render just the login page (no layout)
  if (currentView === View.LOGIN) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return (
          <Dashboard 
            stats={userStats} 
            user={user}
            onNavigate={(view) => handleNavigate(view as View)} 
            onUpgrade={handleUpgrade}
          />
        );
      case View.QUIZ:
        return (
          <Quiz 
            onComplete={handleQuizComplete} 
            isPremium={userStats.isPremium}
            questionsInWindow={userStats.questionsInWindow}
            windowStartTime={userStats.windowStartTime}
            onUpgrade={handleUpgrade}
          />
        );
      case View.LIVE_INTERVIEW:
        return (
          <LiveInterview 
            isPremium={userStats.isPremium} 
            onUpgrade={handleUpgrade}
          />
        );
      case View.FIND_ATTORNEY:
        return (
          <FindAttorney />
        );
      case View.RESOURCES:
        return (
          <Resources />
        );
      case View.PAYMENT:
        return (
          <PaymentPage 
            onComplete={handlePaymentSuccess} 
            onCancel={() => handleNavigate(View.DASHBOARD)}
          />
        );
      case View.PRIVACY:
      case View.TERMS:
      case View.SUPPORT:
      case View.FAQ:
        return (
          <InfoPage 
            view={currentView} 
            onBack={() => handleNavigate(View.DASHBOARD)} 
          />
        );
      default:
        return <Dashboard stats={userStats} user={user} onNavigate={(view) => handleNavigate(view as View)} onUpgrade={handleUpgrade} />;
    }
  };

  const NavLink = ({ view, label, icon, isPremiumFeature = false }: { view: View, label: string, icon: string, isPremiumFeature?: boolean }) => (
    <button 
      onClick={() => handleNavigate(view)}
      className={`flex items-center space-x-2 w-full md:w-auto px-3 py-2 rounded-md transition ${
        currentView === view 
          ? 'bg-blue-50 text-patriot-blue font-bold' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-patriot-blue'
      }`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span>{label}</span>
      {isPremiumFeature && !userStats.isPremium && (
        <i className="fas fa-lock text-xs text-gray-400 ml-1"></i>
      )}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-patriot-slate">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => handleNavigate(View.DASHBOARD)}>
               <div className="flex items-center justify-center w-10 h-10 bg-patriot-blue rounded-lg mr-3 text-white shadow-sm">
                 <i className="fas fa-star"></i>
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-xl leading-none tracking-tight text-patriot-blue">Liberty<span className="text-patriot-red">Learn</span></span>
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                   {userStats.isPremium ? 'Premium' : 'Free Edition'}
                 </span>
               </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
               <NavLink view={View.DASHBOARD} label="Dashboard" icon="fa-chart-pie" />
               <NavLink view={View.QUIZ} label="Quiz" icon="fa-pen-alt" />
               <NavLink view={View.LIVE_INTERVIEW} label="Interview" icon="fa-microphone-alt" isPremiumFeature={true} />
               <NavLink view={View.RESOURCES} label="Resources" icon="fa-book" />
               
               {/* User Profile Dropdown or Upgrade Button */}
               <div className="ml-4 flex items-center gap-3 border-l border-gray-200 pl-4">
                  {!userStats.isPremium && (
                    <button 
                      onClick={handleUpgrade}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-110"
                      title="Upgrade to Premium"
                    >
                      <i className="fas fa-crown text-xs"></i>
                    </button>
                  )}
                  
                  {user ? (
                    <div className="relative">
                      <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className="flex items-center gap-2 focus:outline-none"
                      >
                        <img 
                          src={user.photoUrl} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full border-2 border-gray-200"
                        />
                        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden lg:block">{user.name}</span>
                        <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                      </button>

                      {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animate-fade-in z-50">
                           <div className="px-4 py-3 border-b border-gray-100">
                              <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                           </div>
                           <button onClick={handleUpgrade} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              Billing Settings
                           </button>
                           <button onClick={() => handleNavigate(View.SUPPORT)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                              Help & Support
                           </button>
                           <div className="border-t border-gray-100 mt-1">
                             <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
                                Sign Out
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleLogout()} // Actually goes to Login view
                      className="text-sm font-bold text-patriot-blue hover:underline"
                    >
                      Sign In
                    </button>
                  )}
               </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
               <button 
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
                 className="text-gray-600 hover:text-patriot-blue p-2 focus:outline-none"
               >
                  <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg z-40 border-b border-gray-200 animate-fade-in">
             <div className="flex flex-col p-4 space-y-2">
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-2">
                     <img src={user.photoUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                     <div>
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                     </div>
                  </div>
                )}
                <NavLink view={View.DASHBOARD} label="Dashboard" icon="fa-chart-pie" />
                <NavLink view={View.QUIZ} label="Practice Quiz" icon="fa-pen-alt" />
                <NavLink view={View.LIVE_INTERVIEW} label="Live Interview" icon="fa-microphone-alt" isPremiumFeature={true} />
                <NavLink view={View.RESOURCES} label="Resources" icon="fa-book" />
                <NavLink view={View.FIND_ATTORNEY} label="Find Attorney" icon="fa-gavel" />
                
                <div className="pt-4 mt-2 border-t border-gray-100 space-y-3">
                   {!userStats.isPremium && (
                    <button 
                      onClick={() => { handleUpgrade(); setIsMenuOpen(false); }}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-crown"></i> Upgrade to Premium
                    </button>
                   )}
                   {user ? (
                     <button 
                        onClick={handleLogout}
                        className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-sign-out-alt"></i> Sign Out
                      </button>
                   ) : (
                      <button 
                        onClick={handleLogout}
                        className="w-full bg-patriot-blue text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-sign-in-alt"></i> Sign In
                      </button>
                   )}
                </div>
             </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
           <p>&copy; 2024 LibertyLearn AI. Not affiliated with USCIS.</p>
           <div className="flex space-x-4 mt-4 md:mt-0">
              <button onClick={() => handleNavigate(View.FAQ)} className="hover:text-patriot-blue transition-colors">FAQ</button>
              <button onClick={() => handleNavigate(View.PRIVACY)} className="hover:text-patriot-blue transition-colors">Privacy</button>
              <button onClick={() => handleNavigate(View.TERMS)} className="hover:text-patriot-blue transition-colors">Terms</button>
              <button onClick={() => handleNavigate(View.SUPPORT)} className="hover:text-patriot-blue transition-colors">Contact Support</button>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;