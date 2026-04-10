const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx'));

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Imports
  if (!content.includes('Quotation')) {
    content = content.replace(
      "import { Invoice } from '../../store/invoiceStore';",
      "import { Invoice } from '../../store/invoiceStore';\nimport { Quotation } from '../../store/quotationStore';\nimport { getDocumentDetails } from '../../utils/documentUtils';"
    );
  }

  // 2. Props
  content = content.replace(
    /export default function (\w+)Template\(\{ invoice \}: \{ invoice: Invoice \}\) \{/,
    "export default function $1Template({ invoice }: { invoice: Invoice | Quotation }) {"
  );

  // 3. Extract details
  if (!content.includes('const details = getDocumentDetails(invoice);')) {
    content = content.replace(
      /const \{ business_snapshot: business, items \} = invoice;/,
      "const { business_snapshot: business, items } = invoice;\n  const details = getDocumentDetails(invoice);"
    );
  }

  // 4. Replace INVOICE
  content = content.replace(/>INVOICE</g, ">{details.documentTypeLabel}<");
  content = content.replace(/>Invoice</g, ">{details.documentTypeLabel}<");
  content = content.replace(/>PROFESSIONAL SERVICES INVOICE</g, ">PROFESSIONAL SERVICES {details.documentTypeLabel}<");
  content = content.replace(/Invoice Date:/g, "Date:");

  // 5. Replace invoice_number
  content = content.replace(/invoice\.invoice_number/g, "details.documentNumber");

  // 6. Replace Due Date
  content = content.replace(/Due Date:/g, "{details.dateLabel}:");
  content = content.replace(/>Due Date</g, ">{details.dateLabel}<");
  content = content.replace(/>DUE DATE</g, ">{details.dateLabel.toUpperCase()}<");
  
  // 7. Replace due_date
  content = content.replace(/invoice\.due_date/g, "details.dateValue");

  // 8. Replace Total Due
  content = content.replace(/>Total Due</g, ">{details.amountLabel}<");
  content = content.replace(/>TOTAL DUE</g, ">{details.amountLabel.toUpperCase()}<");
  content = content.replace(/>Amount Due</g, ">{details.amountLabel}<");
  content = content.replace(/>AMOUNT DUE</g, ">{details.amountLabel.toUpperCase()}<");
  
  // 9. Add Project Title Block and Terms Block
  // We'll insert it before the items mapping.
  // We can look for `items.map` and insert before its parent.
  // Actually, let's just do the text replacements.
  
  fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Templates updated');
