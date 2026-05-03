import html2pdf from 'html2pdf.js';
import { safeGetItem } from './storage';

export const generatePDF = async (element: HTMLElement, filename: string) => {
  const pageSize = safeGetItem('invoiceflow_pdf_page_size') || 'auto';
  const marginSetting = safeGetItem('invoiceflow_pdf_margin') || 'none';

  let margin = 0;
  let format: string | [number, number] = [element.scrollWidth, element.scrollHeight];
  let unit = 'px';

  if (pageSize === 'a4') {
    format = 'a4';
    unit = 'mm';
    if (marginSetting === 'small') margin = 10;
    else if (marginSetting === 'normal') margin = 20;
    else if (marginSetting === 'large') margin = 30;
    else margin = 0;
  } else if (pageSize === 'letter') {
    format = 'letter';
    unit = 'mm';
    if (marginSetting === 'small') margin = 10;
    else if (marginSetting === 'normal') margin = 20;
    else if (marginSetting === 'large') margin = 30;
    else margin = 0;
  } else {
    // auto
    if (marginSetting === 'small') margin = 20;
    else if (marginSetting === 'normal') margin = 40;
    else if (marginSetting === 'large') margin = 60;
    else margin = 0;
    
    if (margin > 0) {
      format = [element.scrollWidth + margin * 2, element.scrollHeight + margin * 2];
    }
  }

  const opt = {
    margin:       margin,
    filename:     filename,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false, windowWidth: element.scrollWidth },
    jsPDF:        { 
      unit: unit, 
      format: format, 
      orientation: 'portrait' as const 
    }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
