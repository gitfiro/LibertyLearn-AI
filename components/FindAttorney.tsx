
import React, { useState, useEffect } from 'react';
import { searchAttorneys } from '../services/geminiService';

interface AttorneyResult {
  id: number;
  title: string;
  ratingScore: number;
  ratingText: string | null;
  bodyLines: string[];
  isProBono: boolean;
  mapLink?: any;
  isFeatured?: boolean;
}

const FEATURED_ATTORNEY: AttorneyResult = {
  id: 99999,
  title: "CK Legal PLLC",
  ratingScore: 5.0,
  ratingText: "5.0 stars (Top Rated)",
  bodyLines: [
    "Address: 3060 Williams Dr Suite 300, #3093, Fairfax, VA 22031", 
    "Premier Immigration Counsel offering expert guidance for Citizenship, Green Cards, and Visas. Client-focused representation committed to your success."
  ],
  isProBono: false, 
  mapLink: {
    uri: "https://www.google.com/maps/search/?api=1&query=CK+Legal+PLLC+Fairfax+VA",
    title: "CK Legal PLLC"
  },
  isFeatured: true
};

const FindAttorney: React.FC = () => {
  const [formData, setFormData] = useState({
    city: 'Fairfax',
    state: 'Virginia',
    zip: '',
    language: '',
    caseType: ''
  });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Searching database...');
  
  // Results State
  const [parsedResults, setParsedResults] = useState<AttorneyResult[]>([]);
  const [rawResultText, setRawResultText] = useState<string | null>(null);
  const [mapLinks, setMapLinks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort State
  const [sortBy, setSortBy] = useState<'default' | 'rating'>('default');
  const [showProBonoOnly, setShowProBonoOnly] = useState(false);

  // Dynamic loading messages
  useEffect(() => {
    if (!loading) return;
    const messages = [
        "Connecting to legal database...",
        "Locating top-rated attorneys...",
        "Analyzing reviews and specialties...",
        "Verifying locations...",
        "Compiling your results..."
    ];
    let i = 0;
    const interval = setInterval(() => {
        setLoadingMessage(messages[i % messages.length]);
        i++;
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city && !formData.zip) {
        setError("Please enter at least a City or Zip Code.");
        return;
    }
    setError(null);
    setLoading(true);
    setParsedResults([]);
    setRawResultText(null);
    setMapLinks([]);
    setSortBy('default');
    setShowProBonoOnly(false);

    // Constructed optimized prompt
    const location = `${formData.city}, ${formData.state} ${formData.zip}`;
    const languageReq = formData.language ? ` who speak ${formData.language}` : '';
    const practiceReq = formData.caseType ? ` specializing in ${formData.caseType}` : '';
    
    const query = `Find 5 top rated immigration attorneys or firms in ${location}${languageReq}${practiceReq}.
    Format as a strictly numbered list (1., 2., etc).
    For each, provide exactly these lines:
    - Name
    - Address
    - Rating (e.g. "4.8 stars")
    - Summary: 1 sentence mentioning key services${formData.language ? `, languages` : ''} and if they offer 'pro bono' or 'free consults'.`;

    try {
      const response = await searchAttorneys(query);
      const text = response.text || "No details found.";
      setRawResultText(text);

      // Extract Google Maps links from grounding metadata
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const links = chunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any) => chunk.maps);
      
      setMapLinks(links);
      parseResults(text, links);

    } catch (err) {
      console.error(err);
      setError("Failed to fetch results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const parseResults = (text: string, links: any[]) => {
      // Robust split: handles "1. ", "2. " OR bullet points if the model deviates
      const rawItems = text.split(/\n(?=\d+\.|[\*•-]\s)/g);
      
      // Filter items to ensure they look like entries
      const items = rawItems.filter(item => {
          const trimmed = item.trim();
          if (trimmed.length < 10) return false;
          
          const lower = trimmed.toLowerCase();

          // Explicitly filter out conversational intros and known problematic phrases
          // This prevents the "Here are 5 top rated..." header from becoming a card
          if (/^(here (is|are)|sure|below|these|i found|based on|results|finding)/i.test(trimmed)) return false;
          if (trimmed.endsWith(':')) return false; // Intro lines often end in a colon
          if (lower.includes('here are 5 top-rated')) return false;
          if (lower.includes('immigration attorneys or firms')) return false;
          
          // Strict requirement: Must contain at least one of these to be considered a valid entry
          if (!lower.includes('address') && !lower.includes('rating')) return false;

          const startsWithMarker = /^(\d+\.|[\*•-])/.test(trimmed);
          const hasAddress = /address:/i.test(trimmed);
          const hasRating = /rating:|stars/i.test(trimmed);
          
          // Enforce stricter validation: 
          // A valid entry must have an Address OR (be a list item AND have a rating)
          return hasAddress || (startsWithMarker && hasRating);
      });

      const parsed: AttorneyResult[] = items.map((item, idx) => {
          const lines = item.split('\n').filter(l => l.trim());
          
          // Clean Title: Remove numbering (1., 2.) or bullets (*, -), markdown, and "Name:" labels
          const titleLine = lines[0] || "Unknown Firm";
          const title = titleLine
            .replace(/^(\d+\.|[\*•-])\s*/, '')
            .replace(/\*\*/g, '')
            .replace(/^[-*•\s]*(Name|Firm Name|Attorney|Law Firm)\s*[:\-]\s*/i, '')
            .trim();
          
          // Find Rating Line
          const ratingLine = lines.find(l => l.toLowerCase().includes('rating') || l.toLowerCase().includes('stars'));
          
          let ratingScore = 0;
          if (ratingLine) {
              const match = ratingLine.match(/(\d+(\.\d)?)/);
              ratingScore = match ? parseFloat(match[0]) : 0;
          }

          // Check for Pro Bono / Cost keywords
          const contentLower = item.toLowerCase();
          const isProBono = contentLower.includes('pro bono') || 
                            contentLower.includes('sliding scale') || 
                            contentLower.includes('free consultation') ||
                            contentLower.includes('legal aid') ||
                            contentLower.includes('non-profit');

          // Filter body lines
          const bodyLines = lines.slice(1)
            .filter(l => l !== ratingLine)
            .map(l => l.replace(/^[-*•]?\s*(Summary|Description|About):\s*/i, '').trim());

          // Try to match with a Google Map link
          const mapLink = links.find(m => 
            m.title && (
                title.toLowerCase().includes(m.title.toLowerCase()) || 
                m.title.toLowerCase().includes(title.toLowerCase())
            )
          );

          return {
              id: idx,
              title,
              ratingScore,
              ratingText: ratingLine || null,
              bodyLines,
              isProBono,
              mapLink
          };
      });

      // Remove duplicates of CK Legal if found in API results
      const filteredParsed = parsed.filter(p => !p.title.toLowerCase().includes("ck legal"));
      
      // Featured logic (Northern Virginia)
      const { city, state, zip } = formData;
      const normCity = city.toLowerCase().trim();
      const normState = state.toLowerCase().trim();
      const normZip = zip.trim();

      // Strict Virginia check to exclude West Virginia
      const isVirginia = (
          normState === '' || 
          normState === 'va' || 
          normState === 'virginia' || 
          (normState.includes('virginia') && !normState.includes('west'))
      );

      const novaCities = [
        'arlington', 'alexandria', 'fairfax', 'falls church', 'manassas', 'mclean', 
        'reston', 'tysons', 'vienna', 'herndon', 'leesburg', 'ashburn', 'woodbridge', 
        'sterling', 'annandale', 'burke', 'centreville', 'chantilly', 'springfield', 'lorton', 
        'great falls', 'oakton', 'dunn loring', 'dumfries', 'triangle', 'clifton',
        'northern virginia', 'nova', 'loudoun', 'prince william'
      ];
      
      const isNovaZip = normZip.length >= 3 && (
          normZip.startsWith('201') || 
          ['220','221','222','223'].some(z => normZip.startsWith(z))
      );

      const isNovaLoc = novaCities.some(c => normCity.includes(c)) || isNovaZip;

      const shouldShowFeatured = isVirginia && isNovaLoc;
      
      if (shouldShowFeatured) {
          setParsedResults([FEATURED_ATTORNEY, ...filteredParsed]);
      } else {
          setParsedResults(filteredParsed);
      }
  };

  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= score) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400 text-sm" aria-hidden="true"></i>);
      } else if (i - 0.5 <= score) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400 text-sm" aria-hidden="true"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-gray-300 text-sm" aria-hidden="true"></i>);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  const renderResults = () => {
    if (parsedResults.length === 0) {
       if (rawResultText) {
           return (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 prose dark:prose-invert max-w-none transition-colors">
                 <div className="whitespace-pre-wrap">{rawResultText}</div>
              </div>
           );
       }
       return null;
    }

    let displayResults = [...parsedResults];
    const featured = displayResults.find(r => r.isFeatured);
    const others = displayResults.filter(r => !r.isFeatured);
    let filteredOthers = others;

    if (showProBonoOnly) {
        filteredOthers = filteredOthers.filter(r => r.isProBono);
    }
    if (sortBy === 'rating') {
        filteredOthers.sort((a, b) => b.ratingScore - a.ratingScore);
    }
    
    let finalResults: AttorneyResult[] = [];
    if (featured && (!showProBonoOnly || featured.isProBono)) {
        finalResults.push(featured);
    }
    finalResults = [...finalResults, ...filteredOthers];

    if (finalResults.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow text-center border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-filter text-gray-400 text-2xl" aria-hidden="true"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-600 dark:text-gray-300">No results match your filters.</h3>
                <button 
                    onClick={() => {setShowProBonoOnly(false); setSortBy('default');}}
                    className="mt-4 text-patriot-blue dark:text-blue-400 font-semibold hover:underline"
                >
                    Clear filters
                </button>
            </div>
        );
    }

    return (
      <div className="space-y-6">
        {finalResults.map((item) => (
            <div 
              key={item.id} 
              className={`p-6 rounded-xl shadow-sm transition-all animate-fade-in relative ${
                item.isFeatured 
                  ? 'bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border-2 border-patriot-blue/30 dark:border-blue-500/30 ring-4 ring-blue-50/50 dark:ring-blue-900/10' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
            >
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                 {item.isFeatured && (
                    <span className="bg-patriot-blue text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                        Featured
                    </span>
                 )}
                 {item.isProBono && (
                    <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <i className="fas fa-hand-holding-heart" aria-hidden="true"></i> Pro Bono
                    </span>
                 )}
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-3 pr-24">
                <div className="flex-1">
                   <h3 className={`text-xl font-bold mb-1 ${item.isFeatured ? 'text-patriot-blue dark:text-blue-300 text-2xl' : 'text-gray-800 dark:text-white'}`}>
                     {item.title}
                   </h3>
                   
                   <div className="flex items-center gap-3 mb-2">
                      <div className="bg-gray-900 dark:bg-black text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1" aria-label={`Rating: ${item.ratingScore} stars`}>
                         <span>{item.ratingScore > 0 ? item.ratingScore.toFixed(1) : 'N/A'}</span>
                         <i className="fas fa-star text-yellow-400 text-[10px]" aria-hidden="true"></i>
                      </div>
                      {renderStars(item.ratingScore)}
                   </div>
                </div>
              </div>
              
              <div className="text-gray-600 dark:text-gray-300 text-sm space-y-2 mt-3">
                 {item.bodyLines.map((line, lIdx) => (
                    <p key={lIdx} className={`leading-relaxed ${line.toLowerCase().includes('address') ? 'flex items-start gap-2 text-gray-500 dark:text-gray-400' : ''}`}>
                        {line.toLowerCase().includes('address') && <i className="fas fa-map-marker-alt mt-1 text-gray-400 dark:text-gray-500" aria-hidden="true"></i>}
                        {line}
                    </p>
                 ))}
              </div>

              {item.mapLink && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-start">
                     <a 
                       href={item.mapLink.uri} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                           item.isFeatured 
                           ? 'bg-patriot-red text-white hover:bg-red-700 shadow-md' 
                           : 'bg-blue-50 dark:bg-blue-900/20 text-patriot-blue dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                       }`}
                       aria-label={`Get directions to ${item.title} on Google Maps`}
                     >
                       <i className="fas fa-map-marked-alt" aria-hidden="true"></i> Get Directions
                     </a>
                  </div>
              )}
            </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 transition-colors">
        <div className="bg-patriot-blue p-6 sm:p-8 text-center relative">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
              <i className="fas fa-balance-scale text-[300px] text-white absolute -top-10 -left-20" aria-hidden="true"></i>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">Find Immigration Legal Help</h1>
            <p className="text-blue-200 max-w-2xl mx-auto">
                Search for qualified immigration attorneys and non-profit legal aid organizations in your area.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">City</label>
                <input
                  id="city"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-patriot-blue focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g. Fairfax"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">State</label>
                <input
                  id="state"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-patriot-blue focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g. Virginia"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="zip" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Zip Code</label>
                <input
                  id="zip"
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-patriot-blue focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g. 22031"
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
              </div>
              
              {/* Advanced Filters */}
              <div>
                <label htmlFor="language" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Language Preference</label>
                <div className="relative">
                    <i className="fas fa-language absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true"></i>
                    <input
                    id="language"
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-patriot-blue focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g. Spanish, Creole"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    />
                </div>
              </div>
              <div>
                <label htmlFor="caseType" className="block text-gray-700 dark:text-gray-300 font-bold mb-2">Case Type / Need</label>
                <div className="relative">
                    <i className="fas fa-folder-open absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" aria-hidden="true"></i>
                    <select
                        id="caseType"
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-patriot-blue focus:border-transparent appearance-none"
                        value={formData.caseType}
                        onChange={(e) => setFormData({...formData, caseType: e.target.value})}
                    >
                        <option value="">Any / General</option>
                        <option value="Citizenship & Naturalization">Citizenship & Naturalization</option>
                        <option value="Green Card / Adjustment of Status">Green Card / Adjustment</option>
                        <option value="Deportation Defense">Deportation Defense</option>
                        <option value="Asylum">Asylum</option>
                        <option value="Family Visa">Family Visa</option>
                        <option value="Employment Visa">Employment Visa</option>
                    </select>
                    <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-xs" aria-hidden="true"></i>
                </div>
              </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg border border-red-200 dark:border-red-800 text-sm" role="alert">
                    <i className="fas fa-exclamation-circle mr-2" aria-hidden="true"></i> {error}
                </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="bg-patriot-red hover:bg-red-700 text-white px-10 py-3 rounded-full font-bold text-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><i className="fas fa-circle-notch fa-spin" aria-hidden="true"></i> {loadingMessage}</>
                ) : (
                  <><i className="fas fa-search" aria-hidden="true"></i> Search</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div aria-live="polite">
      {(rawResultText || mapLinks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Main Results List */}
            <div className="lg:col-span-2">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <i className="fas fa-list-ul text-patriot-blue dark:text-blue-300" aria-hidden="true"></i> Search Results
                     </h2>
                     
                     {/* Filter & Sort Controls */}
                     {parsedResults.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <label className="flex items-center bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={showProBonoOnly}
                                    onChange={(e) => setShowProBonoOnly(e.target.checked)}
                                    className="mr-2 text-patriot-blue focus:ring-patriot-blue rounded"
                                />
                                <span className="text-gray-700 dark:text-gray-200 font-medium">Pro Bono / Low Cost</span>
                            </label>

                            <div className="relative">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'default' | 'rating')}
                                    aria-label="Sort attorneys"
                                    className="appearance-none bg-white dark:bg-gray-700 pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-patriot-blue"
                                >
                                    <option value="default">Default Sort</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none text-xs" aria-hidden="true"></i>
                            </div>
                        </div>
                     )}
                 </div>

                 {renderResults()}
            </div>

            {/* Verified Locations Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 sticky top-24 transition-colors">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <i className="fas fa-map-marked-alt text-patriot-red dark:text-red-400" aria-hidden="true"></i> Verified Locations
                    </h3>
                    
                    {mapLinks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                           Map data is loading or not available for these results. Please check the text details.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {mapLinks.map((place, index) => (
                                <a 
                                    key={index} 
                                    href={place.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-patriot-blue dark:hover:border-blue-400 transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-patriot-blue dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-200 text-sm truncate">{place.title}</h4>
                                            <div className="flex items-center mt-1">
                                                <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded uppercase tracking-wide">Google Maps</span>
                                            </div>
                                        </div>
                                        <i className="fas fa-external-link-alt text-xs text-gray-400 dark:text-gray-500 group-hover:text-patriot-blue dark:group-hover:text-blue-300 mt-1" aria-hidden="true"></i>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 leading-tight">
                        <i className="fas fa-info-circle mr-1" aria-hidden="true"></i>
                        Location data provided by Google Maps. Ratings and reviews are based on available public information.
                    </div>
                </div>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default FindAttorney;
