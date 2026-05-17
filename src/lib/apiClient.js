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
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const requestUrl = new URL(`${normalizedBase}${appliedPath}`);

  if (queryObj && typeof queryObj === "object") {
    Object.entries(queryObj).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      requestUrl.searchParams.set(key, String(value));
    });
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
  const response = await fetch(requestUrl.toString(), options);
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
