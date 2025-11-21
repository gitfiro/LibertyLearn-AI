
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
              <p className="text-gray-500 mt-2">Everything you need to know about CivicPath Pro</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Is CivicPath Pro free?</h3>
                <p>Yes! We offer a free tier that allows you to practice up to 5 questions every 12 hours. This is perfect for daily bite-sized study sessions. For unlimited access and advanced features like the Live Mock Interview, you can upgrade to Premium.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">How does the Live Mock Interview work?</h3>
                <p>Our Live Mock Interview uses advanced AI (Google Gemini) to simulate a real conversation with a USCIS officer. It listens to your voice, understands your answers, and responds verbally in real-time, helping you get comfortable with the speaking portion of the naturalization test.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Can I use CivicPath Pro on my phone?</h3>
                <p>Yes, CivicPath Pro is fully responsive and designed to work perfectly on smartphones and tablets. You can study on your commute, during lunch breaks, or anywhere you have an internet connection.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Are the questions up to date?</h3>
                <p>Yes, our AI generates questions based on the official 2008 version of the civics test, which is the standard for most applicants. However, we always recommend verifying specific local information (like your current state representatives) with official resources.</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Do I need a microphone?</h3>
                <p>A microphone is required for the Live Mock Interview feature to simulate the speaking portion of the test. However, the quizzes and text-based AI tutor work perfectly without one.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Can I use this to study for the English test?</h3>
                <p>Yes! The Live Mock Interview feature specifically helps with the English speaking and listening requirements. The AI officer will test your ability to understand instructions and speak clearly.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">What happens if I fail the real civics test?</h3>
                <p>If you fail the civics test at your interview, USCIS usually gives you one more opportunity to take the test, typically within 60 to 90 days. CivicPath Pro is designed to help you pass on your first try by identifying your weak areas.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Can I cancel my subscription?</h3>
                <p>Absolutely. You can cancel your premium subscription at any time through your account settings. You will retain access to premium features until the end of your current billing period.</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Is my payment information secure?</h3>
                <p>Yes, we use Stripe, a globally trusted payment processor. We do not store your credit card details on our servers. All transactions are encrypted and secure.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Is this an official government website?</h3>
                <p>No. CivicPath Pro is a private educational tool designed to help you study. We are not affiliated with USCIS or the US Government. For official forms and case status, please visit <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer" className="text-patriot-blue underline font-bold">uscis.gov</a>.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Do you provide legal advice?</h3>
                <p>No, we are strictly an educational platform. We do not provide legal advice. If you have complex legal questions regarding your immigration status, please use our "Find Attorney" feature to locate a qualified professional near you.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">What is the 65/20 exemption for older applicants?</h3>
                <p>If you are 65 years or older and have been a permanent resident for at least 20 years, you are eligible for a simplified test. You only need to study 20 specific questions instead of the full 100, and you may take the test in your native language.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Can I take the test in my native language?</h3>
                <p>Most applicants must take the test in English. However, if you are 50+ with 20 years of residency (50/20 rule) or 55+ with 15 years of residency (55/15 rule), you may be exempt from the English requirement and can take the civics test in your language with an interpreter.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">Does the AI tutor know about my specific case?</h3>
                <p>No. The AI tutor is a general study aid trained on public civics information. It does not have access to your USCIS case files, A-Number, or personal history. Never share sensitive personal details like your Social Security Number with the chatbot.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">How accurate is the AI mock interview?</h3>
                <p>The AI simulates the format, tone, and content of a standard USCIS interview to help you practice listening and speaking. However, real officers vary in their personality and questioning style. Use the AI to build confidence, but remember it is a simulation.</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-patriot-blue mb-2">What if I have a criminal record?</h3>
                <p>If you have ever been arrested or detained, even if charges were dropped, it can affect your citizenship application. CivicPath Pro cannot assess your eligibility. We strongly recommend using the "Find Attorney" feature to consult a lawyer before applying.</p>
              </div>
            </div>
          </div>
        );

      case View.PRIVACY:
        return (
          <div className="space-y-8 text-gray-700">
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-patriot-blue mb-2">Privacy Policy</h1>
              <p className="text-gray-500">Last Updated: January 1, 2025</p>
              <p className="mt-4">
                At CivicPath Pro, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and application.
              </p>
            </div>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <div className="pl-4 border-l-2 border-gray-200 space-y-3">
                <p><strong>A. Personal Data:</strong> When you register, we collect personally identifiable information, such as your name and email address.</p>
                <p><strong>B. Usage Data:</strong> We automatically collect information about your interactions with the app, such as quiz scores, time spent on topics, and feature usage. This helps us personalize your study plan.</p>
                <p><strong>C. Voice and Audio Data:</strong> To provide the "Live Mock Interview" feature, we capture real-time audio input from your device's microphone. This audio constitutes biometric data in some jurisdictions.</p>
                <p><strong>D. Payment Information:</strong> All financial data is stored by our payment processor, Stripe. We do not store full credit card numbers on our servers.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Process Voice Data (AI Technology)</h2>
              <p className="mb-3">CivicPath Pro utilizes <strong>Google's Gemini API</strong> to power its AI features, including the Live Mock Interview and Chat Tutor.</p>
              <ul className="list-disc pl-6 space-y-2 bg-blue-50 p-4 rounded-lg">
                <li><strong>Transmission:</strong> When you use the Live Interview, your audio is streamed directly to Google's servers for processing.</li>
                <li><strong>No Permanent Storage:</strong> We do not permanently store recording files of your interviews. The audio is processed in real-time to generate a response and then discarded.</li>
                <li><strong>Transcription:</strong> Temporary text transcriptions of your session may be generated to provide feedback on your answers.</li>
                <li><strong>Consent:</strong> By enabling your microphone and starting an interview, you explicitly consent to this transmission and processing of your voice data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Provide, operate, and maintain our Service.</li>
                <li>Improve, personalize, and expand our Service.</li>
                <li>Understand and analyze how you use our Service (e.g., tracking mastery of civics topics).</li>
                <li>Process your transactions and manage your premium subscription.</li>
                <li>Communicate with you regarding updates, support, or security alerts.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing of Your Information</h2>
              <p className="mb-2">We do not sell your personal data. We may share information with third-party service providers strictly for the purpose of operating the app:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Google (Gemini API):</strong> For generating quiz content, attorney search results, and processing voice interviews.</li>
                <li><strong>Stripe:</strong> For secure payment processing.</li>
                <li><strong>Firebase/Cloud Services:</strong> For hosting and database management.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Security</h2>
              <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Children's Privacy</h2>
              <p>Our Service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13 without verification of parental consent, we take steps to remove that information from our servers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. California Privacy Rights (CCPA)</h2>
              <p>If you are a California resident, you have specific rights regarding your personal information, including the right to request access to and deletion of your data. To exercise these rights, please contact our support team.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
              <p>If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:support@civicpathpro.ai" className="text-patriot-blue font-bold">support@civicpathpro.ai</a>.</p>
            </section>
          </div>
        );

      case View.TERMS:
        return (
          <div className="space-y-8 text-gray-700">
            <div className="border-b border-gray-200 pb-6">
              <h1 className="text-3xl font-bold text-patriot-blue mb-2">Terms of Service</h1>
              <p className="text-gray-500">Last Updated: January 1, 2025</p>
              <p className="mt-4 font-semibold text-red-600">
                PLEASE READ THESE TERMS CAREFULLY. BY ACCESSING OR USING CIVICPATH PRO, YOU AGREE TO BE BOUND BY THE TERMS DESCRIBED HEREIN.
              </p>
            </div>

            <section className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500 shadow-sm">
              <h2 className="text-xl font-bold text-yellow-900 mb-2"><i className="fas fa-exclamation-triangle mr-2" aria-hidden="true"></i> IMPORTANT DISCLAIMERS</h2>
              <ul className="space-y-2 text-yellow-900">
                <li><strong>NOT GOVERNMENT AFFILIATED:</strong> CivicPath Pro is a private educational tool. We are <strong>NOT</strong> affiliated with, endorsed by, or connected to USCIS, DHS, or the United States Government.</li>
                <li><strong>NO LEGAL ADVICE:</strong> The content on this site is for informational and study purposes only. It does not constitute legal advice. Do not rely on this app for legal decisions regarding your immigration case.</li>
                <li><strong>NO GUARANTEE OF RESULTS:</strong> Using this app does not guarantee that you will pass the US Naturalization Test. The actual test is administered by USCIS officers who have discretion in their questioning.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Description of Service</h2>
              <p>CivicPath Pro ("Service") is an AI-powered study companion designed to assist users in preparing for the US Civics Test.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>AI Technology:</strong> The Service uses Artificial Intelligence (Google Gemini) to generate quizzes, simulate interviews, and provide tutoring.</li>
                <li><strong>Automated Content:</strong> Questions, answers, and feedback are generated automatically. While we strive for accuracy, AI models can occasionally produce incorrect or outdated information ("Hallucinations").</li>
                <li><strong>Verification:</strong> You acknowledge that it is your responsibility to verify all facts, dates, and government officials (e.g., Governor, Senators) with official sources like <a href="https://www.uscis.gov" target="_blank" className="text-blue-600 underline">uscis.gov</a> or <a href="https://www.usa.gov" target="_blank" className="text-blue-600 underline">usa.gov</a>.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. User Accounts and Security</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. We reserve the right to terminate accounts, remove content, or cancel orders at our sole discretion.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Voice Interaction & Conduct</h2>
              <p>The "Live Mock Interview" feature allows you to interact with an AI agent via voice.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Consent to Record:</strong> By using this feature, you consent to the transmission of your voice data to our third-party AI processors.</li>
                <li><strong>Prohibited Content:</strong> You agree not to use the voice feature to transmit hate speech, threats, harassment, or any illegal content.</li>
                <li><strong>Accuracy:</strong> We are not liable for any misunderstandings or transcription errors made by the AI during voice sessions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Payment and Refunds</h2>
              <p>CivicPath Pro offers Premium access via subscription.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Billing:</strong> Payments are processed securely by Stripe. We do not store payment details.</li>
                <li><strong>Cancellation:</strong> You may cancel your subscription at any time via your profile settings. Access continues until the end of the billing cycle.</li>
                <li><strong>Refund Policy:</strong> Payments are generally non-refundable. We do not provide refunds for partially used subscription periods.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Intellectual Property</h2>
              <p>The Service and its original content (excluding official USCIS questions which are public domain), features, and functionality are the exclusive property of CivicPath Pro. You may not copy, modify, distribute, or sell any part of our Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
              <div className="bg-gray-100 p-4 rounded text-sm font-mono border border-gray-300">
                <p className="uppercase">
                  IN NO EVENT SHALL CIVICPATH PRO, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICE; (III) ANY CONTENT OBTAINED FROM THE SERVICE; AND (IV) UNAUTHORIZED ACCESS, USE OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE) OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.
                </p>
                <p className="mt-4 uppercase font-bold">
                  IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS EXCEED THE AMOUNT YOU PAID US, IF ANY, FOR ACCESSING THE SERVICE DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE DATE OF THE CLAIM.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Indemnification</h2>
              <p>You agree to defend, indemnify and hold harmless CivicPath Pro and its licensee and licensors, and their employees, contractors, agents, officers and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, or b) a breach of these Terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
              <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Governing Law</h2>
              <p>These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>
            </section>
          </div>
        );

      case View.SUPPORT:
        return (
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-headset text-3xl text-patriot-blue" aria-hidden="true"></i>
              </div>
              <h1 className="text-3xl font-bold text-patriot-blue mb-2">Contact Support</h1>
              <p className="text-gray-600">Have a question or issue? We're here to help you succeed.</p>
            </div>

            {isSubmitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in" aria-live="polite">
                <i className="fas fa-check-circle text-5xl text-green-500 mb-4" aria-hidden="true"></i>
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
                  <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent outline-none"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Message</label>
                  <textarea
                    id="message"
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
                    <><i className="fas fa-circle-notch fa-spin" aria-hidden="true"></i> Sending...</>
                  ) : (
                    <><i className="fas fa-paper-plane" aria-hidden="true"></i> Send Message</>
                  )}
                </button>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Or email us directly at <a href="mailto:support@civicpathpro.ai" className="text-patriot-blue font-bold hover:underline">support@civicpathpro.ai</a>
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
        aria-label="Back to Dashboard"
      >
        <i className="fas fa-arrow-left" aria-hidden="true"></i> Back to Dashboard
      </button>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
        {renderContent()}
      </div>
    </div>
  );
};

export default InfoPage;
