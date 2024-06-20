export const mergeHeaders = (
  headers: Headers,
  source: Record<string, unknown> | undefined,
): Headers => {
  if (!source) {
    return headers;
  }
  Object.entries(source).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(",") : value.toString());
    }
  });
  return headers;
};

export const exportHeaders = (headers: Headers): Record<string, string> =>
  Object.fromEntries(headers.entries());
