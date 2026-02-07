export function pickDefaultId(list: any[], key?: string) {
  if (!Array.isArray(list) || !list.length) return null;
  if (key) {
    const byKey = list.find((x) => x.key === key);
    if (byKey) return byKey.id;
  }
  const byDefault = list.find((x) => x.is_default);
  return byDefault?.id ?? list[0]?.id ?? null;
}

export function normalizeText(s: any) {
  return String(s ?? "").toLowerCase().trim();
}
