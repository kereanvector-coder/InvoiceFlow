import React from 'react';
import { Invoice } from '../store/invoiceStore';
import CorporateTemplate from './templates/CorporateTemplate';
import TechTemplate from './templates/TechTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import ModernTemplate from './templates/ModernTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import EcommerceTemplate from './templates/EcommerceTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import WellnessTemplate from './templates/WellnessTemplate';
import TradesTemplate from './templates/TradesTemplate';
import NoirTemplate from './templates/NoirTemplate';
import EducationTemplate from './templates/EducationTemplate';
import CateringTemplate from './templates/CateringTemplate';

interface TemplatePreviewProps {
  invoice: Invoice;
  isReceipt?: boolean;
}

export default function TemplatePreview({ invoice, isReceipt }: TemplatePreviewProps) {
  const template = invoice.template || 'corporate';
  
  switch (template) {
    case 'modern':
      return <ModernTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'tech':
      return <TechTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'classic':
      return <ClassicTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'creative':
      return <CreativeTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'ecommerce':
      return <EcommerceTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'executive':
      return <ExecutiveTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'wellness':
      return <WellnessTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'trades':
      return <TradesTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'noir':
      return <NoirTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'education':
      return <EducationTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'catering':
      return <CateringTemplate invoice={invoice} isReceipt={isReceipt} />;
    case 'corporate':
    default:
      return <CorporateTemplate invoice={invoice} isReceipt={isReceipt} />;
  }
}
