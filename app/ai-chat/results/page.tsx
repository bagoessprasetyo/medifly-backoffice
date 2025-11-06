"use client"

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, UserCircle, Globe, MapPin, Send, CheckCircle, Filter, User, Sparkles, AlertCircle, Loader2, Star } from 'lucide-react';
import { AIAction } from '../types';

// Message Parser Utility
const parseFormattedMessage = (text: string): string => {
  // Normalize emojis and bullets, keep original markdown markers
  return text
    .replace(/⭐/g, '⭐')
    .replace(/🏥/g, '🏥')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n');
};

// Inline Markdown renderer (bold **...**, italic *...*, star highlight)
const renderMarkdownInline = (text: string) => {
  const fragments: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(⭐)/g; // bold, italic, star
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      fragments.push(<span key={`plain-${lastIndex}`}>{text.slice(lastIndex, matchIndex)}</span>);
    }

    if (match[1]) {
      const inner = match[1].slice(2, -2);
      fragments.push(
        <span key={`bold-${matchIndex}`} className="font-semibold text-gray-900">
          {inner}
        </span>
      );
    } else if (match[2]) {
      const inner = match[2].slice(1, -1);
      fragments.push(
        <span key={`italic-${matchIndex}`} className="italic text-gray-700">
          {inner}
        </span>
      );
    } else if (match[3]) {
      fragments.push(
        <span key={`star-${matchIndex}`} className="text-yellow-600">⭐</span>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    fragments.push(<span key={`plain-tail-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <>{fragments}</>;
};

// Types

interface Message {
  type: 'ai' | 'user';
  text: string;
  timestamp: string;
  actions?: ActionItem[];
  error?: boolean;
}

interface ActionItem {
  text: string;
  type: 'hospital' | 'doctor' | 'navigate' | 'action' | 'tool_call';
  query?: string;
  filters?: SearchFilters;
  target?: string;
  parameters?: Record<string, any>;
}

interface SearchFilters {
  specialty?: string;
  location?: string;
  country?: string;
  city?: string;
  minExperience?: number;
  isHalal?: boolean;
  minRating?: number;
}

interface HospitalResult {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  specialties: string[];
  moreSpecialties: number;
  doctorsAvailable: number;
  priceRange: string;
  type: 'hospital';
  rating: number;
  website?: string;
  phone?: string;
  isHalal?: boolean;
  facilities?: string[];
  services?: any[];
  similarity: number;
  description?: string;
}

interface DoctorResult {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  experience: string;
  experienceYears: number;
  available: boolean;
  type: 'doctor';
  rating: number;
  bio?: string;
  imageUrl?: string;
  certifications?: string[];
  languages?: string[];
  services?: any[];
  hospitals?: any[];
  similarity: number;
  phone?: string;
  email?: string;
}

type SearchResult = HospitalResult | DoctorResult;

// Type guards
const isHospitalResult = (item: SearchResult): item is HospitalResult => item.type === 'hospital';
const isDoctorResult = (item: SearchResult): item is DoctorResult => item.type === 'doctor';

// Infer search type from text
const inferSearchTypeFromText = (text: string): 'hospital' | 'doctor' => {
  const t = text.toLowerCase();
  if (t.includes('doctor') || t.includes('specialist') || t.includes('surgeon')) return 'doctor';
  return 'hospital';
};

const MediflyAISearch = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchType, setSearchType] = useState<'hospital' | 'doctor'>('hospital');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const resultsCacheRef = useRef<Map<string, SearchResult[]>>(new Map());

  // Initialize with search params
  // useEffect(() => {
  //   const message = searchParams.get('message');
  //   const actionsParam = searchParams.get('actions');
    
  //   if (message) {
  //     const parsedMessage = parseFormattedMessage(message);
  //     let actions: ActionItem[] = [];
      
  //     if (actionsParam) {
  //       try {
  //         const aiActions: AIAction[] = JSON.parse(decodeURIComponent(actionsParam));
  //         actions = aiActions.map(action => ({
  //           text: action.label,
  //           type: action.type as any,
  //           target: action.target,
  //           parameters: action.parameters,
  //           query: action.parameters?.query || action.label
  //         }));
  //       } catch (e) {
  //         console.error('Failed to parse actions:', e);
  //       }
  //     }
      
  //     setMessages([{
  //       type: 'ai',
  //       text: parsedMessage,
  //       timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  //       actions: actions.length > 0 ? actions : undefined
  //     }]);

  //     // If the message implies a hospital/doctor search, trigger a sidebar search
  //     const inferred = inferSearchTypeFromText(parsedMessage);
  //     if (parsedMessage.toLowerCase().includes('hospital') || parsedMessage.toLowerCase().includes('doctor')) {
  //       setSearchQuery(parsedMessage);
  //       setSearchType(inferred);
  //       performVectorSearch(parsedMessage, inferred).catch(() => {});
  //     }
  //   } else {
  //     // Default welcome message if no search params
  //     setMessages([{
  //       type: 'ai',
  //       text: 'Hello! I\'m your medical travel assistant. I can help you find the best hospitals and doctors for your needs. What are you looking for today?',
  //       timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  //       actions: [
  //         { text: 'Find hospitals in Malaysia', type: 'hospital', query: 'hospitals in Malaysia', filters: { country: 'Malaysia' } },
  //         { text: 'Search for cardiology specialists', type: 'doctor', query: 'cardiology specialists', filters: { specialty: 'cardiology' } },
  //         { text: 'Show hospitals with halal facilities', type: 'hospital', query: 'halal hospitals', filters: { isHalal: true } }
  //       ]
  //     }]);
  //   }
  // }, [searchParams]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Vector search with Supabase RPC and in-memory cache
  const performVectorSearch = async (query: string, type: 'hospital' | 'doctor', filters?: SearchFilters) => {
    try {
      setIsSearching(true);
      setSearchError(null);
      const cacheKey = `${type}:${query}:${JSON.stringify(filters||{})}`;
      if (resultsCacheRef.current.has(cacheKey)) {
        const cached = resultsCacheRef.current.get(cacheKey)!;
        setSearchResults(cached);
        setSearchType(type);
        return cached;
      }
      
      const response = await fetch('/api/vector-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type,
          filters: {
            ...filters,
            threshold: 0.5,
            limit: 12
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Search API error');
      }

      const data = await response.json();
      const results = (data.results || []) as SearchResult[];

      // Sort by similarity desc, then rating desc
      const sorted = [...results].sort((a, b) => {
        const simDiff = (b.similarity || 0) - (a.similarity || 0);
        if (simDiff !== 0) return simDiff;
        return (b.rating || 0) - (a.rating || 0);
      });

      resultsCacheRef.current.set(cacheKey, sorted);

      setSearchResults(sorted);
      setSearchType(type);
      setSearchQuery(query);
      
      return sorted;
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchError(error?.message || 'Failed to load results');
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  // Handle action button clicks with new action types
  const handleActionClick = async (action: ActionItem) => {
    // Add user message
    const userMessage: Message = {
      type: 'user',
      text: action.text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Handle different action types
      switch (action.type) {
        case 'navigate':
          if (action.target) {
            router.push(`/${action.target}`);
            setIsTyping(false);
            return;
          }
          break;
          
        case 'tool_call': {
          try {
            const resp = await fetch('https://n8n-c4bluags.n8x.my.id/webhook/33fa276a-328c-43d9-be9c-4e3f9d1e95ad', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({
                action: 'tool_call',
                target: action.target,
                parameters: action.parameters || {}
              }),
            });
            if (!resp.ok) throw new Error(`Tool call API error: ${resp.status}`);
            const payload = await resp.json();

            // Normalize AI response from webhook (supports nested JSON in payload.output)
            let parsedOutput: any = payload;
            if (typeof payload?.output === 'string') {
              try {
                parsedOutput = JSON.parse(payload.output);
              } catch (err) {
                console.error('Failed to parse webhook output JSON:', err);
                parsedOutput = { message: payload.output };
              }
            }

            const messageText = parsedOutput?.message || payload?.message || '';
            const rawActions = Array.isArray(parsedOutput?.actions)
              ? parsedOutput.actions
              : Array.isArray(payload?.actions)
                ? payload.actions
                : undefined;

            const aiMessage: Message = {
              type: 'ai',
              text: parseFormattedMessage(messageText || ''),
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              actions: rawActions
                ? rawActions.map((a: any) => ({
                    text: a.label || a.text || '',
                    type: a.type,
                    target: a.target,
                    parameters: a.parameters,
                    query: a.parameters?.query || a.label || a.text || ''
                  }))
                : undefined,
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
            return;
          } catch (e) {
            throw e;
          }
        }
          
        case 'action':
          if (action.target === 'search_by_country') {
            setTimeout(() => {
              const aiMessage: Message = {
                type: 'ai',
                text: 'Which country would you like to search for hospitals in? I can help you find hospitals in:\n\n• Singapore\n• Malaysia\n• Thailand\n• Indonesia\n• Turkey',
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                actions: [
                  { text: 'Find hospitals in Singapore', type: 'hospital', query: 'hospitals in Singapore', filters: { country: 'Singapore' } },
                  { text: 'Find hospitals in Malaysia', type: 'hospital', query: 'hospitals in Malaysia', filters: { country: 'Malaysia' } },
                  { text: 'Find hospitals in Thailand', type: 'hospital', query: 'hospitals in Thailand', filters: { country: 'Thailand' } }
                ]
              };
              setMessages(prev => [...prev, aiMessage]);
              setIsTyping(false);
            }, 800);
            return;
          }
          break;
          
        default:
          if (action.query) {
            const results = await performVectorSearch(action.query, action.type, action.filters);
            
            setTimeout(() => {
              const aiResponse = generateAIResponse(action.query!, results.length, action.type as 'hospital' | 'doctor', action.filters);
              
              const aiMessage: Message = {
                type: 'ai',
                text: aiResponse.text,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                actions: aiResponse.actions
              };
              
              setMessages(prev => [...prev, aiMessage]);
              setIsTyping(false);
            }, 800);
            return;
          }
      }
      
      setTimeout(() => {
        const aiMessage: Message = {
          type: 'ai',
          text: `I'll help you with "${action.text}". Let me search for relevant information.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { text: 'Search hospitals', type: 'hospital', query: 'hospitals' },
            { text: 'Search doctors', type: 'doctor', query: 'doctors' }
          ]
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 800);
      
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        type: 'ai',
        text: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        error: true,
        actions: [
          { text: 'Try again', type: 'action', query: action.query || 'help' }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Generate AI response based on query
  const generateAIResponse = (query: string, resultsCount: number, type: 'hospital' | 'doctor', filters?: SearchFilters): { text: string; actions: ActionItem[] } => {
    const lowerQuery = query.toLowerCase();
    
    // Extract context
    const specialty = filters?.specialty || '';
    const country = filters?.country || '';
    const city = filters?.city || '';
    const isHalal = filters?.isHalal;
    
    // Generate contextual response
    let responseText = '';
    if (resultsCount === 0) {
      responseText = `I apologize, but I couldn't find any ${type === 'hospital' ? 'hospitals' : 'doctors'} matching "${query}". Please try rephrasing your request or try different criteria.`;
    } else {
      responseText = `I found ${resultsCount} ${type === 'hospital' ? 'hospital' : 'doctor'}${resultsCount > 1 ? 's' : ''} for you`;
      if (specialty) responseText += ` specializing in ${specialty}`;
      if (country) responseText += ` in ${country}`;
      if (city) responseText += `, ${city}`;
      if (isHalal) responseText += ' with halal-certified facilities';
      responseText += '. The results are displayed on the right.';
    }

    // Generate smart follow-up actions (omitted for brevity)
    const actions: ActionItem[] = [];
    if (resultsCount > 0) {
      actions.push({ text: 'Filter by rating 4+', type: type, query, filters: { ...filters, minRating: 4 } });
      actions.push({ text: 'Only halal facilities', type: 'hospital', query, filters: { ...filters, isHalal: true } });
      actions.push({ text: 'Show doctors at these hospitals', type: 'doctor', query, filters: { ...filters } });
    }

    return { text: responseText, actions: actions.slice(0, 3) };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query || isTyping || isSearching) return;

    const userMessage: Message = {
      type: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const resp = await fetch('https://n8n-c4bluags.n8x.my.id/webhook/33fa276a-328c-43d9-be9c-4e3f9d1e95ad', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      if (!resp.ok) {
        throw new Error(`AI API error: ${resp.status}`);
      }

      const payload = await resp.json();

      // Normalize AI response from webhook (supports nested JSON in payload.output)
      let parsedOutput: any = payload;
      if (typeof payload?.output === 'string') {
        try {
          parsedOutput = JSON.parse(payload.output);
        } catch (err) {
          console.error('Failed to parse webhook output JSON:', err);
          parsedOutput = { message: payload.output };
        }
      }

      const messageText = parsedOutput?.message || payload?.message || '';
      const rawActions = Array.isArray(parsedOutput?.actions)
        ? parsedOutput.actions
        : Array.isArray(payload?.actions)
          ? payload.actions
          : undefined;

      const aiMessage: Message = {
        type: 'ai',
        text: parseFormattedMessage(messageText),
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        actions: rawActions
          ? rawActions.map((a: any) => ({
              text: a.label || a.text || '',
              type: a.type,
              target: a.target,
              parameters: a.parameters,
              query: a.parameters?.query || a.label || a.text || ''
            }))
          : undefined,
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

      // If query implies search, update right sidebar
      const inferred = inferSearchTypeFromText(query);
      if (query.toLowerCase().includes('hospital') || query.toLowerCase().includes('doctor')) {
        setSearchQuery(query);
        setSearchType(inferred);
        performVectorSearch(query, inferred).catch(() => {});
      }
      
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = {
        type: 'ai',
        text: 'I apologize, but I encountered an error while processing your request. Please try again with different keywords.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        error: true,
        actions: [
          { text: 'Show all hospitals', type: 'hospital', query: 'all hospitals' },
          { text: 'Show all doctors', type: 'doctor', query: 'all doctors' }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Section - Chat Interface */}
      <div className="w-[420px] border-r border-gray-200 bg-white flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Medi AI</h2>
              <p className="text-xs text-gray-500">Medical Travel Assistant</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${message.type === 'user' ? 'bg-blue-500 text-white' : message.error ? 'bg-red-50 border border-red-200' : 'bg-gray-100'} rounded-2xl p-3 shadow-sm`}>
                {message.error && (
                  <div className="flex items-center gap-2 mb-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Error</span>
                  </div>
                )}
                <div className={`text-sm ${message.type === 'user' ? 'text-white' : message.error ? 'text-red-900' : 'text-gray-900'} whitespace-pre-wrap`}>
                  {message.text.split('\n').map((line, lineIndex) => (
                    <div key={lineIndex} className="mb-1">
                      {/* Render bullets when '•' present; otherwise render inline markdown */}
                      {line.includes('•') ? (
                        line.split('•').map((part, partIndex) => (
                          <span key={partIndex}>
                            {partIndex > 0 && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mx-2 align-middle"></span>}
                            {renderMarkdownInline(part)}
                          </span>
                        ))
                      ) : (
                        <span>{renderMarkdownInline(line)}</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-blue-100' : message.error ? 'text-red-600' : 'text-gray-500'}`}>
                  {message.timestamp}
                </p>
                
                {/* Action Buttons */}
                {message.actions && message.type === 'ai' && (
                  <div className="mt-4 space-y-2">
                    {message.actions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(action)}
                        disabled={isTyping || isSearching}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${isTyping || isSearching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white'} ${action.type === 'navigate' ? 'border-blue-200 text-blue-700' : action.type === 'action' ? 'border-purple-200 text-purple-700' : 'border-gray-200 text-gray-700'}`}
                      >
                        <span className="flex items-center gap-2">
                          {action.type === 'navigate' && <Globe className="w-4 h-4" />}
                          {action.type === 'action' && <CheckCircle className="w-4 h-4" />}
                          {action.type === 'tool_call' && <Sparkles className="w-4 h-4" />}
                          <span>{action.text}</span>
                          {(isTyping || isSearching) && <Loader2 className="ml-auto w-4 h-4 animate-spin" />}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator while waiting for AI */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl p-3 shadow-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask Medi AI for hospitals or doctors..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isTyping || isSearching}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>

      {/* Right Section - Results Sidebar */}
      <div className="flex-1 overflow-y-auto">
        <div className="h-full">
          {/* Sticky header with context filters */}
          <div className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur border-b border-gray-200">
            <div className="px-6 py-3 flex items-center gap-3">
              <h3 className="text-sm font-semibold text-gray-900">Results</h3>
              <span className="text-xs text-gray-500">{searchResults.length} items</span>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => searchQuery && performVectorSearch(searchQuery, 'hospital').catch(() => {})}
                  className={`px-3 py-1.5 text-xs rounded-md border ${searchType==='hospital'?'bg-white border-blue-300 text-blue-700':'border-gray-300 text-gray-600 hover:bg-white'}`}
                >Hospitals</button>
                <button
                  onClick={() => searchQuery && performVectorSearch(searchQuery, 'doctor').catch(() => {})}
                  className={`px-3 py-1.5 text-xs rounded-md border ${searchType==='doctor'?'bg-white border-purple-300 text-purple-700':'border-gray-300 text-gray-600 hover:bg-white'}`}
                >Doctors</button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="px-6 py-4">
            {searchError && (
              <div className="mb-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{searchError}</span>
              </div>
            )}

            {isSearching ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white animate-pulse">
                    <div className="h-4 w-2/3 bg-gray-200 rounded" />
                    <div className="mt-2 h-3 w-1/2 bg-gray-200 rounded" />
                    <div className="mt-4 h-24 w-full bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
                <Building2 className="mx-auto w-10 h-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">No results yet. Ask Medi AI for hospitals or doctors.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg bg-white hover:shadow transition flex flex-col"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {item.type === 'hospital' ? (item as HospitalResult).name : (item as DoctorResult).name}
                          </h4>
                          <p className="text-xs text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.type === 'hospital'
                              ? `${(item as HospitalResult).city || ''}${(item as HospitalResult).city ? ', ' : ''}${(item as HospitalResult).country || ''}`
                              : (item as DoctorResult).location}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-4 h-4" />
                          <span className="text-xs font-medium">{(item as any).rating?.toFixed ? (item as any).rating.toFixed(1) : (item as any).rating || '-'}</span>
                        </div>
                      </div>

                      {/* Meta */}
                      {item.type === 'hospital' ? (
                        <p className="mt-2 text-xs text-gray-700">Specialties: {(item as HospitalResult).specialties?.slice(0,3).join(', ') || '—'}</p>
                      ) : (
                        <p className="mt-2 text-xs text-gray-700">Specialty: {(item as DoctorResult).specialty || '—'} • Experience: {(item as DoctorResult).experienceYears || 0} yrs</p>
                      )}

                      <div className="mt-3">
                        <button
                          onClick={() => {
                            if (item.type === 'hospital') router.push(`/hospitals/${item.id}`);
                            else router.push(`/doctors/${item.id}`);
                          }}
                          className="w-full text-xs px-3 py-2 rounded-md border border-gray-300 hover:bg-white text-gray-700"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediflyAISearch;