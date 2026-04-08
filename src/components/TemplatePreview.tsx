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
    case 'creative':
      return <CreativeTemplate invoice={invoice} />;
    case 'ecommerce':
      return <EcommerceTemplate invoice={invoice} />;
    case 'executive':
      return <ExecutiveTemplate invoice={invoice} />;
    case 'wellness':
      return <WellnessTemplate invoice={invoice} />;
    case 'trades':
      return <TradesTemplate invoice={invoice} />;
    case 'noir':
      return <NoirTemplate invoice={invoice} />;
    case 'education':
      return <EducationTemplate invoice={invoice} />;
    case 'catering':
      return <CateringTemplate invoice={invoice} />;
    case 'corporate':
    default:
      return <CorporateTemplate invoice={invoice} />;
  }
}
