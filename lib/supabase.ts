import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads a medical file to Supabase Storage and returns metadata.
 */
export async function uploadMedicalReport(file: File, patientId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${patientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `reports/${fileName}`;

  const { data, error } = await supabase.storage
    .from('medical-records')
    .upload(filePath, file);

  if (error) {
    console.error('Storage upload error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('medical-records')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    title: file.name
  };
}
