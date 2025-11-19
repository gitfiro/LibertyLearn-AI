import React, { useState } from 'react';
import { searchAttorneys } from '../services/geminiService';

interface AttorneyResult {
  id: number;
  title: string;
  ratingScore: number;
  ratingText: string | null;
  bodyLines: string[];
  isProBono: boolean;
  mapLink?: any;
}

const FindAttorney: React.FC = () => {
  const [formData, setFormData] = useState({
    city: '',
    state: '',
    zip: '',
    county: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Results State
  const [parsedResults, setParsedResults] = useState<AttorneyResult[]>([]);
  const [rawResultText, setRawResultText] = useState<string | null>(null);
  const [mapLinks, setMapLinks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter & Sort State
  const [sortBy, setSortBy] = useState<'default' | 'rating'>('default');
  const [showProBonoOnly, setShowProBonoOnly] = useState(false);

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

    // Updated query to explicitly ask for pro-bono/cost info
    const query = `Find top rated immigration attorneys and law firms in ${formData.city} ${formData.county ? formData.county + ' County' : ''}, ${formData.state} ${formData.zip}. 
    Provide the results as a strictly numbered list (e.g., "1. Name"). 
    For each firm, provide the following details on separate lines:
    - Name
    - Address
    - Rating (e.g., "Rating: 4.8 stars (150 reviews)")
    - Summary: A brief 1-sentence summary. Explicitly mention if they offer 'pro bono', 'sliding scale', 'legal aid', or 'free consultation'.
    
    Do not include a long introduction or conclusion.`;

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
      // Split text by numbered list items (e.g., "1. ", "2. ")
      const rawItems = text.split(/\n(?=\d+\.)/g);
      // Filter out items that don't start with a number (unless it's a single unformatted block)
      const items = rawItems.filter(item => item.match(/^\d+\./));

      const parsed: AttorneyResult[] = items.map((item, idx) => {
          const lines = item.split('\n').filter(l => l.trim());
          // Extract Title (remove number and markdown)
          const title = lines[0].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
          
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

          // Filter other lines
          const bodyLines = lines.slice(1).filter(l => l !== ratingLine);

          // Try to match with a Google Map link
          const mapLink = links.find(m => 
            m.title && (title.toLowerCase().includes(m.title.toLowerCase()) || m.title.toLowerCase().includes(title.toLowerCase()))
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

      setParsedResults(parsed);
  };

  // Helper to render star icons
  const renderStars = (ratingText: string) => {
    const match = ratingText.match(/(\d+(\.\d)?)/);
    const score = match ? parseFloat(match[0]) : 0;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= score) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else if (i - 0.5 <= score) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-gray-300"></i>);
      }
    }
    return (
      <div className="flex items-center gap-2">
        <div className="flex text-sm">{stars}</div>
        <span className="text-sm font-bold text-gray-700">{score > 0 ? score : ''}</span>
      </div>
    );
  };

  const renderResults = () => {
    if (parsedResults.length === 0) {
       // Fallback to raw text if parsing failed but we have text
       if (rawResultText) {
           return (
              <div className="bg-white p-6 rounded-xl shadow border border-gray-200 prose text-gray-700">
                 <div className="whitespace-pre-wrap">{rawResultText}</div>
              </div>
           );
       }
       return null;
    }

    let displayResults = [...parsedResults];

    // Filter
    if (showProBonoOnly) {
        displayResults = displayResults.filter(r => r.isProBono);
    }

    // Sort
    if (sortBy === 'rating') {
        displayResults.sort((a, b) => b.ratingScore - a.ratingScore);
    }

    if (displayResults.length === 0) {
        return (
            <div className="bg-white p-10 rounded-xl shadow text-center border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-filter text-gray-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-600">No results match your filters.</h3>
                <button 
                    onClick={() => {setShowProBonoOnly(false); setSortBy('default');}}
                    className="mt-4 text-patriot-blue font-semibold hover:underline"
                >
                    Clear filters
                </button>
            </div>
        );
    }

    return (
      <div className="space-y-4">
        {displayResults.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all animate-fade-in relative">
              {item.isProBono && (
                  <span className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                      <i className="fas fa-check-circle mr-1"></i> Pro Bono / Accessible
                  </span>
              )}
              
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-2">
                <div className="flex-1">
                   <h3 className="text-xl font-bold text-patriot-blue mb-1">{item.title}</h3>
                   {item.ratingText && (
                     <div className="mb-2">
                        {renderStars(item.ratingText)}
                        <span className="text-xs text-gray-500">{item.ratingText.replace(/rating:?/i, '').replace(/\*\*/g, '').trim()}</span>
                     </div>
                   )}
                </div>
                {item.mapLink && (
                   <a 
                     href={item.mapLink.uri} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex-shrink-0 bg-blue-50 text-patriot-blue hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                   >
                     <i className="fas fa-map-marker-alt text-patriot-red"></i> View Map
                   </a>
                )}
              </div>
              
              <div className="text-gray-600 text-sm space-y-1 mt-2">
                 {item.bodyLines.map((line, lIdx) => {
                    const parts = line.split('**');
                    return (
                        <p key={lIdx} className="leading-relaxed">
                            {parts.map((part, pIdx) => 
                                pIdx % 2 === 1 ? <span key={pIdx} className="font-bold text-gray-800">{part}</span> : part
                            )}
                        </p>
                    );
                 })}
              </div>
            </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
        <div className="bg-patriot-blue p-6 sm:p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Find Immigration Legal Help</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">
            Search for qualified immigration attorneys and non-profit legal aid organizations in your area.
          </p>
        </div>

        <div className="p-6 sm:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2">City</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
                  placeholder="e.g. Miami"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">State</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
                  placeholder="e.g. Florida"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">Zip Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
                  placeholder="e.g. 33101"
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2">County (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-patriot-blue focus:border-transparent"
                  placeholder="e.g. Miami-Dade"
                  value={formData.county}
                  onChange={(e) => setFormData({...formData, county: e.target.value})}
                />
              </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-sm">
                    <i className="fas fa-exclamation-circle mr-2"></i> {error}
                </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-patriot-red hover:bg-red-700 text-white px-10 py-3 rounded-full font-bold text-lg shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <><i className="fas fa-circle-notch fa-spin"></i> Searching...</>
                ) : (
                  <><i className="fas fa-search"></i> Find Attorneys</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {(rawResultText || mapLinks.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Main Results List */}
            <div className="lg:col-span-2">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className="fas fa-list-ul text-patriot-blue"></i> Search Results
                     </h2>
                     
                     {/* Filter & Sort Controls */}
                     {parsedResults.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <label className="flex items-center bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50">
                                <input 
                                    type="checkbox" 
                                    checked={showProBonoOnly}
                                    onChange={(e) => setShowProBonoOnly(e.target.checked)}
                                    className="mr-2 text-patriot-blue focus:ring-patriot-blue rounded"
                                />
                                <span className="text-gray-700 font-medium">Pro Bono / Low Cost</span>
                            </label>

                            <div className="relative">
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'default' | 'rating')}
                                    className="appearance-none bg-white pl-3 pr-8 py-2 rounded-lg border border-gray-200 shadow-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-patriot-blue"
                                >
                                    <option value="default">Default Sort</option>
                                    <option value="rating">Highest Rated</option>
                                </select>
                                <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                            </div>
                        </div>
                     )}
                 </div>

                 {renderResults()}
            </div>

            {/* Verified Locations Sidebar */}
            <div className="lg:col-span-1">
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <i className="fas fa-map-marked-alt text-patriot-red"></i> Verified Locations
                    </h3>
                    
                    {mapLinks.length === 0 ? (
                        <p className="text-gray-500 text-sm italic">
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
                                    className="block bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-patriot-blue transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-patriot-blue group-hover:text-blue-600 text-sm truncate">{place.title}</h4>
                                            <div className="flex items-center mt-1">
                                                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wide">Google Maps</span>
                                            </div>
                                        </div>
                                        <i className="fas fa-external-link-alt text-xs text-gray-400 group-hover:text-patriot-blue mt-1"></i>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500 leading-tight">
                        <i className="fas fa-info-circle mr-1"></i>
                        Location data provided by Google Maps. Ratings and reviews are based on available public information.
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default FindAttorney;