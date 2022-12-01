export const formatNumber = (value: number) => {
  return new Intl.NumberFormat("sk-SK", { minimumFractionDigits: 2 }).format(value);
};
