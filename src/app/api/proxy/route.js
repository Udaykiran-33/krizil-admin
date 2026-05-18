export async function handleRequest(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("targetUrl");

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing targetUrl" }), { status: 400 });
  }

  const targetUrlObj = new URL(targetUrl);
  const queryStr = url.searchParams.get("queryObj");
  if (queryStr) {
    try {
      const queryObj = JSON.parse(queryStr);
      Object.entries(queryObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          targetUrlObj.searchParams.set(k, String(v));
        }
      });
    } catch (e) {
      // Ignore parse error
    }
  }

  const headers = new Headers();
  const auth = request.headers.get("Authorization");
  if (auth) headers.set("Authorization", auth);
  const ct = request.headers.get("Content-Type");
  if (ct) headers.set("Content-Type", ct);
  headers.set("Accept", "application/json");

  const options = {
    method: request.method,
    headers,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) options.body = body;
    } catch (e) {
      // Ignore body read error
    }
  }

  try {
    const response = await fetch(targetUrlObj.toString(), options);
    const responseBody = await response.text();
    
    return new Response(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Proxy fetch failed", 
      error: err.message 
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export { 
  handleRequest as GET, 
  handleRequest as POST, 
  handleRequest as PUT, 
  handleRequest as DELETE,
  handleRequest as PATCH 
};
