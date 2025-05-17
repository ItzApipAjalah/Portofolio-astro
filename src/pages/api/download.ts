import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  return new Response(null, {
    status: 302,
    headers: {
      'Location': 'https://drive.usercontent.google.com/u/0/uc?id=1d2nztTjFlZzXIQ19Kp6crvAYgFNj7UcY&export=download'
    }
  });
}; 