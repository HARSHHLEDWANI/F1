/**
 * Wikipedia API client for fetching F1 driver information
 */

interface WikipediaPageData {
  title: string;
  extract: string;
  content_urls?: {
    desktop: {
      page: string;
    };
  };
  image?: {
    source: string;
    width: number;
    height: number;
  };
}

interface WikipediaSearchResult {
  query: {
    pages: {
      [key: string]: WikipediaPageData;
    };
  };
}

/**
 * Build Wikipedia URL from page title
 */
export function buildWikipediaUrl(pageTitle: string): string {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;
}

/**
 * Fetch driver information from Wikipedia
 */
export async function getDriverWikipediaData(
  driverName: string
): Promise<WikipediaPageData | null> {
  try {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      titles: driverName,
      prop: "extracts|pageimages|info",
      exintro: "true",
      explaintext: "true",
      piprop: "original",
      redirects: "1",
      origin: "*", // Enable CORS
      pithumbsize: "300",
    });

    const url = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
    console.log(`[Wikipedia] Fetching: ${driverName}`);
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "F1-Predictor (https://f1predictor.app)",
      },
    });

    if (!response.ok) {
      console.error(`[Wikipedia] API error for ${driverName}:`, response.statusText);
      return null;
    }

    const data: WikipediaSearchResult = await response.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    if (!page || page.title === "Special:Badtitle" || !page.extract) {
      console.warn(`[Wikipedia] No valid page found for ${driverName}`);
      return null;
    }

    console.log(`[Wikipedia] ✓ Found: ${page.title}`);
    // Ensure we have a URL for the page
    const pageUrl = page.content_urls?.desktop?.page || buildWikipediaUrl(page.title);
    page.content_urls = {
      desktop: {
        page: pageUrl
      }
    };
    
    return page;
  } catch (error) {
    console.error(`[Wikipedia] Failed to fetch ${driverName}:`, error);
    return null;
  }
}

/**
 * Search for F1 driver on Wikipedia
 */
export async function searchDriverWikipedia(
  givenName: string,
  familyName: string
): Promise<WikipediaPageData | null> {
  console.log(`[Wikipedia] Searching for ${givenName} ${familyName}...`);
  
  // Try full name first with Formula One context
  let result = await getDriverWikipediaData(
    `${givenName} ${familyName} Formula One`
  );

  if (result) {
    return result;
  }

  // Try just the full name
  result = await getDriverWikipediaData(`${givenName} ${familyName}`);

  if (result) {
    return result;
  }

  // Try family name only
  result = await getDriverWikipediaData(familyName);

  if (result) {
    return result;
  }

  console.warn(`[Wikipedia] No results found for ${givenName} ${familyName}`);
  return null;
}

/**
 * Extract statistics from Wikipedia extract text
 */
export function extractStatsFromExtract(text: string): {
  championships?: number;
  wins?: number;
  podiums?: number;
  poles?: number;
} {
  const stats: {
    championships?: number;
    wins?: number;
    podiums?: number;
    poles?: number;
  } = {};

  // Try to extract championship count
  const chambPattern = /(\d+)\s+(?:Formula One|F1|World)\s+(?:World\s+)?[Cc]hampionship/;
  const chambMatch = text.match(chambPattern);
  if (chambMatch) {
    stats.championships = parseInt(chambMatch[1]);
  }

  // Extract wins
  const winsPattern = /(?:won|wins|racing wins|race wins)[\s:]*(\d+)/i;
  const winsMatch = text.match(winsPattern);
  if (winsMatch) {
    stats.wins = parseInt(winsMatch[1]);
  }

  // Extract podiums
  const podiumPattern = /(?:podium|podiums)[\s:]*(\d+)/i;
  const podiumMatch = text.match(podiumPattern);
  if (podiumMatch) {
    stats.podiums = parseInt(podiumMatch[1]);
  }

  // Extract pole positions
  const polePattern = /(?:pole|poles)[\s:]*(\d+)/i;
  const poleMatch = text.match(polePattern);
  if (poleMatch) {
    stats.poles = parseInt(poleMatch[1]);
  }

  return stats;
}

/**
 * Search for F1 circuit/track on Wikipedia
 */
export async function searchTrackWikipedia(
  trackName: string
): Promise<WikipediaPageData | null> {
  console.log(`[Wikipedia] Searching for track: ${trackName}...`);

  // Try with Formula One circuit context
  let result = await getDriverWikipediaData(`${trackName} Formula One`);

  if (result) {
    return result;
  }

  // Try just the track name
  result = await getDriverWikipediaData(trackName);

  if (result) {
    return result;
  }

  // Try with "Circuit" suffix
  result = await getDriverWikipediaData(`${trackName} Circuit`);

  if (result) {
    return result;
  }

  // Try with "Grand Prix" context
  result = await getDriverWikipediaData(`${trackName} Grand Prix`);

  if (result) {
    return result;
  }

  console.warn(`[Wikipedia] No results found for track: ${trackName}`);
  return null;
}
