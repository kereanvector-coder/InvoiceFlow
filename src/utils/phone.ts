export const cleanPhoneForWhatsApp = (phone: string): string => {
  if (!phone) return '';
  // 1. Remove ALL non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // 2. If number starts with "0" -> replace leading "0" with "234"
  if (cleaned.startsWith('0')) {
    cleaned = '234' + cleaned.substring(1);
  }
  
  // 3. If number starts with "234" already -> keep as is
  // 4. Result should be digits only
  return cleaned;
};
