/**
 * Speed test endpoint - returns random data for download speed testing
 * Query param: size (in KB, default 1000 = 1MB)
 */
export const onRequest: PagesFunction = ({ request }) => {
  const url = new URL(request.url);
  const sizeKB = Math.min(parseInt(url.searchParams.get("size") || "1000"), 20000); // Max 20MB per stream
  const sizeBytes = sizeKB * 1024;
  
  // Generate data efficiently using ArrayBuffer for large files
  // Much faster than string concatenation for multi-MB responses
  const buffer = new Uint8Array(sizeBytes);
  
  // Fill with a repeating pattern (faster than random, sufficient for speed test)
  const pattern = new TextEncoder().encode("0123456789abcdefghijklmnopqrstuvwxyz");
  for (let i = 0; i < sizeBytes; i++) {
    buffer[i] = pattern[i % pattern.length];
  }
  
  return new Response(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": sizeBytes.toString(),
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });
};
