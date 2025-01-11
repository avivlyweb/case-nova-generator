import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type CaseStudy = Database['public']['Tables']['case_studies']['Row'];
type CaseStudyInsert = Database['public']['Tables']['case_studies']['Insert'];

export async function getCaseStudies() {
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching case studies:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Error in getCaseStudies:', error);
    throw new Error(error.message || 'Failed to fetch case studies');
  }
}

export async function createCaseStudy(caseStudy: CaseStudyInsert) {
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .insert([caseStudy])
      .select()
      .single();

    if (error) {
      console.error('Error creating case study:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Error in createCaseStudy:', error);
    throw new Error(error.message || 'Failed to create case study');
  }
}

export async function updateCaseStudy(id: string, updates: Partial<CaseStudy>) {
  try {
    const { data, error } = await supabase
      .from('case_studies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating case study:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error: any) {
    console.error('Error in updateCaseStudy:', error);
    throw new Error(error.message || 'Failed to update case study');
  }
}

export async function deleteCaseStudy(id: string) {
  try {
    const { error } = await supabase
      .from('case_studies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting case study:', error);
      throw new Error(error.message);
    }
  } catch (error: any) {
    console.error('Error in deleteCaseStudy:', error);
    throw new Error(error.message || 'Failed to delete case study');
  }
}