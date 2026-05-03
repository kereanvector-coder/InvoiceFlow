const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx'));

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace {details.isQuote && details.terms && (
  // with {details.terms && (
  content = content.replace(/\{details\.isQuote && details\.terms && \(/g, '{details.terms && (');

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Fixed terms in templates.');
