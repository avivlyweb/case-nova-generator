import { createClient } from "npm:@supabase/supabase-js@2";
import { LangChainService } from './langchainService.ts';

export class SearchService {
  private supabase;
  private langchainService: LangChainService;

  constructor(supabaseUrl: string, supabaseKey: string, groqApiKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.langchainService = new LangChainService(groqApiKey);
  }

  async searchGuidelines(condition: string) {
    try {
      console.log('Searching guidelines for condition:', condition);
      
      // Generate embedding for the condition
      const embedding = await this.langchainService.generateEmbedding(condition);
      
      // Perform hybrid search using our new function
      const { data: guidelines, error } = await this.supabase.rpc(
        'search_medical_guidelines',
        {
          query_text: condition,
          query_embedding: embedding,
          match_count: 5,
          similarity_threshold: 0.5,
          full_text_weight: 0.3,
          semantic_weight: 0.7
        }
      );

      if (error) {
        console.error('Error searching guidelines:', error);
        throw error;
      }

      console.log(`Found ${guidelines?.length || 0} relevant guidelines`);
      return guidelines || [];
    } catch (error) {
      console.error('Error in searchGuidelines:', error);
      throw error;
    }
  }
}