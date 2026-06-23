/**
 * Speed test endpoint - returns random data for download speed testing
 * Query param: size (in KB, default 1000 = 1MB)
 */
export const onRequest: PagesFunction = ({ request }) => {
  const url = new URL(request.url);
  const sizeKB = Math.min(parseInt(url.searchParams.get("size") || "1000"), 10000); // Max 10MB
  const sizeBytes = sizeKB * 1024;
  
  // Generate random data
  // Using a simple repeating pattern is faster than true random
  const chunk = "0123456789abcdef".repeat(64); // 1KB chunk
  const chunks = Math.ceil(sizeBytes / 1024);
  
  let data = "";
  for (let i = 0; i < chunks; i++) {
    data += chunk;
  }
  
  return new Response(data.slice(0, sizeBytes), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": sizeBytes.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
