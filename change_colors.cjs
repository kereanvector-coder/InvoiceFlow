const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');

const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx'));

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // We want to replace standard Tailwind color utilities like bg-blue-600, text-primary-600, etc.
  // with a conditional that outputs emerald-600 when `isReceipt` is true, otherwise the original color.
  
  // Here is a list of primary/accent tailwind classes we could try to replace, but since they vary so much by template,
  // we can use a regex to look for classNames and inject emerald classes.
  // Wait, templates might use arbitrary values `bg-[#xxxxxx]`.
  
  // Actually, a simpler way is just to add a comment or replace main hex colors conditionally.
  // For `CorporateTemplate`, the hex are `#1E3A5F` and `#C9A84C`
  // We can just replace any hex string conditionally? No, it's inside React inline classNames like `bg-[#1E3A5F]`.
  
  // Simple heuristic: let's replace things like: `bg-[#...` or `text-[#...` or `border-[#...`.
  content = content.replace(/bg-\[\#[A-Fa-f0-9]+\]/g, (match) => {
    return `\${isReceipt ? 'bg-emerald-700' : '${match}'}`;
  });
  content = content.replace(/bg-blue-[0-9]+/g, (match) => {
    return `\${isReceipt ? 'bg-emerald-700' : '${match}'}`;
  });
  content = content.replace(/bg-primary-[0-9]+/g, (match) => {
    return `\${isReceipt ? 'bg-emerald-700' : '${match}'}`;
  });

  content = content.replace(/text-\[\#[A-Fa-f0-9]+\]/g, (match) => {
    // Only replace if it's not a dark color (like #0F172A)
    const hex = match.substring(7, 13);
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    // Calculate relative luminance or simply check if it's not #111, #000, #333, #fff, #F...
    // To be safe, let's only replace known primary classes if it's text.
    return `\${isReceipt ? 'text-emerald-700' : '${match}'}`;
  });
  
  // The easiest is just finding the main div `className="..."` and if it is isReceipt, apply a generic CSS filter? No, CSS filters ruin colors.
  // We can just add a global class to the container `receipt-mode` and override colors in CSS?

});
