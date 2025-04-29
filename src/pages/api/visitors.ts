export async function GET() {
  try {
    const response = await fetch('https://portfolio-backend-jade-one.vercel.app/visitors', {
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch visitor statistics'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
} 