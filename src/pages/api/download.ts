import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Redirect to Google Drive direct download
    return new Response(null, {
      status: 302,
      headers: {
        'Location': 'https://drive.usercontent.google.com/u/0/uc?id=1d2nztTjFlZzXIQ19Kp6crvAYgFNj7UcY&export=download',
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