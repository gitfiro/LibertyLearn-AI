
import React, { useState } from 'react';
import { View } from '../types';

interface LandingPageProps {
  onNavigate: (view: View) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  const handleStart = () => {
    if (state && zip) {
      localStorage.setItem('civicPath_location', JSON.stringify({ state, zip }));
    }
    onNavigate(View.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-[#1a237e] font-sans text-white flex flex-col relative overflow-hidden">
      {/* Background Flag Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <i className="fas fa-flag-usa text-[800px] absolute top-[-100px] -right-[200px] text-white transform rotate-12"></i>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 z-10">
        
        {/* Flag Icon */}
        <div className="flex justify-center mb-8">
           <div className="w-16 h-10 relative">
              <i className="fas fa-flag-usa text-5xl"></i>
           </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4 leading-tight">
            Your Path to<br/>Citizenship Starts Here
          </h1>
          <p className="text-blue-200 text-sm max-w-xs mx-auto leading-relaxed">
            To personalize your study guide, please tell us where you live.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div>
            <input 
              type="text" 
              placeholder="State" 
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-white text-gray-900 placeholder-gray-400 px-6 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
            />
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="ZIP Code" 
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full bg-white text-gray-900 placeholder-gray-400 px-6 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 border-2 border-gray-300 rounded-full w-5 h-5 flex items-center justify-center">
               <div className="w-2 h-2 bg-transparent"></div> 
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-8 transform scale-95 opacity-90 mx-auto w-full max-w-xs">
           <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-800">Mastery Dashboard</span>
              <i className="fas fa-cog text-gray-300 text-xs"></i>
           </div>
           <div className="space-y-2">
              <div className="bg-gray-100 h-6 rounded w-full"></div>
              <div className="bg-gray-100 h-6 rounded w-3/4"></div>
           </div>
           <div className="mt-4 bg-[#1a237e] text-white text-xs py-2 rounded-full text-center">
              Get My Local Answers
           </div>
        </div>

        <button 
          onClick={handleStart}
          className="w-full bg-[#1a237e] border border-white/30 hover:bg-blue-900 text-white font-bold py-4 rounded-full shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-2xl transition-all mb-4"
        >
          Get My Local Answers
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
