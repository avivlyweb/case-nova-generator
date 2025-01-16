import { supabase } from "@/integrations/supabase/client";

export async function getAISuggestions(
  field: string,
  currentValue: string,
  specialization: string,
  existingValues: Partial<{
    condition: string;
    symptoms: string;
    history: string;
  }>
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('process-case-study', {
      body: {
        action: 'suggest',
        field,
        currentValue,
        specialization,
        existingValues
      }
    });

    if (error) throw error;
    return data.suggestion || '';
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    return '';
  }
}