import { EmbeddingService } from './llm/embeddingService.ts';
import { AnalysisService } from './llm/analysisService.ts';
import { GuidelineService } from './llm/guidelineService.ts';
import type { CaseStudy, Section, PubMedArticle } from './types.ts';

export class LangChainService {
  private embeddingService: EmbeddingService;
  private analysisService: AnalysisService;
  private guidelineService: GuidelineService;

  constructor(apiKey: string) {
    this.embeddingService = new EmbeddingService(apiKey);
    this.analysisService = new AnalysisService(apiKey);
    this.guidelineService = new GuidelineService(apiKey);
  }

  async generateEmbedding(text: string): Promise<number[]> {
    return this.embeddingService.generateEmbedding(text);
  }

  async generateQuickAnalysis(caseStudy: CaseStudy, guidelines: any = null): Promise<string> {
    return this.analysisService.generateQuickAnalysis(caseStudy, guidelines);
  }

  async generateStructuredGuidelines(condition: string, systemPrompt: string): Promise<any> {
    return this.guidelineService.generateStructuredGuidelines(condition, systemPrompt);
  }
}