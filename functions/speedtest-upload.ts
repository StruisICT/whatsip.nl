/**
 * Upload speed test endpoint
 * Receives POST data and returns timing info
 */
export const onRequestPost: PagesFunction = async ({ request }) => {
  const start = Date.now();
  
  // Read the uploaded data
  const blob = await request.blob();
  const sizeBytes = blob.size;
  
  const end = Date.now();
  const durationMs = end - start;
  
  return new Response(JSON.stringify({
    bytes: sizeBytes,
    durationMs,
    mbps: (sizeBytes * 8) / (durationMs * 1000),
  }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
