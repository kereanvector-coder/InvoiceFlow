import React from 'react';
import { Invoice } from '../store/invoiceStore';
import CorporateTemplate from './templates/CorporateTemplate';
import TechTemplate from './templates/TechTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';

interface TemplatePreviewProps {
  invoice: Invoice;
}

export default function TemplatePreview({ invoice }: TemplatePreviewProps) {
  const template = invoice.template || 'corporate';
  
  switch (template) {
    case 'modern':
      return <ModernTemplate invoice={invoice} />;
    case 'tech':
      return <TechTemplate invoice={invoice} />;
    case 'classic':
      return <ClassicTemplate invoice={invoice} />;
    case 'corporate':
    default:
      return <CorporateTemplate invoice={invoice} />;
  }
}
