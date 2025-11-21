
import React, { useEffect, useState } from 'react';
import { getImmigrationNews } from '../services/geminiService';

interface SourceLink {
  title: string;
  uri: string;
}

interface NewsItem {
  date: string;
  headline: string;
  summary: string;
}

const NewsPage: React.FC = () => {
  const [groupedNews, setGroupedNews] = useState<Record<string, NewsItem[]>>({});
  const [sources, setSources] = useState<SourceLink[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await getImmigrationNews();
        
        let text = response.text || '[]';
        // Clean potential Markdown wrappers from the model response
        text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        
        let items: NewsItem[] = [];
        try {
            // Attempt to find JSON array if there's extra text around it
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                items = JSON.parse(jsonMatch[0]);
            } else {
                items = JSON.parse(text);
            }
        } catch (e) {
            console.warn("Could not parse news JSON", e);
            items = [];
        }

        // Group by date
        const groups: Record<string, NewsItem[]> = {};
        items.forEach(item => {
            // Validate date format or fallback
            const dateKey = item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date) ? item.date : 'Recent Updates';
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(item);
        });
        setGroupedNews(groups);

        // Extract Sources - Cast to any[] to fix TypeScript error
        const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[]) || [];
        const extractedSources: SourceLink[] = chunks
          .filter((chunk: any) => chunk.web)
          .map((chunk: any) => ({
            title: chunk.web.title,
            uri: chunk.web.uri
          }));
        
        // Deduplicate sources based on URI
        const uniqueSources = Array.from(new Map(extractedSources.map(s => [s.uri, s])).values());
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

  // Sort dates descending (newest first), putting 'Recent Updates' first if present
  const sortedDates = Object.keys(groupedNews).sort((a, b) => {
      if (a === 'Recent Updates') return -1;
      if (b === 'Recent Updates') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
  });

  const formatDateHeader = (dateStr: string) => {
      if (dateStr === 'Recent Updates') return dateStr;
      try {
          // Create date object, appending T12:00:00 to avoid timezone offset shifts for display
          const date = new Date(dateStr + 'T12:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Check if today
          const dateCheck = new Date(dateStr + 'T00:00:00');
          if (dateCheck.getTime() === today.getTime()) {
              return 'Today';
          }

          return new Intl.DateTimeFormat('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
          }).format(date);
      } catch (e) {
          return dateStr;
      }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-900 to-patriot-blue rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
               <i className="fas fa-newspaper"></i> Immigration News
            </h1>
            <p className="text-blue-100 max-w-xl">
               Stay updated with the latest USCIS policy changes, citizenship news, and important immigration updates, powered by Google Search.
            </p>
         </div>
         <i className="far fa-newspaper absolute -bottom-6 -right-6 text-9xl opacity-10 transform -rotate-12"></i>
      </div>

      {loading && (
         <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-patriot-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Scanning reliable news sources...</p>
         </div>
      )}

      {error && !loading && (
         <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Unable to load news</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">We couldn't retrieve the latest updates at this time.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-patriot-blue text-white rounded-lg hover:bg-blue-900 transition"
            >
              Try Again
            </button>
         </div>
      )}

      {!loading && !error && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - News Feed */}
            <div className="lg:col-span-2 space-y-8">
               {sortedDates.length === 0 ? (
                   <div className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                       <p className="text-gray-500">No recent news found matching criteria.</p>
                   </div>
               ) : (
                   sortedDates.map((dateKey) => (
                       <div key={dateKey} className="animate-fade-in">
                           <div className="flex items-center gap-4 mb-4">
                               <h2 className="text-xl font-bold text-gray-800 dark:text-white whitespace-nowrap">
                                   {formatDateHeader(dateKey)}
                               </h2>
                               <div className="h-px bg-gray-200 dark:bg-gray-700 w-full"></div>
                           </div>
                           
                           <div className="space-y-4">
                               {groupedNews[dateKey].map((item, idx) => (
                                   <article 
                                     key={`${dateKey}-${idx}`} 
                                     className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow border-l-4 border-l-patriot-blue dark:border-l-blue-400"
                                   >
                                       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                                           {item.headline}
                                       </h3>
                                       <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                           {item.summary}
                                       </p>
                                       <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 font-medium uppercase tracking-wide">
                                           <i className="far fa-clock"></i> {dateKey}
                                       </div>
                                   </article>
                               ))}
                           </div>
                       </div>
                   ))
               )}
            </div>

            {/* Sidebar - Sources */}
            <div className="lg:col-span-1">
               <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-24">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                     <i className="fas fa-link text-gray-400"></i> Sources
                  </h3>
                  
                  {sources.length === 0 ? (
                     <p className="text-gray-500 dark:text-gray-400 text-sm italic">No source links available.</p>
                  ) : (
                     <ul className="space-y-3">
                        {sources.map((source, idx) => (
                           <li key={idx}>
                              <a 
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 text-sm text-patriot-blue dark:text-blue-400 hover:underline group"
                              >
                                 <i className="fas fa-external-link-alt mt-1 text-[10px] opacity-50 group-hover:opacity-100"></i>
                                 <span className="line-clamp-2">{source.title}</span>
                              </a>
                           </li>
                        ))}
                     </ul>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                         News summaries are generated by AI using Google Search Grounding. Always verify important dates and policy changes on the official <a href="https://www.uscis.gov" className="underline hover:text-patriot-blue">USCIS website</a>.
                      </p>
                  </div>
               </div>
            </div>

         </div>
      )}
    </div>
  );
};

export default NewsPage;
