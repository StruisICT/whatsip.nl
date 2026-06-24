/**
 * WebSocket speed test endpoint
 * Streams binary data over WebSocket for lower overhead than HTTP
 */
export const onRequest: PagesFunction = async ({ request }) => {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  // @ts-ignore - Cloudflare Workers WebSocket API
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  // @ts-ignore
  server.accept();

  // Send 50MB of binary data as fast as possible
  const chunkSize = 64 * 1024; // 64KB chunks
  const totalChunks = (50 * 1024 * 1024) / chunkSize; // 50MB
  const chunk = new Uint8Array(chunkSize);
  
  // Fill with pattern
  for (let i = 0; i < chunkSize; i++) {
    chunk[i] = i % 256;
  }

  // Stream chunks
  let sent = 0;
  const interval = setInterval(() => {
    if (sent >= totalChunks) {
      clearInterval(interval);
      // @ts-ignore
      server.send(JSON.stringify({ done: true, totalBytes: sent * chunkSize }));
      // @ts-ignore
      server.close();
      return;
    }
    
    try {
      // @ts-ignore
      server.send(chunk);
      sent++;
    } catch (err) {
      clearInterval(interval);
    }
  }, 0); // Send as fast as possible

  return new Response(null, {
    status: 101,
    // @ts-ignore
    webSocket: client,
  });
};
