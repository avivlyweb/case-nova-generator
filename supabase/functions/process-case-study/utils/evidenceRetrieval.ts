import { PubMedArticle, ClinicalGuideline } from './types.ts';

export async function searchPubMed(query: string, apiKey: string): Promise<PubMedArticle[]> {
  console.log('Searching PubMed for:', query);
  try {
    // First, search for article IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json&sort=relevance&api_key=${apiKey}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult.idlist;

    // Then, fetch details for each article
    const detailsUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&api_key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    return Object.values(detailsData.result).filter(article => article.uid).map((article: any) => ({
      id: article.uid,
      title: article.title,
      abstract: article.abstract || '',
      authors: article.authors?.map((author: any) => author.name) || [],
      publicationDate: article.pubdate,
      journal: article.source,
      evidenceLevel: determineEvidenceLevel(article),
      url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
      citation: `${article.authors?.[0]?.name || 'Unknown'} et al. (${new Date(article.pubdate).getFullYear()})`
    }));
  } catch (error) {
    console.error('Error searching PubMed:', error);
    return [];
  }
}

function determineEvidenceLevel(article: any): string {
  const title = article.title.toLowerCase();
  const publicationType = article.pubtype?.map((type: string) => type.toLowerCase()) || [];

  if (publicationType.includes('meta-analysis') || title.includes('meta-analysis')) {
    return 'Level I';
  } else if (publicationType.includes('systematic review') || title.includes('systematic review')) {
    return 'Level I';
  } else if (publicationType.includes('randomized controlled trial') || title.includes('rct')) {
    return 'Level II';
  } else if (publicationType.includes('cohort study')) {
    return 'Level III';
  } else {
    return 'Level IV';
  }
}

export async function fetchClinicalGuidelines(condition: string): Promise<ClinicalGuideline[]> {
  console.log('Fetching clinical guidelines for:', condition);
  // Simulated guidelines data structure
  return [
    {
      name: "NICE Guidelines",
      url: `https://www.nice.org.uk/search?q=${encodeURIComponent(condition)}`,
      key_points: [
        "Regular assessment and monitoring",
        "Evidence-based treatment approaches",
        "Patient-centered care planning"
      ],
      recommendation_level: "Grade A"
    },
    {
      name: "KNGF Guidelines",
      url: `https://www.kngf.nl/kennisplatform/richtlijnen/${encodeURIComponent(condition)}`,
      key_points: [
        "Structured exercise progression",
        "Functional movement assessment",
        "Goal-oriented rehabilitation"
      ],
      recommendation_level: "Strong recommendation"
    }
  ];
}