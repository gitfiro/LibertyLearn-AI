import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe with a test publishable key
// In a real application, this should be an environment variable
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

interface PaymentPageProps {
  onComplete: () => void;
  onCancel: () => void;
}

type PlanType = 'biweekly' | 'monthly';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#1f2937", // gray-800
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#9ca3af" // gray-400
      }
    },
    invalid: {
      color: "#ef4444", // red-500
      iconColor: "#ef4444"
    }
  }
};

const CheckoutForm: React.FC<{
  planName: string;
  price: string;
  onSuccess: () => void;
  processing: boolean;
  setProcessing: (val: boolean) => void;
}> = ({ planName, price, onSuccess, processing, setProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [cardName, setCardName] = useState('');
  const [zip, setZip] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setProcessing(false);
      return;
    }

    // In a real backend integration, you would create a PaymentIntent on the server
    // and use stripe.confirmCardPayment here. 
    // For this frontend-only demo, we create a PaymentMethod to validate the card.
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardName,
        address: {
          postal_code: zip,
        },
      },
    });

    if (error) {
      console.error(error);
      setError(error.message || 'Payment failed');
      setProcessing(false);
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      // Simulate network delay for verification
      setTimeout(() => {
        setProcessing(false);
        onSuccess();
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Name on Card</label>
        <div className="relative">
          <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            required
            placeholder="John Doe"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-patriot-blue focus:border-transparent transition-shadow"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Card Details</label>
        <div className="p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-patriot-blue focus-within:border-transparent transition-shadow">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">ZIP Code</label>
        <input
          type="text"
          required
          placeholder="12345"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-patriot-blue focus:border-transparent transition-shadow"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-patriot-blue hover:bg-blue-900 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.01] mt-6 flex justify-center items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {processing ? (
          <><i className="fas fa-circle-notch fa-spin"></i> Processing Payment...</>
        ) : (
          <><i className="fas fa-lock"></i> Pay ${price}</>
        )}
      </button>
    </form>
  );
};

const PaymentPage: React.FC<PaymentPageProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState<'SELECTION' | 'CHECKOUT' | 'SUCCESS'>('SELECTION');
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
    setStep('CHECKOUT');
  };

  const getPrice = () => selectedPlan === 'biweekly' ? '5.99' : '9.99';
  const getPlanName = () => selectedPlan === 'biweekly' ? 'Bi-Weekly Access' : 'Monthly Premium Access';

  const handleSuccess = () => {
    setStep('SUCCESS');
    setTimeout(() => {
      onComplete();
    }, 2500);
  };

  // Success View
  if (step === 'SUCCESS') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <i className="fas fa-check text-4xl text-green-600"></i>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-8">Welcome to Citizen Achiever Premium. Your account has been successfully upgraded.</p>
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form View
  if (step === 'CHECKOUT') {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <button
          onClick={() => setStep('SELECTION')}
          className="mb-6 text-gray-500 hover:text-patriot-blue font-medium flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-arrow-left"></i> Change Plan
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-gray-800">Secure Checkout</h2>
              <p className="text-sm text-gray-500"><i className="fas fa-lock text-green-600 mr-1"></i> SSL Encrypted</p>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <span>Merchant</span>
              <span className="font-medium text-gray-800">Citizen Achiever Inc.</span>
            </div>
            <div className="text-right border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">Total due</p>
              <p className="text-2xl font-bold text-patriot-blue">${getPrice()}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8 bg-blue-50 p-4 rounded-lg flex items-start gap-3 border border-blue-100">
              <div className="bg-white p-2 rounded shadow-sm text-patriot-blue">
                <i className="fas fa-shopping-cart"></i>
              </div>
              <div>
                <h3 className="font-bold text-patriot-blue">{getPlanName()}</h3>
                <p className="text-sm text-gray-600">Unlimited quizzes, AI Tutor, and Live Interviews.</p>
              </div>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm 
                planName={getPlanName()} 
                price={getPrice()} 
                onSuccess={handleSuccess} 
                processing={processing}
                setProcessing={setProcessing}
              />
            </Elements>
          </div>
        </div>
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Payments processed securely by Stripe.</p>
        </div>
      </div>
    );
  }

  // Plan Selection View
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <button
        onClick={onCancel}
        className="mb-6 text-gray-500 hover:text-patriot-blue font-medium flex items-center gap-2 transition-colors"
      >
        <i className="fas fa-arrow-left"></i> Back to Dashboard
      </button>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-patriot-blue mb-4">Unlock Your American Dream</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get unlimited access to AI-powered study tools, personalized tutoring, and real-time mock interviews.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
        {/* Bi-Weekly Plan */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-8 relative transition-all hover:shadow-xl hover:border-blue-200 flex flex-col">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-100 text-gray-600 px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
            Flexible
          </div>
          <h3 className="text-xl font-bold text-gray-500 mb-2">Bi-Weekly</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-4xl font-bold text-patriot-blue">$5.99</span>
            <span className="text-gray-500 ml-2">/ 2 weeks</span>
          </div>
          <ul className="space-y-3 mb-8 text-gray-600 flex-1">
            <li className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> Unlimited Practice Quizzes</li>
            <li className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> 24/7 AI Civics Tutor</li>
            <li className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> Real-time Voice Interviews</li>
            <li className="flex items-center gap-3"><i className="fas fa-check text-green-500"></i> Ad-free Experience</li>
          </ul>
          <button
            onClick={() => handleSelectPlan('biweekly')}
            className="w-full bg-white border-2 border-patriot-blue text-patriot-blue font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Choose Bi-Weekly
          </button>
        </div>

        {/* Monthly Plan */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-patriot-red p-8 relative transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-patriot-red text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase shadow-md">
            Best Value
          </div>
          <h3 className="text-xl font-bold text-patriot-red mb-2">Monthly</h3>
          <div className="flex items-baseline mb-6">
            <span className="text-5xl font-bold text-gray-900">$9.99</span>
            <span className="text-gray-500 ml-2">/ month</span>
          </div>
          <p className="text-sm text-green-600 font-bold mb-4 bg-green-50 inline-block px-2 py-1 rounded self-start">
            Save 17% compared to bi-weekly
          </p>
          <ul className="space-y-3 mb-8 text-gray-600 flex-1">
            <li className="flex items-center gap-3"><i className="fas fa-check text-patriot-red"></i> <strong>All Premium Features</strong></li>
            <li className="flex items-center gap-3"><i className="fas fa-check text-patriot-red"></i> Priority Support</li>
            <li className="flex items-center gap-3"><i className="fas fa-check text-patriot-red"></i> Progress Tracking Analytics</li>
            <li className="flex items-center gap-3"><i className="fas fa-check text-patriot-red"></i> Cancel Anytime</li>
          </ul>
          <button
            onClick={() => handleSelectPlan('monthly')}
            className="w-full bg-gradient-to-r from-patriot-red to-red-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Start Monthly Plan
          </button>
        </div>
      </div>

      <div className="text-center text-gray-400 text-sm space-y-2">
        <p><i className="fas fa-lock"></i> Secure payment processing encrypted with SSL.</p>
        <div className="flex justify-center gap-4 opacity-60">
          <i className="fab fa-cc-visa fa-2x"></i>
          <i className="fab fa-cc-mastercard fa-2x"></i>
          <i className="fab fa-cc-amex fa-2x"></i>
          <i className="fab fa-stripe fa-2x"></i>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;