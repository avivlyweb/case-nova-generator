import type { PubMedArticle } from './types.ts';

interface PubMedSearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

interface PubMedSummaryResult {
  result: {
    [key: string]: {
      uid: string;
      title: string;
      authors: Array<{ name: string }>;
      source: string;
      pubdate: string;
      epubdate: string;
      pmid: string;
      doi?: string;
    };
  };
}

interface PubMedAbstractResult {
  PubmedArticleSet: {
    PubmedArticle: Array<{
      MedlineCitation: {
        PMID: { _: string };
        Article: {
          ArticleTitle: { _: string };
          Abstract?: {
            AbstractText: Array<{ _: string }> | { _: string };
          };
          Journal: {
            Title: { _: string };
            JournalIssue: {
              PubDate: {
                Year?: { _: string };
                Month?: { _: string };
              };
            };
          };
          AuthorList?: {
            Author: Array<{
              LastName?: { _: string };
              ForeName?: { _: string };
            }>;
          };
        };
      };
    }>;
  };
}

export class PubMedService {
  private baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
  private maxResults = 5; // Reduced default for better quality
  private maxAbstracts = 3; // Only get full abstracts for top results

  /**
   * Test if PubMed API is accessible
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing PubMed API connection...');
      const testUrl = `${this.baseUrl}esearch.fcgi?db=pubmed&term=physiotherapy&retmax=1&retmode=json`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'PhysioCase/1.0 (https://physiocase.com; contact@physiocase.com)'
        }
      });
      
      console.log(`PubMed test response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('PubMed test response:', data);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`PubMed test failed: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('PubMed connection test failed:', error);
      return false;
    }
  }

  /**
   * Search PubMed for articles related to the case study
   */
  async searchArticles(
    condition: string,
    specialization: string,
    additionalTerms: string[] = []
  ): Promise<PubMedArticle[]> {
    try {
      console.log(`Searching PubMed for: ${condition}, ${specialization}`);
      
      // Build search query
      const searchTerms = [
        condition,
        specialization,
        'physiotherapy OR physical therapy',
        ...additionalTerms
      ].filter(Boolean);
      
      const query = searchTerms.join(' AND ');
      console.log(`PubMed search query: ${query}`);

      // Step 1: Search for article IDs
      const searchUrl = `${this.baseUrl}esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${this.maxResults}&retmode=json&sort=relevance`;
      console.log(`PubMed search URL: ${searchUrl}`);
      
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'PhysioCase/1.0 (https://physiocase.com; contact@physiocase.com)'
        }
      });
      
      console.log(`PubMed search response status: ${searchResponse.status}`);
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error(`PubMed search failed: ${searchResponse.status} - ${errorText}`);
        throw new Error(`PubMed search failed: ${searchResponse.statusText}`);
      }
      
      const searchData: PubMedSearchResult = await searchResponse.json();
      const pmids = searchData.esearchresult.idlist;
      
      if (!pmids || pmids.length === 0) {
        console.log('No articles found for the search query');
        return [];
      }

      console.log(`Found ${pmids.length} articles`);

      // Step 2: Get article summaries
      const summaryUrl = `${this.baseUrl}esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
      
      const summaryResponse = await fetch(summaryUrl);
      if (!summaryResponse.ok) {
        throw new Error(`PubMed summary failed: ${summaryResponse.statusText}`);
      }
      
      const summaryData: PubMedSummaryResult = await summaryResponse.json();

      // Step 3: Get full abstracts for top articles (limit to 5 for performance)
      const topPmids = pmids.slice(0, 5);
      const abstractUrl = `${this.baseUrl}efetch.fcgi?db=pubmed&id=${topPmids.join(',')}&retmode=xml`;
      
      const abstractResponse = await fetch(abstractUrl);
      if (!abstractResponse.ok) {
        console.log('Failed to fetch abstracts, proceeding with summaries only');
      }
      
      let abstractData: PubMedAbstractResult | null = null;
      try {
        const abstractText = await abstractResponse.text();
        // Parse XML to JSON (simplified parsing)
        abstractData = this.parseXmlToJson(abstractText);
      } catch (error) {
        console.log('Error parsing abstracts:', error);
      }

      // Step 4: Format articles
      const articles: PubMedArticle[] = [];
      
      for (const pmid of pmids) {
        const summary = summaryData.result[pmid];
        if (!summary) continue;

        const abstract = abstractData?.PubmedArticleSet?.PubmedArticle?.find(
          article => article.MedlineCitation.PMID._ === pmid
        );

        const authors = summary.authors?.map(author => author.name) || [];
        const year = summary.pubdate?.split(' ')[0] || 'Unknown';
        
        const article: PubMedArticle = {
          id: pmid,
          title: summary.title || 'Unknown Title',
          abstract: this.extractAbstract(abstract) || 'Abstract not available',
          authors: authors,
          publicationDate: summary.pubdate || 'Unknown',
          journal: summary.source || 'Unknown Journal',
          evidenceLevel: this.determineEvidenceLevel(summary.title, summary.source),
          url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
          citation: this.formatCitation(summary.title, authors, summary.source, year)
        };

        articles.push(article);
      }

      console.log(`Successfully processed ${articles.length} articles`);
      return articles;

    } catch (error) {
      console.error('Error searching PubMed:', error);
      return [];
    }
  }

  /**
   * Simple XML to JSON parser for PubMed XML
   */
  private parseXmlToJson(xmlText: string): PubMedAbstractResult | null {
    try {
      // This is a simplified parser - in production, you'd want a proper XML parser
      // For now, we'll extract key information using regex
      const articles: any[] = [];
      
      const articleMatches = xmlText.match(/<PubmedArticle>[\s\S]*?<\/PubmedArticle>/g);
      if (!articleMatches) return null;

      for (const articleXml of articleMatches) {
        const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
        const titleMatch = articleXml.match(/<ArticleTitle[^>]*>(.*?)<\/ArticleTitle>/);
        const abstractMatch = articleXml.match(/<AbstractText[^>]*>(.*?)<\/AbstractText>/);
        
        if (pmidMatch && titleMatch) {
          articles.push({
            MedlineCitation: {
              PMID: { _: pmidMatch[1] },
              Article: {
                ArticleTitle: { _: titleMatch[1] },
                Abstract: abstractMatch ? { AbstractText: { _: abstractMatch[1] } } : undefined
              }
            }
          });
        }
      }

      return { PubmedArticleSet: { PubmedArticle: articles } };
    } catch (error) {
      console.error('Error parsing XML:', error);
      return null;
    }
  }

  /**
   * Extract abstract text from the parsed XML
   */
  private extractAbstract(article: any): string {
    if (!article?.MedlineCitation?.Article?.Abstract) {
      return '';
    }

    const abstractText = article.MedlineCitation.Article.Abstract.AbstractText;
    
    if (typeof abstractText === 'string') {
      return abstractText;
    }
    
    if (Array.isArray(abstractText)) {
      return abstractText.map(text => typeof text === 'string' ? text : text._).join(' ');
    }
    
    if (abstractText._) {
      return abstractText._;
    }
    
    return '';
  }

  /**
   * Determine evidence level based on title and journal
   */
  private determineEvidenceLevel(title: string, journal: string): string {
    const titleLower = title.toLowerCase();
    const journalLower = journal.toLowerCase();

    // High-impact journals
    const highImpactJournals = [
      'cochrane', 'bmj', 'lancet', 'nejm', 'jama', 'nature', 'science'
    ];

    // Study types (in order of evidence strength)
    if (titleLower.includes('systematic review') || titleLower.includes('meta-analysis')) {
      return 'Level I - Systematic Review/Meta-analysis';
    }
    
    if (titleLower.includes('randomized controlled trial') || titleLower.includes('rct')) {
      return 'Level II - Randomized Controlled Trial';
    }
    
    if (titleLower.includes('cohort study') || titleLower.includes('prospective')) {
      return 'Level III - Cohort Study';
    }
    
    if (titleLower.includes('case-control')) {
      return 'Level IV - Case-Control Study';
    }
    
    if (titleLower.includes('case series') || titleLower.includes('case report')) {
      return 'Level V - Case Series/Report';
    }

    // Check for high-impact journals
    if (highImpactJournals.some(journal => journalLower.includes(journal))) {
      return 'Level II-III - High Impact Journal';
    }

    return 'Level IV - Professional Literature';
  }

  /**
   * Format citation in APA style
   */
  private formatCitation(title: string, authors: string[], journal: string, year: string): string {
    const authorString = authors.length > 0 
      ? authors.length > 3 
        ? `${authors.slice(0, 3).join(', ')}, et al.`
        : authors.join(', ')
      : 'Unknown Authors';

    return `${authorString} (${year}). ${title}. ${journal}.`;
  }

  /**
   * Advanced search configuration for case-specific references
   */
  async getEvidenceBasedReferences(
    condition: string,
    specialization: string,
    symptoms?: string,
    interventions?: string[],
    options: {
      maxResults?: number;
      evidenceLevels?: string[];
      yearRange?: { from: number; to?: number };
      includeGuidelines?: boolean;
      focusAreas?: string[];
    } = {}
  ): Promise<PubMedArticle[]> {
    // Set search parameters
    const maxResults = options.maxResults || 5;
    const originalMaxResults = this.maxResults;
    this.maxResults = maxResults;

    try {
      // Build targeted search terms based on case specifics
      const caseSpecificTerms = this.buildCaseSpecificTerms(
        condition,
        specialization,
        symptoms,
        interventions,
        options
      );

      console.log('Case-specific search terms:', caseSpecificTerms);

      // Try multiple search strategies for better results
      const searchStrategies = [
        // Strategy 1: Highly specific search
        this.buildHighSpecificityQuery(caseSpecificTerms),
        // Strategy 2: Moderate specificity with broader terms
        this.buildModerateSpecificityQuery(caseSpecificTerms),
        // Strategy 3: Broad search for general evidence
        this.buildBroadQuery(caseSpecificTerms)
      ];

      let allArticles: PubMedArticle[] = [];

      for (let i = 0; i < searchStrategies.length && allArticles.length < maxResults; i++) {
        const strategy = searchStrategies[i];
        console.log(`Trying search strategy ${i + 1}: ${strategy.description}`);
        
        try {
          const articles = await this.executeSearch(strategy.query, Math.ceil(maxResults / searchStrategies.length));
          
          // Filter duplicates and add to results
          const newArticles = articles.filter(article => 
            !allArticles.some(existing => existing.id === article.id)
          );
          
          allArticles.push(...newArticles);
          console.log(`Strategy ${i + 1} found ${newArticles.length} new articles`);
          
        } catch (error) {
          console.error(`Search strategy ${i + 1} failed:`, error);
        }
      }

      // Sort by relevance and evidence level
      allArticles = this.rankArticlesByRelevance(allArticles, caseSpecificTerms);
      
      // Limit to requested number
      const finalArticles = allArticles.slice(0, maxResults);
      
      console.log(`Final selection: ${finalArticles.length} articles`);
      return finalArticles;

    } finally {
      // Restore original max results
      this.maxResults = originalMaxResults;
    }
  }

  /**
   * Build case-specific search terms
   */
  private buildCaseSpecificTerms(
    condition: string,
    specialization: string,
    symptoms?: string,
    interventions?: string[],
    options: any = {}
  ) {
    const terms = {
      primary: [] as string[],
      secondary: [] as string[],
      interventions: [] as string[],
      evidenceTypes: [] as string[],
      specialization: specialization.toLowerCase(),
      condition: condition.toLowerCase()
    };

    // Primary condition terms
    terms.primary.push(condition);
    
    // Add condition synonyms/related terms
    const conditionSynonyms = this.getConditionSynonyms(condition);
    terms.primary.push(...conditionSynonyms);

    // Symptoms and presentations
    if (symptoms) {
      const symptomTerms = symptoms.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      terms.secondary.push(...symptomTerms);
    }

    // Interventions
    if (interventions && interventions.length > 0) {
      terms.interventions.push(...interventions);
    }

    // Add specialization-specific terms
    const specializationTerms = this.getSpecializationTerms(specialization);
    terms.secondary.push(...specializationTerms);

    // Evidence types based on preferences
    if (options.evidenceLevels) {
      terms.evidenceTypes.push(...options.evidenceLevels);
    } else {
      terms.evidenceTypes.push(
        'systematic review',
        'meta-analysis',
        'randomized controlled trial',
        'clinical trial',
        'evidence-based'
      );
    }

    // Focus areas
    if (options.focusAreas) {
      terms.secondary.push(...options.focusAreas);
    }

    return terms;
  }

  /**
   * Get condition synonyms and related terms
   */
  private getConditionSynonyms(condition: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'lower back pain': ['low back pain', 'lumbar pain', 'lumbago', 'back pain'],
      'knee pain': ['patellofemoral pain', 'knee osteoarthritis', 'knee injury'],
      'shoulder pain': ['shoulder impingement', 'rotator cuff', 'shoulder injury'],
      'neck pain': ['cervical pain', 'cervicalgia', 'neck injury'],
      'stroke': ['cerebrovascular accident', 'CVA', 'hemiplegia', 'hemiparesis'],
      'spinal cord injury': ['SCI', 'paraplegia', 'tetraplegia', 'quadriplegia'],
      'multiple sclerosis': ['MS', 'demyelinating disease'],
      'parkinson': ['parkinsons disease', 'PD', 'movement disorder'],
      'copd': ['chronic obstructive pulmonary disease', 'emphysema', 'chronic bronchitis'],
      'heart failure': ['cardiac failure', 'congestive heart failure', 'CHF']
    };

    const conditionLower = condition.toLowerCase();
    for (const [key, synonyms] of Object.entries(synonymMap)) {
      if (conditionLower.includes(key) || synonyms.some(syn => conditionLower.includes(syn))) {
        return synonyms;
      }
    }
    return [];
  }

  /**
   * Get specialization-specific terms
   */
  private getSpecializationTerms(specialization: string): string[] {
    const specializationTerms: Record<string, string[]> = {
      'orthopedic': ['musculoskeletal', 'biomechanics', 'manual therapy', 'exercise therapy'],
      'neurological': ['neurorehabilitation', 'motor learning', 'plasticity', 'gait training'],
      'cardiovascular': ['cardiac rehabilitation', 'exercise tolerance', 'aerobic capacity'],
      'pediatric': ['child development', 'motor development', 'pediatric rehabilitation'],
      'geriatric': ['aging', 'fall prevention', 'frailty', 'elderly'],
      'icu': ['critical care', 'intensive care', 'mechanical ventilation', 'early mobilization']
    };

    return specializationTerms[specialization.toLowerCase()] || [];
  }

  /**
   * Build high specificity search query
   */
  private buildHighSpecificityQuery(terms: any) {
    const query = [
      `(${terms.primary.join(' OR ')})`,
      'AND',
      `(${terms.specialization} OR physiotherapy OR "physical therapy")`,
      'AND',
      `(${terms.evidenceTypes.slice(0, 2).join(' OR ')})` // Top evidence types only
    ].join(' ');

    return {
      query,
      description: 'High specificity - exact condition + top evidence types'
    };
  }

  /**
   * Build moderate specificity search query
   */
  private buildModerateSpecificityQuery(terms: any) {
    const allTerms = [...terms.primary, ...terms.secondary.slice(0, 2)];
    const query = [
      `(${allTerms.join(' OR ')})`,
      'AND',
      `(${terms.specialization} OR physiotherapy OR "physical therapy")`,
      'AND',
      `(${terms.evidenceTypes.join(' OR ')})`
    ].join(' ');

    return {
      query,
      description: 'Moderate specificity - condition + symptoms + all evidence types'
    };
  }

  /**
   * Build broad search query
   */
  private buildBroadQuery(terms: any) {
    const query = [
      `(${terms.condition})`,
      'AND',
      `(${terms.specialization} OR physiotherapy OR "physical therapy")`,
      'AND',
      '(treatment OR intervention OR therapy OR rehabilitation)'
    ].join(' ');

    return {
      query,
      description: 'Broad search - general condition + treatment terms'
    };
  }

  /**
   * Execute a specific search query
   */
  private async executeSearch(query: string, maxResults: number): Promise<PubMedArticle[]> {
    const searchUrl = `${this.baseUrl}esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance`;
    
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'PhysioCase/1.0 (https://physiocase.com; contact@physiocase.com)'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.statusText}`);
    }

    const searchData: PubMedSearchResult = await searchResponse.json();
    const pmids = searchData.esearchresult.idlist;

    if (!pmids || pmids.length === 0) {
      return [];
    }

    // Get summaries and process articles (reuse existing logic)
    const summaryUrl = `${this.baseUrl}esummary.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=json`;
    const summaryResponse = await fetch(summaryUrl);
    
    if (!summaryResponse.ok) {
      throw new Error(`Summary failed: ${summaryResponse.statusText}`);
    }
    
    const summaryData: PubMedSummaryResult = await summaryResponse.json();
    const articles: PubMedArticle[] = [];

    for (const pmid of pmids) {
      const summary = summaryData.result[pmid];
      if (!summary) continue;

      const authors = summary.authors?.map(author => author.name) || [];
      const year = summary.pubdate?.split(' ')[0] || 'Unknown';
      
      const article: PubMedArticle = {
        id: pmid,
        title: summary.title || 'Unknown Title',
        abstract: 'Abstract will be fetched separately', // Placeholder
        authors: authors,
        publicationDate: summary.pubdate || 'Unknown',
        journal: summary.source || 'Unknown Journal',
        evidenceLevel: this.determineEvidenceLevel(summary.title, summary.source),
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
        citation: this.formatCitation(summary.title, authors, summary.source, year)
      };

      articles.push(article);
    }

    return articles;
  }

  /**
   * Rank articles by relevance to the case
   */
  private rankArticlesByRelevance(articles: PubMedArticle[], terms: any): PubMedArticle[] {
    return articles.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Evidence level scoring
      const evidenceScores: Record<string, number> = {
        'Level I': 10,
        'Level II': 8,
        'Level III': 6,
        'Level IV': 4,
        'Level V': 2
      };

      scoreA += evidenceScores[a.evidenceLevel.split(' - ')[0]] || 0;
      scoreB += evidenceScores[b.evidenceLevel.split(' - ')[0]] || 0;

      // Title relevance scoring
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();

      // Primary condition match
      terms.primary.forEach((term: string) => {
        if (titleA.includes(term.toLowerCase())) scoreA += 5;
        if (titleB.includes(term.toLowerCase())) scoreB += 5;
      });

      // Secondary terms match
      terms.secondary.forEach((term: string) => {
        if (titleA.includes(term.toLowerCase())) scoreA += 2;
        if (titleB.includes(term.toLowerCase())) scoreB += 2;
      });

      // Specialization match
      if (titleA.includes(terms.specialization)) scoreA += 3;
      if (titleB.includes(terms.specialization)) scoreB += 3;

      return scoreB - scoreA; // Higher score first
    });
  }
}

export const pubmedService = new PubMedService();