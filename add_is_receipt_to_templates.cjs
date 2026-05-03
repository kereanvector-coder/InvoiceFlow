const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');

const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx'));

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Change props: { invoice: Invoice | Quotation } to { invoice: Invoice | Quotation, isReceipt?: boolean }
  content = content.replace(
    /({ invoice }: { invoice: Invoice \| Quotation })/,
    '{ invoice, isReceipt }: { invoice: Invoice | Quotation, isReceipt?: boolean }'
  );

  // Change getDocumentDetails(invoice) to getDocumentDetails(invoice, isReceipt)
  content = content.replace(
    /getDocumentDetails\(invoice\)/g,
    'getDocumentDetails(invoice, isReceipt)'
  );

  // Replace invoice.status with (isReceipt ? 'PAID IN FULL' : invoice.status)
  // Only where we see {invoice.status} or invoice.status ...
  // Actually, we can add a helper or just let the templates be updated safely.
  // Many templates use {invoice.status}
  content = content.replace(
    /\{invoice\.status\}/g,
    '{isReceipt ? "PAID IN FULL" : invoice.status}'
  );
  
  // Also we want color accent in receipt mode to be green/emerald. 
  // For now, let's just make sure the templates compile with the extra isReceipt prop and update the status UI.

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Templates updated with isReceipt prop');
