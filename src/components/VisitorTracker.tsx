import { useEffect, useState } from 'react';

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

// Flag to control debug display
const SHOW_DEBUG_INFO = false;

export default function VisitorTracker() {
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const trackVisitor = async () => {
      if (isTracking) return;
      setIsTracking(true);
      
      console.log('[Visitor Tracking] Starting visitor tracking...');
      
      try {
        console.log('[Visitor Tracking] Sending request to tracking endpoint...');
        
        const response = await fetch('/api/track-visitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin'
        });

        // Log raw response for debugging
        const responseText = await response.text();
        // console.log('[Visitor Tracking] Raw response:', responseText);

        // Parse the response
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[Visitor Tracking] Failed to parse response:', parseError);
          throw new Error('Invalid response format');
        }

        console.log('[Visitor Tracking] Parsed response:', data);

        setDebugInfo({
          status: response.status,
          statusText: response.statusText,
          data,
          timestamp: new Date().toISOString()
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}: ${data.error || 'Unknown error'}`);
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to track visitor');
        }

        // Log success with detailed information
        console.log('[Visitor Tracking] Success:', {
          response: data,
          timestamp: new Date().toISOString()
        });

        // Store in session storage only after successful tracking
        sessionStorage.setItem('visitorTracked', 'true');
        sessionStorage.setItem('visitorData', JSON.stringify({
          timestamp: new Date().toISOString(),
          data
        }));

      } catch (error) {
        console.error('[Visitor Tracking] Error:', error);
        setError(error instanceof Error ? error.message : 'Failed to track visitor');
      } finally {
        setIsTracking(false);
      }
    };

    // Check if we should track this session
    const hasTracked = sessionStorage.getItem('visitorTracked');
    const lastTrackedData = sessionStorage.getItem('visitorData');

    if (!hasTracked) {
      console.log('[Visitor Tracking] New session detected, initiating tracking...');
      trackVisitor();
    } else {
      console.log('[Visitor Tracking] Session already tracked:', lastTrackedData);
    }
  }, []); // Run once when component mounts

  // Show debug information in development
  if (SHOW_DEBUG_INFO && process.env.NODE_ENV === 'development' && (error || debugInfo)) {
    return (
      <div className="fixed bottom-4 right-4 max-w-md z-50 p-4 rounded-lg shadow-lg">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <pre className="mt-2 text-sm overflow-auto max-h-40 bg-red-50 p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        ) : debugInfo && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success: </strong>
            <pre className="mt-2 text-sm overflow-auto max-h-40 bg-green-50 p-2 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  }

  return null;
} 