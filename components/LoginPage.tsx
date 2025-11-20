
import React, { useState, useRef } from 'react';
import { UserProfile, View } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  onNavigate: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Image Upload State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        // Limit size to 2MB to prevent localStorage issues
        if (file.size > 2 * 1024 * 1024) {
            setError("Image size must be less than 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
            setError(null);
        };
        reader.readAsDataURL(file);
    }
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
        const storedUsers = JSON.parse(localStorage.getItem('citizenAchiever_users') || '{}');
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
            photoUrl: previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=B22234&color=fff&rounded=true`
          };

          // Save to mock DB
          storedUsers[normalizedEmail] = newUser;
          localStorage.setItem('citizenAchiever_users', JSON.stringify(storedUsers));

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
      {/* Back Button for Mobile/Desktop */}
      <button 
        onClick={() => onNavigate(View.LANDING)}
        className="absolute top-4 left-4 z-50 text-white md:text-white bg-black/20 md:bg-transparent hover:bg-black/30 md:hover:bg-transparent px-3 py-1 rounded-full backdrop-blur-sm md:backdrop-blur-none transition flex items-center gap-2 font-medium"
      >
         <i className="fas fa-arrow-left"></i> Back to Home
      </button>

      {/* Left Side - Hero */}
      <div className="md:w-1/2 bg-patriot-blue p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 mt-12 md:mt-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-patriot-blue">
              <i className="fas fa-star"></i>
            </div>
            <span className="font-bold text-2xl text-white">Citizen <span className="text-red-400">Achiever</span></span>
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
        <div className="w-full max-w-md mt-10 md:mt-0">
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
                  {/* Profile Picture Upload */}
                  <div className="flex justify-center mb-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner group-hover:border-patriot-blue transition-colors bg-gray-50">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                    <i className="fas fa-camera text-2xl mb-1"></i>
                                    <span className="text-[10px] uppercase font-bold">Upload</span>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-patriot-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                            <i className="fas fa-plus"></i>
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                  </div>

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
              By continuing, you agree to our <button onClick={() => onNavigate(View.TERMS)} className="underline cursor-pointer hover:text-patriot-blue bg-transparent border-none p-0 inline">Terms of Service</button> and <button onClick={() => onNavigate(View.PRIVACY)} className="underline cursor-pointer hover:text-patriot-blue bg-transparent border-none p-0 inline">Privacy Policy</button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
