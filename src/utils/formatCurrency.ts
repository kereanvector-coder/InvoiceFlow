export const formatCurrency = (amountInKobo: number, currency: string = 'NGN'): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
  }).format(amountInKobo / 100);
};
