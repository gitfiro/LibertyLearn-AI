
import React, { useState, useEffect, useRef } from 'react';
import { View, UserStats, UserProfile } from '../types';
import Dashboard from './Dashboard';
import Quiz from './Quiz';
import ReadingTest from './ReadingTest';
import WritingTest from './WritingTest';
import LiveInterview from './LiveInterview';
import FindAttorney from './FindAttorney';
import PaymentPage from './PaymentPage';
import InfoPage from './InfoPage';
import LoginPage from './LoginPage';
import LandingPage from './LandingPage';
import ChatTutor from './ChatTutor';
import NewsPage from './NewsPage';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LANDING);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: '', photoUrl: '' });
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editNameInputRef = useRef<HTMLInputElement>(null);

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
    performanceByTopic: {}, 
    isPremium: false,
    questionsInWindow: 0,
    windowStartTime: Date.now()
  };

  const [userStats, setUserStats] = useState<UserStats>(defaultStats);

  // Initialize Dark Mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  // Show notification helper
  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Load user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('civicPathProUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView(View.DASHBOARD);
    } else {
      // Load guest stats if no user is logged in
      const guestStats = localStorage.getItem('civicPathPro_guest_stats');
      if (guestStats) {
        setUserStats(JSON.parse(guestStats));
      }
    }
  }, []);

  // Load Stats specific to the User ID whenever user changes
  useEffect(() => {
    if (user) {
      const storageKey = `civicPathPro_stats_${user.id}`;
      const savedStats = localStorage.getItem(storageKey);
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      } else {
        // New user or no history, start fresh (or migrate guest stats?)
        // For now, we start fresh to distinguish accounts
        setUserStats({
          ...defaultStats, 
          windowStartTime: Date.now() 
        });
      }
    }
  }, [user]);

  // Persist stats whenever they change
  useEffect(() => {
    if (user && user.id) {
      const storageKey = `civicPathPro_stats_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(userStats));
    } else {
      // Persist guest stats
      localStorage.setItem('civicPathPro_guest_stats', JSON.stringify(userStats));
    }
  }, [userStats, user]);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('civicPathProUser', JSON.stringify(loggedInUser));
    setCurrentView(View.DASHBOARD);
    showNotification(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('civicPathProUser');
    
    // Reset to guest stats or defaults
    const guestStats = localStorage.getItem('civicPathPro_guest_stats');
    if (guestStats) {
      setUserStats(JSON.parse(guestStats));
    } else {
      setUserStats(defaultStats);
    }
    
    setCurrentView(View.LANDING);
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    showNotification('Successfully signed out.', 'info');
  };

  const handleQuizComplete = (
    score: number, 
    total: number,
    breakdown: Record<string, { correct: number; total: number }> = {}
  ) => {
    setUserStats(prev => {
      const currentPerf = prev.performanceByTopic || {};
      const newPerf = { ...currentPerf };
      const newMastery = { ...prev.masteryByTopic };

      Object.entries(breakdown).forEach(([category, stats]) => {
        if (!newPerf[category]) {
             newPerf[category] = { correct: 0, total: 0 };
        }
        newPerf[category].correct += stats.correct;
        newPerf[category].total += stats.total;
        
        if (newPerf[category].total > 0) {
            newMastery[category] = Math.round((newPerf[category].correct / newPerf[category].total) * 100);
        }
      });

      return {
        ...prev,
        quizzesTaken: prev.quizzesTaken + 1,
        totalCorrect: prev.totalCorrect + score,
        totalQuestions: prev.totalQuestions + total,
        questionsInWindow: prev.questionsInWindow + total,
        masteryByTopic: newMastery,
        performanceByTopic: newPerf
      };
    });
    
    showNotification('Quiz progress saved!', 'success');
    setTimeout(() => setCurrentView(View.DASHBOARD), 1500);
  };

  const handleUpgrade = () => {
    if (!user) {
       showNotification('Please sign in to upgrade.', 'info');
       setCurrentView(View.LOGIN);
       return;
    }
    setCurrentView(View.PAYMENT);
  };

  const handlePaymentSuccess = () => {
    setUserStats(prev => ({ ...prev, isPremium: true }));
    setCurrentView(View.DASHBOARD);
    showNotification('Premium features unlocked!', 'success');
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

  // Profile Editing Functions
  const openEditProfile = () => {
    if (user) {
      setEditProfileData({ name: user.name, photoUrl: user.photoUrl });
      setIsEditProfileOpen(true);
      setIsProfileMenuOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleEditProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification("Image size must be less than 2MB.", 'info');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProfileChanges = () => {
    if (!user) return;
    if (!editProfileData.name.trim()) {
      showNotification("Name cannot be empty.", 'info');
      return;
    }

    const updatedUser = {
      ...user,
      name: editProfileData.name.trim(),
      photoUrl: editProfileData.photoUrl
    };

    // 1. Update state
    setUser(updatedUser);
    
    // 2. Update current session storage
    localStorage.setItem('civicPathProUser', JSON.stringify(updatedUser));

    // 3. Update mock database
    try {
      const storedUsers = JSON.parse(localStorage.getItem('civicPathPro_users') || '{}');
      if (storedUsers[user.email]) {
        storedUsers[user.email] = {
           ...storedUsers[user.email],
           name: updatedUser.name,
           photoUrl: updatedUser.photoUrl
        };
        localStorage.setItem('civicPathPro_users', JSON.stringify(storedUsers));
      }
    } catch (e) {
      console.error("Failed to update database", e);
    }

    setIsEditProfileOpen(false);
    showNotification("Profile updated successfully!", 'success');
  };

  // Standalone Views (No Main Layout)
  if (currentView === View.LOGIN) {
    return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
  }

  if (currentView === View.LANDING) {
    return (
      <>
        <LandingPage onNavigate={handleNavigate} />
        {/* Global Notification Toast */}
        {notification && (
            <div role="alert" className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in">
            <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
                notification.type === 'success' 
                ? 'bg-white text-green-800 border-green-100' 
                : 'bg-gray-900 text-white border-gray-700'
            }`}>
                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle text-green-500' : 'fa-info-circle'}`} aria-hidden="true"></i>
                <span className="font-medium text-sm">{notification.message}</span>
            </div>
            </div>
        )}
      </>
    );
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
      case View.READING:
        return (
          <ReadingTest 
            isPremium={userStats.isPremium}
            onUpgrade={handleUpgrade}
          />
        );
      case View.WRITING:
        return (
          <WritingTest 
            isPremium={userStats.isPremium}
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
      case View.AI_TUTOR:
        return (
          <ChatTutor 
            isPremium={userStats.isPremium}
            onUpgrade={handleUpgrade}
          />
        );
      case View.FIND_ATTORNEY:
        return (
          <FindAttorney />
        );
      case View.NEWS:
        return (
          <NewsPage />
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
      className={`flex items-center space-x-2 px-3 py-2 rounded-md transition text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-patriot-blue ${
        currentView === view 
          ? 'bg-blue-50 dark:bg-blue-900/30 text-patriot-blue dark:text-blue-300' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-patriot-blue dark:hover:text-blue-300'
      }`}
      aria-current={currentView === view ? 'page' : undefined}
    >
      <i className={`fas ${icon} w-5 text-center`} aria-hidden="true"></i>
      <span>{label}</span>
      {isPremiumFeature && !userStats.isPremium && (
        <i className="fas fa-lock text-xs text-gray-400 dark:text-gray-500 ml-1" aria-label="Locked feature"></i>
      )}
    </button>
  );

  const MenuLink = ({ view, label, icon, isPremium = false }: { view: View, label: string, icon: string, isPremium?: boolean }) => (
    <button 
      onClick={() => { handleNavigate(view); setIsMenuOpen(false); }}
      className={`w-full flex items-center p-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-patriot-blue ${currentView === view ? 'bg-blue-50 dark:bg-blue-900/20 text-patriot-blue dark:text-blue-300' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
      aria-current={currentView === view ? 'page' : undefined}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${currentView === view ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <i className={`fas ${icon} ${currentView === view ? 'text-patriot-blue dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`} aria-hidden="true"></i>
      </div>
      <span className="font-medium flex-1 text-left">{label}</span>
      {isPremium && !userStats.isPremium && <i className="fas fa-lock text-gray-400 text-xs" aria-label="Locked"></i>}
      <i className="fas fa-chevron-right text-gray-300 text-xs" aria-hidden="true"></i>
    </button>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-900 font-sans text-patriot-slate dark:text-gray-100 transition-colors duration-200">
      
      {/* Main Navigation Bar (Responsive) */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 w-full z-50 border-b border-gray-200 dark:border-gray-700 transition-colors pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div 
                className="flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-patriot-blue rounded-lg p-1" 
                onClick={() => handleNavigate(View.DASHBOARD)}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate(View.DASHBOARD)}
                tabIndex={0}
                role="button"
                aria-label="Go to Dashboard"
            >
               <div className="flex items-center justify-center w-10 h-10 bg-patriot-blue rounded-lg mr-3 text-white shadow-sm">
                 <i className="fas fa-star" aria-hidden="true"></i>
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-xl leading-none tracking-tight text-patriot-blue dark:text-white">CivicPath <span className="text-patriot-red">Pro</span></span>
                 <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                   {userStats.isPremium ? 'Premium' : 'Free Edition'}
                 </span>
               </div>
            </div>

            {/* Desktop Menu Links */}
            <div className="hidden md:flex items-center space-x-1">
               <NavLink view={View.DASHBOARD} label="Dashboard" icon="fa-chart-pie" />
               <NavLink view={View.QUIZ} label="Quiz" icon="fa-question-circle" />
               <NavLink view={View.AI_TUTOR} label="AI Tutor" icon="fa-robot" isPremiumFeature={true} />
               <NavLink view={View.LIVE_INTERVIEW} label="Interview" icon="fa-microphone-alt" isPremiumFeature={true} />
               <NavLink view={View.NEWS} label="News" icon="fa-newspaper" />
            </div>
            
            {/* Right Side Controls (Desktop & Mobile) */}
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 flex items-center justify-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`} aria-hidden="true"></i>
              </button>

              {/* Desktop Upgrade Button */}
              <div className="hidden md:block">
                {!userStats.isPremium && (
                  <button 
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    aria-label="Upgrade to Premium"
                  >
                    <i className="fas fa-crown text-xs" aria-hidden="true"></i>
                  </button>
                )}
              </div>
              
              {/* Desktop Profile Dropdown */}
              <div className="hidden md:block">
                {user ? (
                  <div className="relative">
                    <button 
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-patriot-blue rounded-full p-1"
                      aria-expanded={isProfileMenuOpen}
                      aria-haspopup="true"
                      aria-label="User menu"
                    >
                      <img 
                        src={user.photoUrl} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate hidden lg:block">{user.name}</span>
                      <i className="fas fa-chevron-down text-gray-400 text-xs" aria-hidden="true"></i>
                    </button>

                    {isProfileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 animate-fade-in z-50" role="menu">
                         <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                            <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                         </div>
                         <button onClick={openEditProfile} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" role="menuitem">
                            Edit Profile
                         </button>
                         <button onClick={handleUpgrade} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" role="menuitem">
                            Billing Settings
                         </button>
                         <button onClick={() => handleNavigate(View.SUPPORT)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" role="menuitem">
                            Help & Support
                         </button>
                         <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                           <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium" role="menuitem">
                              Sign Out
                           </button>
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleNavigate(View.LOGIN)} 
                    className="text-sm font-bold text-patriot-blue dark:text-blue-300 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-patriot-blue rounded px-2 py-1"
                  >
                    Sign In
                  </button>
                )}
              </div>

              {/* Mobile Hamburger Menu Trigger */}
              <div className="md:hidden">
                 <button 
                     onClick={() => setIsMenuOpen(true)} 
                     className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-patriot-blue"
                     aria-label="Open menu"
                     aria-expanded={isMenuOpen}
                 >
                     <i className="fas fa-bars text-xl" aria-hidden="true"></i>
                 </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[calc(6rem+env(safe-area-inset-top))]">
        {renderContent()}
      </main>

      {/* Full Screen Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
            className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 animate-fade-in flex flex-col md:hidden" 
            role="dialog" 
            aria-modal="true"
            aria-label="Mobile Menu"
        >
           {/* Menu Header */}
           <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-patriot-blue dark:text-white">Menu</h2>
              <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close menu">
                 <i className="fas fa-times text-xl" aria-hidden="true"></i>
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {/* User Info Card */}
              {user ? (
                 <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 flex items-center gap-4 mb-6 border border-gray-100 dark:border-gray-700">
                    <img src={user.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover" aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                       <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={openEditProfile} className="text-patriot-blue dark:text-blue-300" aria-label="Edit Profile">
                       <i className="fas fa-pen" aria-hidden="true"></i>
                    </button>
                 </div>
              ) : (
                 <div className="bg-patriot-blue rounded-xl p-6 text-center text-white mb-6 shadow-lg shadow-blue-200 dark:shadow-none">
                    <h3 className="font-bold text-lg mb-2">Join CivicPath Pro</h3>
                    <p className="text-sm text-blue-100 mb-4">Save progress and unlock features.</p>
                    <button onClick={() => { handleNavigate(View.LOGIN); setIsMenuOpen(false); }} className="bg-white text-patriot-blue px-6 py-2 rounded-full font-bold text-sm">Sign In / Sign Up</button>
                 </div>
              )}

              {/* Menu Links */}
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-2 mb-2 px-2" role="heading" aria-level={3}>Practice</p>
              <MenuLink view={View.DASHBOARD} label="Dashboard" icon="fa-chart-pie" />
              <MenuLink view={View.QUIZ} label="Civics Quiz" icon="fa-question-circle" />
              <MenuLink view={View.READING} label="Reading Test" icon="fa-book-reader" isPremium={true} />
              <MenuLink view={View.WRITING} label="Writing Test" icon="fa-pen-alt" isPremium={true} />
              
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-6 mb-2 px-2" role="heading" aria-level={3}>Premium Features</p>
              <MenuLink view={View.AI_TUTOR} label="AI Tutor" icon="fa-robot" isPremium={true} />
              <MenuLink view={View.LIVE_INTERVIEW} label="Live Mock Interview" icon="fa-microphone-alt" isPremium={true} />
              
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-6 mb-2 px-2" role="heading" aria-level={3}>Resources</p>
              <MenuLink view={View.NEWS} label="Immigration News" icon="fa-newspaper" />
              <MenuLink view={View.FIND_ATTORNEY} label="Find an Attorney" icon="fa-gavel" />
              
              {!userStats.isPremium && (
                 <button 
                   onClick={() => { handleUpgrade(); setIsMenuOpen(false); }}
                   className="w-full mt-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                 >
                   <i className="fas fa-crown" aria-hidden="true"></i> Upgrade to Premium
                 </button>
              )}
              
              {user && (
                 <button 
                   onClick={handleLogout}
                   className="w-full mt-6 p-4 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                 >
                   <i className="fas fa-sign-out-alt" aria-hidden="true"></i> Sign Out
                 </button>
              )}
           </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div 
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 id="edit-profile-title" className="text-xl font-bold text-gray-800 dark:text-white">Edit Profile</h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close modal">
                   <i className="fas fa-times" aria-hidden="true"></i>
                </button>
             </div>
             
             <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                   <div className="relative group cursor-pointer" onClick={() => editFileInputRef.current?.click()} role="button" aria-label="Change profile photo" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && editFileInputRef.current?.click()}>
                      <img 
                         src={editProfileData.photoUrl} 
                         alt="Profile" 
                         className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md" 
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <i className="fas fa-camera text-white text-xl" aria-hidden="true"></i>
                      </div>
                      <div className="absolute bottom-0 right-0 bg-patriot-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white dark:border-gray-800 shadow-sm">
                        <i className="fas fa-pen" aria-hidden="true"></i>
                      </div>
                   </div>
                   <input 
                      type="file" 
                      ref={editFileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleEditProfileFileChange}
                      aria-label="Upload profile photo"
                   />
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to change photo</p>
                </div>

                <div className="space-y-4">
                   <div>
                      <label htmlFor="edit-name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input 
                         id="edit-name"
                         type="text" 
                         ref={editNameInputRef}
                         autoFocus
                         value={editProfileData.name}
                         onChange={(e) => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                         className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-patriot-blue outline-none"
                      />
                   </div>
                   <div>
                      <label htmlFor="edit-email" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input 
                         id="edit-email"
                         type="text" 
                         value={user?.email}
                         disabled
                         className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                   </div>
                </div>
             </div>

             <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex gap-3 justify-end border-t border-gray-100 dark:border-gray-700">
                <button 
                   onClick={() => setIsEditProfileOpen(false)}
                   className="px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition"
                >
                   Cancel
                </button>
                <button 
                   onClick={saveProfileChanges}
                   className="px-6 py-2 rounded-lg bg-patriot-blue text-white font-bold hover:bg-blue-900 transition shadow-md"
                >
                   Save Changes
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div role="alert" className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in w-full max-w-md px-4">
           <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border justify-center ${
              notification.type === 'success' 
              ? 'bg-white dark:bg-gray-800 text-green-800 dark:text-green-300 border-green-100 dark:border-green-800' 
              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-700'
           }`}>
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle text-green-500' : 'fa-info-circle'}`} aria-hidden="true"></i>
              <span className="font-medium text-sm">{notification.message}</span>
           </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
           <p>&copy; 2025 CivicPath Pro. Not affiliated with USCIS.</p>
           <div className="flex space-x-4 mt-4 md:mt-0">
              <button onClick={() => handleNavigate(View.FAQ)} className="hover:text-patriot-blue dark:hover:text-blue-300 transition-colors">FAQ</button>
              <button onClick={() => handleNavigate(View.PRIVACY)} className="hover:text-patriot-blue dark:hover:text-blue-300 transition-colors">Privacy</button>
              <button onClick={() => handleNavigate(View.TERMS)} className="hover:text-patriot-blue dark:hover:text-blue-300 transition-colors">Terms</button>
              <button onClick={() => handleNavigate(View.SUPPORT)} className="hover:text-patriot-blue dark:hover:text-blue-300 transition-colors">Contact Support</button>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
