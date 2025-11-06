import { AIResponseData, SearchResult, SearchFilters, ActionItem } from '@/types/medifly';

/**
 * Generate AI response using Claude API
 */
export async function generateAIResponse(
  userMessage: string,
  context?: {
    previousResults?: SearchResult[];
    previousQuery?: string;
  }
): Promise<AIResponseData> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: buildPrompt(userMessage, context)
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    return JSON.parse(jsonMatch[0]);
    
  } catch (error) {
    console.error('AI response generation error:', error);
    // Fallback to rule-based parsing
    return generateFallbackResponse(userMessage);
  }
}

/**
 * Build prompt for Claude
 */
function buildPrompt(userMessage: string, context?: { previousResults?: SearchResult[]; previousQuery?: string }): string {
  return `You are a medical travel assistant helping patients find hospitals and doctors.

User query: "${userMessage}"

${context?.previousResults 
  ? `Previous search returned ${context.previousResults.length} results for "${context.previousQuery}".` 
  : ''}

Analyze the user's query and respond with a JSON object containing:

1. "responseText": A natural, helpful response (2-3 sentences). Be warm and professional.

2. "searchType": Either "hospital" or "doctor" based on what the user is looking for.

3. "searchQuery": An optimized search query for vector similarity search. Extract key medical terms, specialties, and locations.

4. "filters": Object with optional filters:
   - "specialty": Medical specialty (cardiology, oncology, neurology, pediatrics, orthopedics, etc.)
   - "country": Country name (Malaysia, Singapore, Thailand, Indonesia, etc.)
   - "city": City name
   - "minExperience": Minimum years of experience (for doctors)
   - "isHalal": true/false (for halal-certified facilities)
   - "minRating": Minimum rating (1-5)

5. "actions": Array of 3 follow-up action items to help the user continue. Each action should have:
   - "text": Button text (e.g., "Show experienced cardiologists", "Find hospitals in Singapore")
   - "type": "hospital" or "doctor"
   - "query": Search query for this action
   - "filters": Filters object for this action

Medical specialties to recognize:
- Cardiology (heart)
- Oncology (cancer)
- Neurology (brain, nervous system)
- Orthopedics (bones, joints)
- Pediatrics (children)
- Obstetrics & Gynecology (women's health, pregnancy)
- Dermatology (skin)
- Ophthalmology (eyes)
- ENT (ear, nose, throat)
- Gastroenterology (digestive system)
- Urology (urinary system)
- Psychiatry (mental health)
- Endocrinology (hormones, diabetes)
- Nephrology (kidneys)
- Pulmonology (lungs)

Countries in our database:
- Malaysia
- Singapore
- Thailand
- Indonesia

Respond ONLY with valid JSON, no other text or markdown.`;
}

/**
 * Fallback response generator using rule-based parsing
 */
export function generateFallbackResponse(userMessage: string): AIResponseData {
  const lowerMessage = userMessage.toLowerCase();
  
  // Detect search type
  const isDoctorSearch = 
    lowerMessage.includes('doctor') || 
    lowerMessage.includes('specialist') || 
    lowerMessage.includes('physician') ||
    lowerMessage.includes('surgeon');
  
  const isHospitalSearch = 
    lowerMessage.includes('hospital') || 
    lowerMessage.includes('clinic') || 
    lowerMessage.includes('medical center') ||
    lowerMessage.includes('facility');

  // Medical specialties detection
  const specialties: Record<string, string[]> = {
    'cardiology': ['heart', 'cardiac', 'cardiology', 'cardiovascular'],
    'oncology': ['cancer', 'oncology', 'tumor', 'chemotherapy'],
    'neurology': ['brain', 'neurology', 'neurological', 'stroke'],
    'orthopedics': ['bone', 'joint', 'orthopedic', 'fracture', 'spine'],
    'pediatrics': ['child', 'pediatric', 'children', 'baby', 'infant'],
    'obstetrics': ['pregnancy', 'obstetric', 'gynecology', 'birth', 'maternal'],
    'dermatology': ['skin', 'dermatology', 'acne', 'rash'],
    'ophthalmology': ['eye', 'ophthalmology', 'vision', 'cataract'],
    'ent': ['ear', 'nose', 'throat', 'ent', 'hearing'],
    'gastroenterology': ['stomach', 'digestive', 'gastro', 'intestinal'],
    'urology': ['urinary', 'kidney', 'bladder', 'urology'],
    'psychiatry': ['mental', 'psychiatry', 'depression', 'anxiety'],
    'endocrinology': ['diabetes', 'thyroid', 'hormone', 'endocrine'],
    'pulmonology': ['lung', 'respiratory', 'breathing', 'pulmonary']
  };

  let specialty = '';
  for (const [spec, keywords] of Object.entries(specialties)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      specialty = spec;
      break;
    }
  }

  // Country detection
  const countries = ['Malaysia', 'Singapore', 'Thailand', 'Indonesia'];
  let country = countries.find(c => lowerMessage.includes(c.toLowerCase()));

  // City detection (major cities)
  const cities = ['Kuala Lumpur', 'Singapore', 'Bangkok', 'Jakarta', 'Penang', 'Johor Bahru'];
  let city = cities.find(c => lowerMessage.includes(c.toLowerCase()));

  // Other filters
  const isHalal = lowerMessage.includes('halal') || lowerMessage.includes('muslim');
  const isExperienced = lowerMessage.includes('experienced') || 
                        lowerMessage.includes('senior') || 
                        lowerMessage.includes('expert');

  // Build filters
  const filters: SearchFilters = {};
  if (specialty) filters.specialty = specialty;
  if (country) filters.country = country;
  if (city) filters.city = city;
  if (isHalal) filters.isHalal = true;
  if (isExperienced) filters.minExperience = 10;

  // Determine search type
  const searchType: 'hospital' | 'doctor' = isDoctorSearch ? 'doctor' : 'hospital';

  // Generate response text
  let responseText = '';
  if (searchType === 'doctor') {
    responseText = `I'll help you find ${specialty ? specialty + ' specialists' : 'doctors'}`;
    if (country) responseText += ` in ${country}`;
    if (isExperienced) responseText += ' with extensive experience';
    responseText += '. Let me search for the best options for you.';
  } else {
    responseText = `I'll search for ${specialty ? 'hospitals specializing in ' + specialty : 'hospitals'}`;
    if (country) responseText += ` in ${country}`;
    if (isHalal) responseText += ' with halal-certified facilities';
    responseText += '. Give me a moment to find the best matches.';
  }

  // Generate actions
  const actions: ActionItem[] = [
    {
      text: `Show more ${specialty || searchType}s${country ? ' in ' + country : ''}`,
      type: searchType,
      query: `${specialty || searchType} ${country || ''}`.trim(),
      filters
    },
    {
      text: searchType === 'hospital' ? 'Find doctors at these hospitals' : 'View hospital affiliations',
      type: searchType === 'hospital' ? 'doctor' : 'hospital',
      query: specialty || 'general',
      filters: { specialty, country }
    },
    {
      text: 'Explore other specialties',
      type: 'hospital',
      query: country ? `hospitals in ${country}` : 'all hospitals',
      filters: { country }
    }
  ];

  return {
    responseText,
    searchType,
    searchQuery: userMessage,
    filters,
    actions
  };
}

/**
 * Extract context from previous messages
 */
export function extractConversationContext(messages: any[]): string {
  const recentMessages = messages.slice(-5);
  return recentMessages
    .map(m => `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');
}