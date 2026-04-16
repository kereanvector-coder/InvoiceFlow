import html2pdf from 'html2pdf.js';

export const generatePDF = async (element: HTMLElement, filename: string) => {
  const opt = {
    margin:       0,
    filename:     filename,
    image:        { type: 'jpeg' as const, quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false, windowWidth: element.scrollWidth },
    jsPDF:        { 
      unit: 'px' as const, 
      format: [element.scrollWidth, element.scrollHeight] as [number, number], 
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
