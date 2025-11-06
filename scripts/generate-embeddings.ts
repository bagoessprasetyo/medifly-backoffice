// scripts/generate-embeddings.ts
// Run this script once to generate embeddings for all your existing data
// Usage: npx tsx scripts/generate-embeddings.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";

// Load and validate env vars
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // 👈 use Gemini API key

if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in .env.local');
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in .env.local');
if (!GOOGLE_API_KEY) throw new Error('Missing GOOGLE_API_KEY in .env.local');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenAI({apiKey:GOOGLE_API_KEY});

// ---- Helper Functions ----

function createHospitalDescription(hospital: any): string {
  const facilities =
    hospital.hospital_facilities?.map(
      (hf: any) => hf.facilities?.facility_name
    ) || [];

  const services =
    hospital.hospital_services?.map(
      (hs: any) => hs.services?.service_name
    ) || [];

  return `
    Hospital: ${hospital.hospital_name}
    Country: ${hospital.country}
    Specialties: ${services.join(', ')}
    Description: ${hospital.description}
    Facilities: ${facilities.join(', ')}
    Hospital Address: ${hospital.address}
    Hospital Phone Number: ${hospital.contact_number}
    Hospital Website: ${hospital.website}
    Hospital HALAL: ${hospital.is_halal ? 'Yes' : 'No'}
    Hospital Rating: ${hospital.rating}
    Hospital Doctor Count: ${hospital.doctor_hospitals?.count || 0}
  `.trim();
}


function createDoctorDescription(doctor: any): string {
  return `
    Doctor: ${doctor.name}
    Specialty: ${doctor.specialty}
    Sub-specialties: ${doctor.sub_specialties?.join(', ')}
    Hospital: ${doctor.hospital_name}
    Location: ${doctor.city}, ${doctor.country}
    Experience: ${doctor.experience_years} years
    Description: ${doctor.description}
    Certifications: ${doctor.certifications?.join(', ')}
  `.trim();
}

// ---- Generate Embeddings using Gemini ----

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await genAI.models.embedContent({
        model: "text-embedding-004",
        contents: text,
    });

    return response.embeddings?.[0].values || [];
  } catch (err) {
    console.error('Embedding error:', err);
    return [];
  }
}

// ---- Generate Embeddings for Hospitals ----

async function generateHospitalEmbeddings() {
  console.log('🏥 Generating embeddings for hospitals...');

  const { data: hospitals, error } = await supabase
    .from('hospitals')
    .select(`
      id,
      hospital_name,
      address,
      country,
      description,
      contact_number,
      website,
      is_halal,
      rating,
      hospital_services (
        hospital_services_id: id,
        base_price,
        services (
          service_name: name,
          service_description: description,
          service_price: price,
          service_category: category
        )
      ),
      hospital_facilities(
        hospital_facilities_id: id,
        facilities(
            facility_name: name,
            facility_description: description,
            facility_category: category
        )
      ),
      doctor_hospitals (count)
    `);

  if (error) {
    console.error('Error fetching hospitals:', error);
    return;
  }

  console.log(`Found ${hospitals?.length || 0} hospitals to process`);
  
  
  for (const hospital of hospitals || []) {
    try {
        console.log(`Found ${hospital}`);
      const description = createHospitalDescription(hospital);
      const embedding = await generateEmbedding(description);

      const { error: updateError } = await supabase
        .from('hospitals')
        .update({ embedding })
        .eq('id', hospital.id);

      if (updateError) {
        console.error(`Error updating hospital ${hospital.hospital_name}:`, updateError);
      } else {
        console.log(`✅ Generated embedding for: ${description}`);
      }

      await new Promise(res => setTimeout(res, 100)); // rate limiting
    } catch (error) {
      console.error(`Error processing hospital ${hospital.hospital_name}:`, error);
    }
  }
}

// ---- Generate Embeddings for Doctors ----

async function generateDoctorEmbeddings() {
  console.log('👨‍⚕️ Generating embeddings for doctors...');

  const { data: doctors, error } = await supabase
    .from('doctors')
    .select('*')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching doctors:', error);
    return;
  }

  console.log(`Found ${doctors?.length || 0} doctors to process`);

  for (const doctor of doctors || []) {
    try {
      const description = createDoctorDescription(doctor);
      const embedding = await generateEmbedding(description);

      const { error: updateError } = await supabase
        .from('doctors')
        .update({ embedding })
        .eq('id', doctor.id);

      if (updateError) {
        console.error(`Error updating doctor ${doctor.name}:`, updateError);
      } else {
        console.log(`✅ Generated embedding for: ${doctor.name}`);
      }

      await new Promise(res => setTimeout(res, 100)); // rate limiting
    } catch (error) {
      console.error(`Error processing doctor ${doctor.name}:`, error);
    }
  }
}

// ---- Main ----

async function main() {
  console.log('🚀 Starting embedding generation...\n');
  await generateHospitalEmbeddings();
  console.log('\n');
  await generateDoctorEmbeddings();
  console.log('\n✨ Embedding generation complete!');
}

main().catch(console.error);
