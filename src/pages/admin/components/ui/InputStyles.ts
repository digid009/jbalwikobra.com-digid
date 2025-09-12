// Centralized reusable class strings for admin inputs & interactive controls (black/pink theme)
export const adminInputBase = "w-full px-3 py-2 border border-gray-700 rounded-2xl bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:ring-2 focus:border-pink-500";
export const adminInputWithLeftIcon = adminInputBase.replace("px-3", "pl-10 pr-4");
export const adminInputNarrow = adminInputBase.replace("px-3", "px-3"); // placeholder for potential variant

export const adminCheckboxBase = "rounded border-gray-700 text-pink-500 focus:ring-pink-500 focus:ring-2 bg-black";

// Utility to merge extra classes without duplication
export function cx(base: string, extra?: string) {
  if (!extra) return base;
  const seen = new Set<string>();
  const merged = (base + " " + extra)
    .split(/\s+/)
    .filter(Boolean)
    .filter(cls => {
      const key = cls;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(" ");
  return merged;
}
