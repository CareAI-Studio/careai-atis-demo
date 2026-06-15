export function formatNumber(value) {
  return new Intl.NumberFormat("cs-CZ").format(value);
}