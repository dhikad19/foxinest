const pad = (n) => String(n).padStart(2, "0");

export const hasTime = (s) => typeof s === "string" && s.includes("T");

export const toYMD = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "2026-01-01" -> Date lokal (bukan UTC)
export const parseYMD = (s) => {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const toDate = (s) => (hasTime(s) ? new Date(s) : parseYMD(s));

export const addDays = (s, n) => {
  const d = parseYMD(s);
  d.setDate(d.getDate() + n);
  return toYMD(d);
};
