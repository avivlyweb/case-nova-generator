import type { Database } from '@/integrations/supabase/types';

export type CaseStudy = Database['public']['Tables']['case_studies']['Row'];
export type CaseStudyInsert = Database['public']['Tables']['case_studies']['Insert'];