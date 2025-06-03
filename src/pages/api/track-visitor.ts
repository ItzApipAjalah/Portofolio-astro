interface VisitorResponse {
  success: boolean;
  message: string;
  visitor: {
    id: number;
    ip_address: string;
    country: string;
    created_at: string;
    updated_at: string;
  };
  details: {
    ip_address: string;
    country: string;
    created_at: string;
  };
}

// Validate IP address format
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (!ip || typeof ip !== 'string') return false;
  
  // Check if IPv4
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(num => parseInt(num) >= 0 && parseInt(num) <= 255);
  }
  
  // Check if IPv6
  return ipv6Regex.test(ip);
}

// Get real IP address from headers
function getClientIP(headers: Headers): string {
  // Priority order of headers
  const ipHeaders = [
    'x-forwarded-for', // Always check this first for proxies
    'x-client-ip',
    'cf-connecting-ip',
    'x-real-ip',
    'x-forwarded',
    'x-cluster-client-ip',
    'forwarded-for',
    'forwarded',
    'remote-addr'
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list
      const ips = value.split(',').map(ip => ip.trim());
      // Get the first valid IP from the list
      for (const ip of ips) {
        if (isValidIP(ip)) {
          console.log(`[Visitor Tracking] Found valid IP ${ip} in header ${header}`);
          return ip;
        }
      }
    }
  }

  // If no valid IP found, log a warning and return localhost
  console.warn('[Visitor Tracking] No valid IP found in headers:', {
    headers: Object.fromEntries([...headers.entries()])
  });
  return '127.0.0.1';
}

export async function POST({ request }: { request: Request }) {
  try {
    const ip = getClientIP(request.headers);

    console.log('[Visitor Tracking] Processing request with IP:', ip);

    // Send to your API
    const apiResponse = await fetch('https://portfolio-backend-jade-one.vercel.app/visitors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ip_address: ip
      })
    });

    console.log('[Visitor Tracking] API Response Status:', apiResponse.status);
    
    // Log the raw response text for debugging
    const responseText = await apiResponse.text();
    console.log('[Visitor Tracking] API Raw Response:', responseText);

    // Parse the response as JSON
    let data: VisitorResponse;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Visitor Tracking] Failed to parse API response:', parseError);
      throw new Error('Invalid API response format');
    }

    if (!apiResponse.ok) {
      throw new Error(`API responded with status ${apiResponse.status}: ${data.message || responseText}`);
    }

    return new Response(JSON.stringify({
      success: true,
      data,
      debug: {
        ip,
        timestamp: new Date().toISOString(),
        headers: Object.fromEntries([...request.headers.entries()])
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    console.error('[Visitor Tracking] Error:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track visitor',
      timestamp: new Date().toISOString(),
      debug: {
        headers: Object.fromEntries([...request.headers.entries()])
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }
} 