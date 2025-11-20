
import React, { useEffect, useState } from 'react';
import { getImmigrationNews } from '../services/geminiService';

interface SourceLink {
  title: string;
  uri: string;
}

const NewsPage: React.FC = () => {
  const [newsContent, setNewsContent] = useState<string>('');
  const [sources, setSources] = useState<SourceLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getImmigrationNews();
        
        if (response.text) {
          setNewsContent(response.text);
        }

        // Extract grounding chunks (sources)
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const validSources: SourceLink[] = [];
        
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri && chunk.web?.title) {
            validSources.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        });
        
        // Remove duplicates based on URI
        const uniqueSources = Array.from(new Map(validSources.map(item => [item.uri, item])).values());
        setSources(uniqueSources);

      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Enhanced parser for better news layout
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={index} className="h-2"></div>;

      // Headlines (starts with **, ##, or Number.)
      if (trimmed.match(/^(\*\*|##|\d+\.\s)/)) {
        const content = trimmed.replace(/^(\*\*|##|\d+\.\s)/, '').replace(/(\*\*|##)/g, '');
        return <h3 key={index} className="text-xl font-bold text-patriot-blue dark:text-blue-300 mt-6 mb-2">{content}</h3>;
      }

      // Bullet points
      if (trimmed.match(/^[\*•-]\s/)) {
         const content = trimmed.replace(/^[\*•-]\s/, '');
         return (
           <div key={index} className="flex items-start gap-2 mb-2 ml-2">
             <i className="fas fa-angle-right text-patriot-red mt-1.5 text-xs"></i>
             <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{content.replace(/\*\*/g, '')}</p>
           </div>
         );
      }

      return <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">{line.replace(/\*\*/g, '')}</p>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="bg-gradient-to-r from-patriot-blue to-blue-900 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-white/20 p-2 rounded-lg">
                 <i className="fas fa-newspaper text-2xl"></i>
              </div>
              <h1 className="text-3xl font-bold">Immigration News Feed</h1>
            </div>
            <p className="text-blue-100">Real-time updates on US Immigration policy, USCIS changes, and citizenship news.</p>
          </div>
          <i className="far fa-newspaper absolute -bottom-6 -right-6 text-9xl opacity-10"></i>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="space-y-6">
               <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-patriot-blue border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-500 dark:text-gray-400 animate-pulse">Scanning reliable sources for latest updates...</p>
                  </div>
               </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
               <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl inline-block">
                 <i className="fas fa-exclamation-circle text-4xl mb-2"></i>
                 <p>Unable to load news feed at this time.</p>
                 <button onClick={() => window.location.reload()} className="mt-4 text-sm font-bold underline">Try Again</button>
               </div>
            </div>
          ) : (
            <>
              <div className="prose dark:prose-invert max-w-none mb-10">
                <p className="text-xs text-gray-400 text-right mb-4 italic">
                   <i className="fas fa-clock mr-1"></i> Updated: {new Date().toLocaleDateString()}
                </p>
                {renderFormattedText(newsContent)}
              </div>

              {/* Sources Section */}
              {sources.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-link text-gray-400"></i> Sources & Further Reading
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all group"
                      >
                        <div className="mt-1 bg-blue-50 dark:bg-blue-900/30 text-patriot-blue dark:text-blue-300 w-6 h-6 rounded flex items-center justify-center text-xs shrink-0">
                           {idx + 1}
                        </div>
                        <div>
                           <p className="text-sm font-medium text-patriot-blue dark:text-blue-300 group-hover:underline line-clamp-2">
                             {source.title}
                           </p>
                           <p className="text-xs text-gray-400 truncate max-w-[250px]">{source.uri}</p>
                        </div>
                        <i className="fas fa-external-link-alt text-xs text-gray-300 group-hover:text-gray-500 ml-auto mt-1"></i>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewsPage;
