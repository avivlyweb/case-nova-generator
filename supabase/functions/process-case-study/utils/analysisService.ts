import { LangChainService } from './langchainService.ts';
import { SearchService } from './searchService.ts';
import type { CaseStudy, ProcessedCaseStudy } from './types.ts';

export class AnalysisService {
  private langchainService: LangChainService;
  private searchService: SearchService;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    groqApiKey: string
  ) {
    this.langchainService = new LangChainService(groqApiKey);
    this.searchService = new SearchService(supabaseUrl, supabaseKey, groqApiKey);
  }

  async generateQuickAnalysis(
    caseStudy: CaseStudy,
    guidelines: any
  ): Promise<ProcessedCaseStudy> {
    console.log('Generating quick analysis...');
    
    try {
      const [analysisContent, relevantGuidelines] = await Promise.all([
        this.langchainService.generateQuickAnalysis(caseStudy, guidelines),
        this.searchService.searchGuidelines(caseStudy.condition || '')
      ]);

      const icfCodes = this.extractICFCodes(analysisContent);
      
      return {
        success: true,
        analysis: analysisContent,
        icf_codes: icfCodes,
        clinical_guidelines: relevantGuidelines.map(g => ({
          name: g.title,
          url: g.url || `https://richtlijnendatabase.nl/search?q=${encodeURIComponent(g.condition)}`,
          key_points: g.content?.key_points || [],
          recommendation_level: "Evidence-based"
        }))
      };
    } catch (error) {
      console.error('Error in generateQuickAnalysis:', error);
      throw error;
    }
  }

  private extractICFCodes(content: string): string[] {
    const icfPattern = /\b[bdes]\d{3}\b/gi;
    const matches = content.match(icfPattern) || [];
    return [...new Set(matches)];
  }
}