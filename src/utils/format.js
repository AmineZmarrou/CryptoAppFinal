export const formatCurrency = (value) =>
  typeof value === 'number'
    ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-';

export const formatChange = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return '-';
  }
  const sign = numeric > 0 ? '+' : '';
  return `${sign}${numeric.toFixed(2)}%`;
};

export const formatQuantity = (value) =>
  typeof value === 'number'
    ? value.toLocaleString('en-US', { maximumFractionDigits: 8 })
    : '-';

export const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '-';
