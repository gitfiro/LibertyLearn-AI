
import React, { useEffect } from 'react';
import { UserProfile } from '../types';

interface PaymentPageProps {
  user: UserProfile | null;
  onComplete: () => void;
  onCancel: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ user, onComplete, onCancel }) => {
  
  useEffect(() => {
    // Initialize Lemon Squeezy event handler
    // Ensure the script is loaded in index.html: <script src="https://app.lemonsqueezy.com/js/lemon.js" defer></script>
    const ls = (window as any).LemonSqueezy;
    if (ls) {
      ls.Setup({
        eventHandler: (event: any) => {
          // Listen for successful payment events to unlock premium
          if (event.event === 'Payment.Success') {
            onComplete();
          }
        }
      });
    }
  }, [onComplete]);

  const handleCheckout = (plan: 'biweekly' | 'monthly') => {
    // -------------------------------------------------------------------------
    // IMPORTANT: Replace these URLs with your actual Lemon Squeezy Checkout Links
    // 1. Go to Lemon Squeezy Dashboard > Products
    // 2. Click "Share" on your product/variant
    // 3. Copy the "Checkout Link"
    // -------------------------------------------------------------------------
    const CHECKOUT_URLS = {
        // Placeholder URLs - these need to be replaced with your real product links
        biweekly: 'https://civicpath.lemonsqueezy.com/checkout/buy/e4741369-0746-4444-a957-555555555555', 
        monthly: 'https://civicpath.lemonsqueezy.com/checkout/buy/e4741369-0746-4444-a957-666666666666'
    };

    const baseUrl = CHECKOUT_URLS[plan];
    
    // Append user data to prefill the checkout form
    const emailParam = user?.email ? `&checkout[email]=${encodeURIComponent(user.email)}` : '';
    const nameParam = user?.name ? `&checkout[name]=${encodeURIComponent(user.name)}` : '';
    // Pass User ID as custom data if needed for backend webhooks
    const customParam = user?.id ? `&checkout[custom][user_id]=${user.id}` : '';
    
    // Add embed=1 to trigger the overlay mode instead of a redirect
    const checkoutUrl = `${baseUrl}?embed=1${emailParam}${nameParam}${customParam}`;

    const ls = (window as any).LemonSqueezy;
    if (ls) {
        ls.Url.Open(checkoutUrl);
    } else {
        console.warn("Lemon Squeezy SDK not loaded or blocked. Opening in new tab.");
        window.open(checkoutUrl, '_blank');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in">
      <button
        onClick={onCancel}
        className="mb-6 text-gray-500 dark:text-gray-400 hover:text-patriot-blue dark:hover:text-blue-300 font-medium flex items-center gap-2 transition-colors"
        aria-label="Back to Dashboard"
      >
        <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to Dashboard
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-patriot-blue dark:text-white mb-4">Unlock Your American Dream</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Get unlimited access to AI-powered study tools, personalized tutoring, and real-time mock interviews.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* Bi-Weekly Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 relative transition-all hover:shadow-xl flex flex-col">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase border border-gray-200 dark:border-gray-600">
            Flexible
          </div>
          <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">Bi-Weekly Access</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">$5.99</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">/ 14 days</span>
          </div>
          <ul className="space-y-4 mb-8 text-gray-600 dark:text-gray-300 flex-1">
            <li className="flex items-start gap-3"><i className="fas fa-check-circle text-green-500 mt-1" aria-hidden="true"></i> <span>Unlimited AI Quizzes</span></li>
            <li className="flex items-start gap-3"><i className="fas fa-check-circle text-green-500 mt-1" aria-hidden="true"></i> <span>Basic Writing Practice</span></li>
            <li className="flex items-start gap-3"><i className="fas fa-check-circle text-green-500 mt-1" aria-hidden="true"></i> <span>Reading Test Module</span></li>
          </ul>
          <button
            onClick={() => handleCheckout('biweekly')}
            className="w-full bg-white dark:bg-transparent border-2 border-patriot-blue dark:border-blue-400 text-patriot-blue dark:text-blue-400 font-bold py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            Subscribe Bi-Weekly
          </button>
        </div>

        {/* Monthly Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-patriot-red dark:border-red-500 p-8 relative transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-patriot-red text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-md">
            Most Popular
          </div>
          <h3 className="text-xl font-bold text-patriot-red dark:text-red-400 mb-2">Monthly Premium</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">$9.99</span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">/ month</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 font-bold mb-4 bg-green-100 dark:bg-green-900/30 inline-block px-3 py-1 rounded-lg self-start">
            Save 17% vs Bi-Weekly
          </p>
          <ul className="space-y-4 mb-8 text-gray-600 dark:text-gray-300 flex-1">
            <li className="flex items-start gap-3"><i className="fas fa-star text-patriot-red dark:text-red-400 mt-1" aria-hidden="true"></i> <strong>Everything in Bi-Weekly</strong></li>
            <li className="flex items-start gap-3"><i className="fas fa-check-circle text-patriot-red dark:text-red-400 mt-1" aria-hidden="true"></i> <span><strong>Live Mock Interviews</strong> (Voice AI)</span></li>
            <li className="flex items-start gap-3"><i className="fas fa-check-circle text-patriot-red dark:text-red-400 mt-1" aria-hidden="true"></i> <span>24/7 Personal Civics Tutor</span></li>
            <li className="flex items-start gap-3"><i className="fas fa-check-circle text-patriot-red dark:text-red-400 mt-1" aria-hidden="true"></i> <span>Ad-Free Experience</span></li>
          </ul>
          <button
            onClick={() => handleCheckout('monthly')}
            className="w-full bg-gradient-to-r from-patriot-red to-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            Start Monthly Plan <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 text-gray-400 dark:text-gray-500 text-sm mt-8 border-t border-gray-100 dark:border-gray-800 pt-8">
        <div className="flex items-center gap-2 opacity-75">
            <span className="uppercase tracking-widest text-xs font-bold">Powered by</span>
            {/* Lemon Squeezy Logo or Text */}
            <span className="font-bold text-gray-600 dark:text-gray-400">Lemon Squeezy</span>
        </div>
        <p><i className="fas fa-lock" aria-hidden="true"></i> Payments are secure and encrypted. Tax handling by Lemon Squeezy.</p>
        <div className="flex gap-3 opacity-60">
           <i className="fab fa-cc-visa fa-lg"></i>
           <i className="fab fa-cc-mastercard fa-lg"></i>
           <i className="fab fa-apple-pay fa-lg"></i>
           <i className="fab fa-google-pay fa-lg"></i>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
