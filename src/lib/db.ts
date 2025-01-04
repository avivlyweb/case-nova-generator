import { supabase } from '@/integrations/supabase/client';
import type { CaseStudy } from '@/types/case-study';

export async function getCaseStudies() {
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching case studies:', error);
    throw error;
  }

  return data as CaseStudy[];
}

export async function createCaseStudy(caseStudy: Omit<CaseStudy, 'id' | 'created_at' | 'user_id'>) {
  const { data, error } = await supabase
    .from('case_studies')
    .insert([caseStudy])
    .select()
    .single();

  if (error) {
    console.error('Error creating case study:', error);
    throw error;
  }

  return data as CaseStudy;
}

export async function updateCaseStudy(id: string, updates: Partial<CaseStudy>) {
  const { data, error } = await supabase
    .from('case_studies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating case study:', error);
    throw error;
  }

  return data as CaseStudy;
}

export async function deleteCaseStudy(id: string) {
  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting case study:', error);
    throw error;
  }
}