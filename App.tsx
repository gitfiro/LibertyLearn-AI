
import React, { useState, useEffect, useRef } from 'react';
import { View, UserStats, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import Quiz from './components/Quiz';
import ReadingTest from './components/ReadingTest';
import WritingTest from './components/WritingTest';
import LiveInterview from './components/LiveInterview';
import FindAttorney from './components/FindAttorney';
import PaymentPage from './components/PaymentPage';
import InfoPage from './components/InfoPage';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import ChatTutor from './components/ChatTutor';
import NewsPage from './components/NewsPage';

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
    const storedUser = localStorage.getItem('citizenAchieverUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView(View.DASHBOARD);
    } else {
      // Load guest stats if no user is logged in
      const guestStats = localStorage.getItem('citizenAchiever_guest_stats');
      if (guestStats) {
        setUserStats(JSON.parse(guestStats));
      }
    }
  }, []);

  // Load Stats specific to the User ID whenever user changes
  useEffect(() => {
    if (user) {
      const storageKey = `citizenAchiever_stats_${user.id}`;
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
      const storageKey = `citizenAchiever_stats_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(userStats));
    } else {
      // Persist guest stats
      localStorage.setItem('citizenAchiever_guest_stats', JSON.stringify(userStats));
    }
  }, [userStats, user]);

  const handleLogin = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    localStorage.setItem('citizenAchieverUser', JSON.stringify(loggedInUser));
    setCurrentView(View.DASHBOARD);
    showNotification(`Welcome back, ${loggedInUser.name.split(' ')[0]}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('citizenAchieverUser');
    
    // Reset to guest stats or defaults
    const guestStats = localStorage.getItem('citizenAchiever_guest_stats');
    if (guestStats) {
      setUserStats(JSON.parse(guestStats));
    } else {
      setUserStats(defaultStats);
    }
    
    setCurrentView(View.LANDING);
    setIsProfileMenuOpen(false);
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
    localStorage.setItem('citizenAchieverUser', JSON.stringify(updatedUser));

    // 3. Update mock database
    try {
      const storedUsers = JSON.parse(localStorage.getItem('citizenAchiever_users') || '{}');
      if (storedUsers[user.email]) {
        storedUsers[user.email] = {
           ...storedUsers[user.email],
           name: updatedUser.name,
           photoUrl: updatedUser.photoUrl
        };
        localStorage.setItem('citizenAchiever_users', JSON.stringify(storedUsers));
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
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in">
            <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
                notification.type === 'success' 
                ? 'bg-white text-green-800 border-green-100' 
                : 'bg-gray-900 text-white border-gray-700'
            }`}>
                <i className={`fas ${notification.type === 'success' ? 'fa-check-circle text-green-500' : 'fa-info-circle'}`}></i>
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
        return <ReadingTest />;
      case View.WRITING:
        return <WritingTest />;
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
      className={`flex items-center space-x-2 w-full md:w-auto px-3 py-2 rounded-md transition ${
        currentView === view 
          ? 'bg-blue-50 dark:bg-blue-900/30 text-patriot-blue dark:text-blue-300 font-bold' 
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-patriot-blue dark:hover:text-blue-300'
      }`}
    >
      <i className={`fas ${icon} w-5 text-center`}></i>
      <span>{label}</span>
      {isPremiumFeature && !userStats.isPremium && (
        <i className="fas fa-lock text-xs text-gray-400 dark:text-gray-500 ml-1"></i>
      )}
    </button>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gray-50 dark:bg-gray-900 font-sans text-patriot-slate dark:text-gray-100 transition-colors duration-200">
      {/* Navigation Bar - Safe Area Aware */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700 transition-colors pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => handleNavigate(View.DASHBOARD)}>
               <div className="flex items-center justify-center w-10 h-10 bg-patriot-blue rounded-lg mr-3 text-white shadow-sm">
                 <i className="fas fa-star"></i>
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-xl leading-none tracking-tight text-patriot-blue dark:text-white">Citizen <span className="text-patriot-red">Achiever</span></span>
                 <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest font-semibold">
                   {userStats.isPremium ? 'Premium' : 'Free Edition'}
                 </span>
               </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-1">
               <NavLink view={View.DASHBOARD} label="Dashboard" icon="fa-chart-pie" />
               <NavLink view={View.QUIZ} label="Quiz" icon="fa-pen-alt" />
               <NavLink view={View.AI_TUTOR} label="AI Tutor" icon="fa-robot" isPremiumFeature={true} />
               <NavLink view={View.LIVE_INTERVIEW} label="Interview" icon="fa-microphone-alt" isPremiumFeature={true} />
               <NavLink view={View.NEWS} label="News" icon="fa-newspaper" />
               
               <div className="ml-4 flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 flex items-center justify-center transition-colors hover:bg-gray-200 dark:hover:bg-gray-600"
                    title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                  </button>

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
                          className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 object-cover"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate hidden lg:block">{user.name}</span>
                        <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                      </button>

                      {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 animate-fade-in z-50">
                           <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                              <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                           </div>
                           <button onClick={openEditProfile} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              Edit Profile
                           </button>
                           <button onClick={handleUpgrade} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              Billing Settings
                           </button>
                           <button onClick={() => handleNavigate(View.SUPPORT)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                              Help & Support
                           </button>
                           <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
                             <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">
                                Sign Out
                             </button>
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleNavigate(View.LOGIN)} 
                      className="text-sm font-bold text-patriot-blue dark:text-blue-300 hover:underline"
                    >
                      Sign In
                    </button>
                  )}
               </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3">
               <button
                  onClick={toggleDarkMode}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 flex items-center justify-center transition-colors"
                >
                  <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'}`}></i>
               </button>
               <button 
                 onClick={() => setIsMenuOpen(!isMenuOpen)}
                 className="text-gray-600 dark:text-gray-300 hover:text-patriot-blue p-2 focus:outline-none"
               >
                  <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-2xl`}></i>
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-lg z-40 border-b border-gray-200 dark:border-gray-700 animate-fade-in max-h-[calc(100dvh-4rem)] overflow-y-auto">
             <div className="flex flex-col p-4 space-y-2">
                {user && (
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700 mb-2">
                     <img src={user.photoUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                     <div>
                        <p className="font-bold text-gray-800 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                     </div>
                  </div>
                )}
                <NavLink view={View.DASHBOARD} label="Dashboard" icon="fa-chart-pie" />
                <NavLink view={View.QUIZ} label="Practice Quiz" icon="fa-pen-alt" />
                <NavLink view={View.READING} label="Reading Test" icon="fa-book-reader" />
                <NavLink view={View.WRITING} label="Writing Test" icon="fa-pen-alt" />
                <NavLink view={View.AI_TUTOR} label="AI Tutor" icon="fa-robot" isPremiumFeature={true} />
                <NavLink view={View.LIVE_INTERVIEW} label="Live Interview" icon="fa-microphone-alt" isPremiumFeature={true} />
                <NavLink view={View.NEWS} label="Immigration News" icon="fa-newspaper" />
                <NavLink view={View.FIND_ATTORNEY} label="Find Attorney" icon="fa-gavel" />
                
                <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700 space-y-3 pb-6">
                   {!userStats.isPremium && (
                    <button 
                      onClick={() => { handleUpgrade(); setIsMenuOpen(false); }}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg font-bold shadow-md flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-crown"></i> Upgrade to Premium
                    </button>
                   )}
                   {user ? (
                     <>
                      <button 
                        onClick={() => { openEditProfile(); setIsMenuOpen(false); }}
                        className="w-full bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                      >
                        <i className="fas fa-user-edit"></i> Edit Profile
                      </button>
                      <button 
                          onClick={handleLogout}
                          className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                        >
                          <i className="fas fa-sign-out-alt"></i> Sign Out
                      </button>
                     </>
                   ) : (
                      <button 
                        onClick={() => { handleNavigate(View.LOGIN); setIsMenuOpen(false); }}
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

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Profile</h3>
                <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                   <i className="fas fa-times"></i>
                </button>
             </div>
             
             <div className="p-6">
                <div className="flex flex-col items-center mb-6">
                   <div className="relative group cursor-pointer" onClick={() => editFileInputRef.current?.click()}>
                      <img 
                         src={editProfileData.photoUrl} 
                         alt="Profile" 
                         className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md" 
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <i className="fas fa-camera text-white text-xl"></i>
                      </div>
                      <div className="absolute bottom-0 right-0 bg-patriot-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white dark:border-gray-800 shadow-sm">
                        <i className="fas fa-pen"></i>
                      </div>
                   </div>
                   <input 
                      type="file" 
                      ref={editFileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleEditProfileFileChange}
                   />
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click to change photo</p>
                </div>

                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                      <input 
                         type="text" 
                         value={editProfileData.name}
                         onChange={(e) => setEditProfileData(prev => ({ ...prev, name: e.target.value }))}
                         className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-patriot-blue outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                      <input 
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative pb-[calc(2rem+env(safe-area-inset-bottom))]">
        {renderContent()}
      </main>
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in">
           <div className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' 
              ? 'bg-white dark:bg-gray-800 text-green-800 dark:text-green-300 border-green-100 dark:border-green-800' 
              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-700'
           }`}>
              <i className={`fas ${notification.type === 'success' ? 'fa-check-circle text-green-500' : 'fa-info-circle'}`}></i>
              <span className="font-medium text-sm">{notification.message}</span>
           </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto transition-colors pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
           <p>&copy; 2025 Citizen Achiever. Not affiliated with USCIS.</p>
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
