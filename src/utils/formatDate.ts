export const formatDate = (date: string | Date | number): string => {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  } catch (e) {
    return String(date);
  }
};
