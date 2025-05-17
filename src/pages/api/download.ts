import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Set headers for file download
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/downloads/Office_Activator.zip',
        'Content-Disposition': 'attachment; filename="Office_Activator.zip"'
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response(JSON.stringify({ error: 'Failed to download file' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 