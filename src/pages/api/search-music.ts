import type { APIRoute } from 'astro';

// Tell Astro this is a server-side API route
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    console.log('Full request URL:', request.url);
    console.log('URL search params:', Object.fromEntries(url.searchParams.entries()));
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    const searchQuery = url.searchParams.get('q');
    console.log('Raw search query:', searchQuery);

    if (!searchQuery) {
      console.log('No search query provided');
      return new Response(JSON.stringify({ error: 'Search query is required' }), { 
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Clean and encode the search query
    const cleanedQuery = searchQuery.trim();
    const encodedQuery = encodeURIComponent(cleanedQuery);
    console.log('Cleaned query:', cleanedQuery);
    console.log('Encoded query:', encodedQuery);

    // Make request to Deezer API
    const deezerUrl = `https://api.deezer.com/search?q=${encodedQuery}`;
    console.log('Making request to Deezer:', deezerUrl);
    
    const response = await fetch(deezerUrl);
    console.log('Deezer API response status:', response.status);
    console.log('Deezer API response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`Deezer API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Deezer API response data:', data);

    // Return the Deezer API response with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch from Deezer' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}; 