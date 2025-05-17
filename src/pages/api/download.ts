import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Set appropriate headers for file download
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/downloads/office-activator-2016-2019-2021-365.zip', // Path to your file in the public directory
        'Content-Disposition': 'attachment; filename="office-activator-2016-2019-2021-365.zip"',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to download file'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}; 