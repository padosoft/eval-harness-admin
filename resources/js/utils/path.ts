export const normalizeBaseUrl = (base: string): string => {
  if (!base) {
    return '/';
  }

  return base.endsWith('/') ? base.slice(0, -1) : base;
};

export const buildUrl = (base: string, path: string): string => {
  const normalizedBase = normalizeBaseUrl(base);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (/^https?:\/\//i.test(normalizedBase)) {
    return `${normalizedBase}${normalizedPath}`;
  }

  return `${normalizedBase}${normalizedPath}`;
};
