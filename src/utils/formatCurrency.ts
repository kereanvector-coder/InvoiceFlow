export const formatCurrency = (amountInKobo: number, currency: string = 'NGN'): string => {
  const amount = amountInKobo / 100;
  const formatted = amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  if (currency === 'NGN') {
    return `₦${formatted}`;
  }
  
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amount);
};
