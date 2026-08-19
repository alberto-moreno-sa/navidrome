// Column count per rail variant, from the measured container width.
// Thresholds match the design handoff's breakpoint table exactly.
export const columnsFor = (variant, w) => {
  if (!w) return variant === 'wide' ? 3 : variant === 'featured' ? 6 : 8
  if (variant === 'wide') return w > 1280 ? 3 : w > 860 ? 2 : 1
  if (variant === 'featured') return w > 1280 ? 6 : w > 860 ? 4 : w > 640 ? 3 : 2
  // dense
  return w > 1600 ? 8 : w > 1080 ? 6 : w > 860 ? 4 : w > 640 ? 3 : 2
}
