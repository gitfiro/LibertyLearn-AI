
import React, { useState, useRef } from 'react';
import { UserProfile, View } from '../types';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
  onNavigate: (view: View) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Verification State
  const [verificationCode, setVerificationCode] = useState('');
  
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

  // Validation Helpers
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 chars, 1 uppercase, 1 number, 1 special char
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  const sendVerificationEmail = (targetEmail: string, code: string) => {
      // SIMULATION: Log code to console
      console.log(`%c[CivicPath Pro Email Service] Verification Code for ${targetEmail}: ${code}`, "color: #B22234; font-size: 16px; font-weight: bold; background: #f0f0f0; padding: 10px; border-radius: 5px; border: 1px solid #ccc; display: block; margin: 10px 0;");
      // In a real app, this would call an API endpoint to send an email via SendGrid/AWS SES
  };

  const initiateRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Basic Checks
    if (!email || !password || !name) {
      setError('Please fill in all required fields.');
      return;
    }

    // 2. Email Format
    if (!validateEmail(email)) {
      setError('Please enter a valid email address (e.g., name@example.com).');
      return;
    }

    // 3. Strong Password
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters and include an uppercase letter, a number, and a special character (@$!%*?&).');
      return;
    }

    // 4. Check Existing User (Mock DB)
    const storedUsers = JSON.parse(localStorage.getItem('civicPathPro_users') || '{}');
    const normalizedEmail = email.toLowerCase().trim();
    if (storedUsers[normalizedEmail]) {
      setError('An account with this email already exists. Please sign in.');
      return;
    }

    setIsLoading(true);

    // 5. Create Pending User & Simulate Sending Email
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
      
      const newUser = {
          id: `user_${Date.now()}`,
          name: name.trim(),
          email: normalizedEmail,
          password: password, // In production, hash this!
          photoUrl: previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=B22234&color=fff&rounded=true`,
          isVerified: false,
          verificationCode: code
      };

      // Save pending user to DB immediately
      storedUsers[normalizedEmail] = newUser;
      localStorage.setItem('civicPathPro_users', JSON.stringify(storedUsers));

      sendVerificationEmail(normalizedEmail, code);
      
      setIsLoading(false);
      setShowVerification(true);
      setSuccessMessage("Verification code sent! Check your console (simulation).");
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    setIsLoading(true);

    setTimeout(() => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('civicPathPro_users') || '{}');
        const normalizedEmail = email.toLowerCase().trim();
        const user = storedUsers[normalizedEmail];

        if (!user) {
            throw new Error("User not found. Please register again.");
        }

        if (user.verificationCode !== verificationCode) {
            throw new Error("Invalid verification code. Please try again.");
        }

        // Activate Account
        user.isVerified = true;
        delete user.verificationCode; // Cleanup code
        
        storedUsers[normalizedEmail] = user;
        localStorage.setItem('civicPathPro_users', JSON.stringify(storedUsers));

        setIsLoading(false);
        onLogin({ 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          photoUrl: user.photoUrl,
          isVerified: true
        });

      } catch (err: any) {
        setIsLoading(false);
        setError(err.message);
      }
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('civicPathPro_users') || '{}');
        const normalizedEmail = email.toLowerCase().trim();
        const user = storedUsers[normalizedEmail];

        if (!user || user.password !== password) {
          throw new Error('Invalid email or password.');
        }

        // ENFORCE ACTIVATION
        if (!user.isVerified) {
            // Generate new code and force verification
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.verificationCode = code;
            storedUsers[normalizedEmail] = user;
            localStorage.setItem('civicPathPro_users', JSON.stringify(storedUsers));
            
            sendVerificationEmail(user.email, code);
            
            setIsLoading(false);
            setShowVerification(true);
            setError("Account not activated. We sent a new verification code to your email.");
            return;
        }

        setIsLoading(false);
        onLogin({ 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          photoUrl: user.photoUrl,
          isVerified: user.isVerified
        });
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Authentication failed');
      }
    }, 1000);
  };

  const resendCode = () => {
      const storedUsers = JSON.parse(localStorage.getItem('civicPathPro_users') || '{}');
      const normalizedEmail = email.toLowerCase().trim();
      const user = storedUsers[normalizedEmail];
      
      if (user) {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          user.verificationCode = code;
          storedUsers[normalizedEmail] = user;
          localStorage.setItem('civicPathPro_users', JSON.stringify(storedUsers));
          sendVerificationEmail(normalizedEmail, code);
          setSuccessMessage("New code sent!");
      }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Back Button */}
      <button 
        onClick={() => onNavigate(View.LANDING)}
        className="absolute top-4 left-4 z-50 text-white md:text-white bg-black/20 md:bg-transparent hover:bg-black/30 md:hover:bg-transparent px-3 py-1 rounded-full backdrop-blur-sm md:backdrop-blur-none transition flex items-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Back to Home"
      >
         <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to Home
      </button>

      {/* Left Side - Hero */}
      <div className="md:w-1/2 bg-patriot-blue p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 mt-12 md:mt-0">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-patriot-blue">
              <i className="fas fa-star" aria-hidden="true"></i>
            </div>
            <span className="font-bold text-2xl text-white">CivicPath <span className="text-red-400">Pro</span></span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Your Journey to Citizenship Starts Here
          </h1>
        </div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10">
           <i className="fas fa-flag-usa text-[400px] text-white" aria-hidden="true"></i>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md mt-10 md:mt-0">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            
            {/* VERIFICATION MODE */}
            {showVerification ? (
              <div className="animate-fade-in text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-envelope-open-text text-2xl text-patriot-blue" aria-hidden="true"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
                <p className="text-gray-500 mb-6 text-sm">
                  To activate your account, enter the 6-digit code sent to <strong>{email}</strong>.<br/>
                  <span className="text-xs italic text-gray-400">(Demo: Check browser console for code)</span>
                </p>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2 text-left" role="alert">
                    <i className="fas fa-exclamation-circle" aria-hidden="true"></i> {error}
                  </div>
                )}
                
                {successMessage && (
                  <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2 text-left" role="alert">
                    <i className="fas fa-check-circle" aria-hidden="true"></i> {successMessage}
                  </div>
                )}

                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-xs font-bold text-gray-700 uppercase mb-1 text-left">Verification Code</label>
                    <input 
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                      placeholder="123456"
                      className="w-full text-center text-2xl tracking-widest py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none transition"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="w-full bg-patriot-blue hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                       <i className="fas fa-circle-notch fa-spin" aria-hidden="true"></i>
                    ) : (
                       <i className="fas fa-check-circle" aria-hidden="true"></i>
                    )}
                    Activate Account
                  </button>
                </form>
                
                <div className="mt-6 flex justify-between text-sm">
                    <button onClick={resendCode} className="text-gray-500 hover:text-patriot-blue underline">
                        Resend Code
                    </button>
                    <button onClick={() => setShowVerification(false)} className="text-gray-500 hover:text-patriot-blue underline">
                        Use different email
                    </button>
                </div>
              </div>
            ) : (
              /* LOGIN / REGISTER MODE */
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-gray-500 mb-6">
                  {isRegistering ? 'Secure access to your study plan.' : 'Please sign in to access your dashboard.'}
                </p>

                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 flex items-center gap-2" role="alert">
                    <i className="fas fa-exclamation-circle" aria-hidden="true"></i> {error}
                  </div>
                )}

                <form onSubmit={isRegistering ? initiateRegistration : handleLogin} className="space-y-4 mb-6">
                  {isRegistering && (
                    <div className="animate-fade-in">
                      {/* Profile Picture Upload */}
                      <div className="flex justify-center mb-6">
                        <div 
                            className="relative group cursor-pointer" 
                            onClick={() => fileInputRef.current?.click()}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                            aria-label="Upload profile picture"
                        >
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner group-hover:border-patriot-blue transition-colors bg-gray-50">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <i className="fas fa-camera text-2xl mb-1" aria-hidden="true"></i>
                                        <span className="text-[10px] uppercase font-bold">Upload</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-patriot-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                                <i className="fas fa-plus" aria-hidden="true"></i>
                            </div>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                            aria-hidden="true"
                        />
                      </div>

                      <label htmlFor="full-name" className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                      <div className="relative">
                        <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                        <input 
                          id="full-name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none transition"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                      <input 
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase mb-1">Password</label>
                    <div className="relative">
                      <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                      <input 
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none transition"
                      />
                    </div>
                    {isRegistering && (
                      <p className="text-[10px] text-gray-400 mt-1 ml-1">
                        Min 8 chars, 1 uppercase, 1 number, 1 special symbol.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-patriot-blue hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isLoading ? (
                       <i className="fas fa-circle-notch fa-spin" aria-hidden="true"></i>
                    ) : (
                       <i className={`fas ${isRegistering ? 'fa-user-plus' : 'fa-sign-in-alt'}`} aria-hidden="true"></i>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
