import React, { useState } from 'react';
import { View } from '../types';

interface InfoPageProps {
  view: View;
  onBack: () => void;
}

const InfoPage: React.FC<InfoPageProps> = ({ view, onBack }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  const renderContent = () => {
    switch (view) {
      case View.FAQ:
        return (
          <div className="space-y-8 text-gray-700">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-patriot-blue">Frequently Asked Questions</h1>
              <p className="text-gray-500 mt-2">Everything you need to know about LibertyLearn AI</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Is LibertyLearn AI free?</h3>
                <p>Yes! We offer a free tier that allows you to practice up to 5 questions every 12 hours. This is perfect for daily bite-sized study sessions. For unlimited access and advanced features like the Live Mock Interview, you can upgrade to Premium.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">How does the Live Mock Interview work?</h3>
                <p>Our Live Mock Interview uses advanced AI (Google Gemini) to simulate a real conversation with a USCIS officer. It listens to your voice, understands your answers, and responds verbally in real-time, helping you get comfortable with the speaking portion of the naturalization test.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Are the questions up to date?</h3>
                <p>Yes, our AI generates questions based on the official 2008 version of the civics test, which is the standard for most applicants. However, we always recommend verifying specific local information (like your current state representatives) with official resources.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Can I cancel my subscription?</h3>
                <p>Absolutely. You can cancel your premium subscription at any time through your account settings. You will retain access to premium features until the end of your current billing period.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Is this an official government website?</h3>
                <p>No. LibertyLearn AI is a private educational tool designed to help you study. We are not affiliated with USCIS or the US Government. For official forms and case status, please visit <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer" className="text-patriot-blue underline font-bold">uscis.gov</a>.</p>
              </div>
            </div>
          </div>
        );

      case View.PRIVACY:
        return (
          <div className="space-y-6 text-gray-700">
            <h1 className="text-3xl font-bold text-patriot-blue">Privacy Policy</h1>
            <p className="text-sm text-gray-500">Last Updated: November 1, 2024</p>
            
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Introduction</h2>
              <p>Welcome to LibertyLearn AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Data We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Identity Data:</strong> When you register an account using email, we collect your full name and email address. For Google Sign-In users, we receive your name, email, and profile picture URL from Google.</li>
                <li><strong>Account Security:</strong> For users registering via email, we store a representation of your credentials to facilitate login. We employ security best practices to protect this information.</li>
                <li><strong>Usage Data:</strong> We collect information about how you use our app, such as quiz scores and topics studied, to track your personalized progress. This data is associated with your user profile to provide a continuous experience across sessions.</li>
                <li><strong>Audio Data:</strong> When using the Live Interview feature, your voice is processed in real-time by our AI providers. We do not permanently store raw audio recordings of your sessions.</li>
                <li><strong>Payment Data:</strong> If you subscribe, we process payment information through secure third-party payment processors. We do not store full credit card details on our servers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. AI Technology</h2>
              <p>Our application utilizes Google's Gemini API to generate quizzes and conduct mock interviews. Data sent to these services is subject to their processing agreements. Please avoid sharing sensitive personal identifiable information (PII) like SSNs during AI chat or interview sessions.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. How We Use Your Data</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Authenticate your identity and manage your account access.</li>
                  <li>Persist your study progress and premium status.</li>
                  <li>Provide and maintain the Service.</li>
                  <li>Notify you about changes to our Service.</li>
                  <li>Provide customer support.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Data Security</h2>
              <p>The security of your data is important to us. We implement industry-standard security measures to protect your personal information. However, remember that no method of transmission over the Internet or method of electronic storage is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Cookies and Local Storage</h2>
              <p>We use cookies and local storage technologies to track the activity on our Service and store certain information, such as your login session and study progress preferences.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Third-Party Service Providers</h2>
              <p>We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Contact Us</h2>
              <p>If you have any questions about this privacy policy or our privacy practices, please contact us via our Support page.</p>
            </section>
          </div>
        );

      case View.TERMS:
        return (
          <div className="space-y-6 text-gray-700">
            <h1 className="text-3xl font-bold text-patriot-blue">Terms of Service</h1>
            <p className="text-sm text-gray-500">Last Updated: October 24, 2023</p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
              <p>By accessing and using LibertyLearn AI, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </section>

            <section className="bg-yellow-50 p-4 border-l-4 border-yellow-400 rounded-r">
              <h2 className="text-xl font-bold text-yellow-800 mb-2">2. Disclaimer - Not Government Affiliated</h2>
              <p className="text-yellow-900 font-medium">LibertyLearn AI is an educational tool designed to assist with studying for the US Naturalization Test. We are a private entity and are <strong>NOT affiliated with, endorsed by, or connected to the United States Citizenship and Immigration Services (USCIS)</strong> or any other government agency. This tool does not guarantee passing the official test.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Educational Purpose</h2>
              <p>The content provided on this website is for educational and informational purposes only and should not be construed as legal advice. Users should consult official USCIS resources for the most up-to-date legal requirements.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Premium Subscriptions</h2>
              <p>Subscriptions are billed in advance on a recurring basis. You may cancel your subscription at any time to prevent future billing. Refunds are handled on a case-by-case basis.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. User Conduct</h2>
              <p>You agree not to use the Service for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Service in any way that could damage the Service, the Services generally, or our business.</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>You must not harass, abuse, or harm another person.</li>
                  <li>You must not use the service to distribute spam or malicious content.</li>
                  <li>You must not attempt to reverse engineer the software.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Intellectual Property</h2>
              <p>The Service and its original content, features and functionality are and will remain the exclusive property of LibertyLearn AI and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Termination</h2>
              <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Limitation of Liability</h2>
              <p>In no event shall LibertyLearn AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
            </section>
          </div>
        );

      case View.SUPPORT:
        return (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-3xl text-patriot-blue"></i>
              </div>
              <h1 className="text-3xl font-bold text-patriot-blue mb-2">Contact Support</h1>
              <p className="text-gray-600">Have a question or issue? We're here to help you succeed.</p>
            </div>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in">
                <i className="fas fa-check-circle text-5xl text-green-500 mb-4"></i>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                <p className="text-gray-600 mb-6">Thank you for reaching out. Our support team will get back to you at <strong>{formData.email}</strong> within 24 hours.</p>
                <button 
                  onClick={() => setIsSubmitted(false)}
                  className="text-patriot-blue font-bold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-bold mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none resize-none"
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-patriot-blue hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.01] flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><i className="fas fa-circle-notch fa-spin"></i> Sending...</>
                  ) : (
                    <><i className="fas fa-paper-plane"></i> Send Message</>
                  )}
                </button>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Or email us directly at <a href="mailto:support@libertylearn.ai" className="text-patriot-blue font-bold hover:underline">support@libertylearn.ai</a>
                  </p>
                </div>
              </form>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <button 
        onClick={onBack}
        className="mb-6 text-gray-500 hover:text-patriot-blue font-medium flex items-center gap-2 transition-colors"
      >
        <i className="fas fa-arrow-left"></i> Back to Dashboard
      </button>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        {renderContent()}
      </div>
    </div>
  );
};

export default InfoPage;