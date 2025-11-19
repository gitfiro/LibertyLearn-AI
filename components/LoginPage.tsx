import React, { useState } from 'react';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate network delay for realistic feel
    setTimeout(() => {
      const mockUser: UserProfile = {
        id: 'google_123456789',
        name: 'Alex Hamilton',
        email: 'alex.hamilton@gmail.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Alex+Hamilton&background=0D8ABC&color=fff&rounded=true'
      };
      setIsLoading(false);
      onLogin(mockUser);
    }, 1500);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isRegistering && !name) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);
    
    // Mock Database Logic
    setTimeout(() => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('libertyLearn_users') || '{}');
        const normalizedEmail = email.toLowerCase().trim();

        if (isRegistering) {
          // Check if user exists
          if (storedUsers[normalizedEmail]) {
            throw new Error('An account with this email already exists.');
          }

          // Create new user
          const newUser = {
            id: `user_${Date.now()}`,
            name: name.trim(),
            email: normalizedEmail,
            password: password, // Note: In a real production app, never store plain-text passwords
            photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=B22234&color=fff&rounded=true`
          };

          // Save to mock DB
          storedUsers[normalizedEmail] = newUser;
          localStorage.setItem('libertyLearn_users', JSON.stringify(storedUsers));

          setIsLoading(false);
          // Login with sanitized user object (exclude password)
          onLogin({ 
            id: newUser.id, 
            name: newUser.name, 
            email: newUser.email, 
            photoUrl: newUser.photoUrl 
          });

        } else {
          // Handle Login
          const user = storedUsers[normalizedEmail];
          
          if (!user || user.password !== password) {
            throw new Error('Invalid email or password.');
          }

          setIsLoading(false);
          onLogin({ 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            photoUrl: user.photoUrl 
          });
        }
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Authentication failed');
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left Side - Hero */}
      <div className="md:w-1/2 bg-patriot-blue p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-patriot-blue">
              <i className="fas fa-star"></i>
            </div>
            <span className="font-bold text-2xl text-white">Liberty<span className="text-red-400">Learn</span></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Your Journey to Citizenship Starts Here
          </h1>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
           <i className="fas fa-flag-usa text-[400px] text-white"></i>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {isRegistering ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-500 mb-6">
              {isRegistering ? 'Join thousands of future citizens today.' : 'Please sign in to access your dashboard.'}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {isRegistering && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required={isRegistering}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-patriot-blue hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading && !error ? (
                   <i className="fas fa-circle-notch fa-spin"></i>
                ) : (
                   <i className={`fas ${isRegistering ? 'fa-user-plus' : 'fa-sign-in-alt'}`}></i>
                )}
                {isLoading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-xl transition-all transform active:scale-95 mb-6 shadow-sm"
            >
              {isLoading && !error ? (
                <i className="fas fa-circle-notch fa-spin text-gray-400"></i>
              ) : (
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-5 h-5"
                />
              )}
              <span>Sign {isRegistering ? 'up' : 'in'} with Google</span>
            </button>

            <div className="text-center">
               <p className="text-sm text-gray-600">
                 {isRegistering ? "Already have an account?" : "Don't have an account?"}
                 <button 
                   onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
                   className="ml-1 font-bold text-patriot-blue hover:underline focus:outline-none"
                 >
                   {isRegistering ? 'Sign In' : 'Sign Up'}
                 </button>
               </p>
            </div>
            
            <p className="text-xs text-center text-gray-400 mt-6">
              By continuing, you agree to our <span className="underline cursor-pointer hover:text-patriot-blue">Terms of Service</span> and <span className="underline cursor-pointer hover:text-patriot-blue">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;