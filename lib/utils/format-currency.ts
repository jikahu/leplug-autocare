export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `KSh ${rounded.toLocaleString("en-KE")}`;
}
