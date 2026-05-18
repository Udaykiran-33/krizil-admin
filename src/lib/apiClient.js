export function getPathParams(path) {
  const matches = path.match(/:[A-Za-z0-9_]+/g) || [];
  return matches.map((token) => token.slice(1));
}

export function applyPathParams(path, values) {
  return path.replace(/:([A-Za-z0-9_]+)/g, (_match, key) => {
    const value = values[key];
    if (!value) return `:${key}`;
    return encodeURIComponent(String(value));
  });
}

export function toPrettyJson(value) {
  return JSON.stringify(value ?? {}, null, 2);
}

export async function runApiOperation({
  baseUrl,
  token,
  method,
  path,
  pathParams,
  queryObj,
  bodyObj,
}) {
  const appliedPath = applyPathParams(path, pathParams || {});
  let cleanBase = baseUrl.trim().replace(/\/+$/, "");
  
  // Self-heal: Force HTTP instead of HTTPS if it points to AWS Elastic Beanstalk
  if (cleanBase.includes("elasticbeanstalk.com") && cleanBase.startsWith("https://")) {
    cleanBase = cleanBase.replace(/^https:/i, "http:");
  }

  // Self-heal: Ensure /api/v1 is appended to the base URL path
  if (!cleanBase.endsWith("/api/v1")) {
    cleanBase = `${cleanBase}/api/v1`;
  }

  const normalizedBase = cleanBase;
  const isHttpsOrigin = typeof window !== "undefined" && window.location.protocol === "https:";
  const isHttpTarget = normalizedBase.startsWith("http://");

  let requestUrl;
  
  if (isHttpsOrigin && isHttpTarget) {
    // Proxy the request through our Next.js backend to bypass browser Mixed Content (HTTPS -> HTTP) blocks
    requestUrl = new URL(window.location.origin + "/api/proxy");
    requestUrl.searchParams.set("targetUrl", `${normalizedBase}${appliedPath}`);
    if (queryObj && typeof queryObj === "object") {
      requestUrl.searchParams.set("queryObj", JSON.stringify(queryObj));
    }
  } else {
    requestUrl = new URL(`${normalizedBase}${appliedPath}`);
    if (queryObj && typeof queryObj === "object") {
      Object.entries(queryObj).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        requestUrl.searchParams.set(key, String(value));
      });
    }
  }

  const headers = { Accept: "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (!["GET", "DELETE"].includes(method) && bodyObj && Object.keys(bodyObj).length > 0) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(bodyObj);
  }

  const startedAt = performance.now();
  let response;
  try {
    response = await fetch(requestUrl.toString(), options);
  } catch (netErr) {
    console.warn("Network request failed:", netErr);
    return {
      ok: false,
      status: 0,
      elapsedMs: Math.round(performance.now() - startedAt),
      url: requestUrl.toString(),
      data: {
        message: `Failed to connect to AWS backend at ${baseUrl}. Please verify your server status or check your internet connection.`,
        error: netErr.message,
      },
    };
  }

  const elapsedMs = Math.round(performance.now() - startedAt);

  let data;
  const responseType = response.headers.get("content-type") || "";
  if (responseType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    ok: response.ok,
    status: response.status,
    elapsedMs,
    url: requestUrl.toString(),
    data,
  };
}
