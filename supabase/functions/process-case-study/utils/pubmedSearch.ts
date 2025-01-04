interface PubMedArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  journal: string;
}

export const searchPubMed = async (query: string, apiKey: string): Promise<PubMedArticle[]> => {
  try {
    // First, search for article IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json&sort=date&api_key=${apiKey}`;
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
      journal: article.source
    }));
  } catch (error) {
    console.error('Error searching PubMed:', error);
    return [];
  }
};

export const formatReference = (article: PubMedArticle): string => {
  const authors = article.authors.length > 0 
    ? article.authors.join(', ') 
    : '[No authors listed]';
  
  return `${authors}. (${new Date(article.publicationDate).getFullYear()}). ${article.title}. ${article.journal}.`;
};