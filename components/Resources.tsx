import React from 'react';

const Resources: React.FC = () => {
  const resources = [
    {
      category: "Official USCIS Forms",
      icon: "fa-file-signature",
      color: "text-blue-600",
      items: [
        {
          title: "Form N-400",
          description: "Application for Naturalization. This is the main form to apply for US citizenship.",
          link: "https://www.uscis.gov/n-400"
        },
        {
          title: "Form I-912",
          description: "Request for Fee Waiver. Use this if you cannot pay the filing fees.",
          link: "https://www.uscis.gov/i-912"
        }
      ]
    },
    {
      category: "Application & Process",
      icon: "fa-info-circle",
      color: "text-green-600",
      items: [
        {
          title: "Check Case Status",
          description: "Track the status of your immigration application online.",
          link: "https://egov.uscis.gov/"
        },
        {
          title: "Processing Times",
          description: "See how long applications are currently taking at your local field office.",
          link: "https://egov.uscis.gov/processing-times/"
        },
        {
          title: "Exceptions & Accommodations",
          description: "Information on disability exceptions (Form N-648) and age-based exemptions.",
          link: "https://www.uscis.gov/citizenship/exceptions-and-accommodations"
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
        <div className="bg-patriot-blue p-8 text-center relative overflow-hidden">
           <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-2">Citizenship Resource Center</h1>
              <p className="text-blue-200 max-w-2xl mx-auto">
                Essential documents, official forms, and study guides to support your journey to naturalization.
              </p>
           </div>
           <i className="fas fa-flag-usa absolute -bottom-10 -right-10 text-9xl text-white opacity-5"></i>
        </div>

        <div className="p-8 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((section, idx) => (
              <div key={idx} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 pb-2 border-b border-gray-200">
                  <i className={`fas ${section.icon} ${section.color}`}></i> {section.category}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <a 
                      key={itemIdx}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-patriot-blue transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-patriot-blue group-hover:text-blue-600">{item.title}</h3>
                        <i className="fas fa-external-link-alt text-gray-400 text-xs mt-1 group-hover:text-patriot-blue"></i>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 leading-snug">
                        {item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 p-6 border-t border-blue-100 text-center">
            <p className="text-sm text-gray-600">
                <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                <strong>Disclaimer:</strong> LibertyLearn AI is an educational tool. All forms and official documents linked above are hosted on 
                <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer" className="text-patriot-blue font-bold hover:underline ml-1">uscis.gov</a>. 
                Always check the official USCIS website for the most up-to-date fees and filing instructions.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Resources;