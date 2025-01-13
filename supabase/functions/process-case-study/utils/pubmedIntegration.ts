import { PubMedArticle } from './types.ts';

const PUBMED_API_KEY = Deno.env.get('PUBMED_API_KEY');
const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function searchPubMedArticles(query: string, maxResults: number = 5): Promise<PubMedArticle[]> {
  console.log('Searching PubMed for:', query);
  try {
    // Search for article IDs
    const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&sort=relevance&api_key=${PUBMED_API_KEY}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult.idlist;

    if (!ids || ids.length === 0) {
      console.log('No PubMed articles found for query:', query);
      return [];
    }

    // Fetch article details
    const detailsUrl = `${PUBMED_BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&api_key=${PUBMED_API_KEY}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    const articles: PubMedArticle[] = [];
    for (const id of ids) {
      const article = detailsData.result[id];
      if (article) {
        articles.push({
          id: article.uid,
          title: article.title,
          abstract: article.abstract || '',
          authors: article.authors?.map((author: any) => author.name) || [],
          publicationDate: article.pubdate,
          journal: article.source,
          evidenceLevel: determineEvidenceLevel(article),
          url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
          citation: `${article.authors?.[0]?.name || 'Unknown'} et al. (${new Date(article.pubdate).getFullYear()})`
        });
      }
    }

    console.log(`Found ${articles.length} relevant PubMed articles`);
    return articles;
  } catch (error) {
    console.error('Error searching PubMed:', error);
    return [];
  }
}

function determineEvidenceLevel(article: any): string {
  const publicationType = article.pubtype?.map((type: string) => type.toLowerCase()) || [];
  const title = article.title.toLowerCase();

  if (publicationType.includes('meta-analysis') || title.includes('meta-analysis')) {
    return 'Level I';
  } else if (publicationType.includes('systematic review') || title.includes('systematic review')) {
    return 'Level I';
  } else if (publicationType.includes('randomized controlled trial') || title.includes('rct')) {
    return 'Level II';
  } else if (publicationType.includes('cohort study')) {
    return 'Level III';
  } else if (publicationType.includes('case series') || publicationType.includes('case report')) {
    return 'Level IV';
  } else {
    return 'Level V';
  }
}