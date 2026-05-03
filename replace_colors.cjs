const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'src', 'components', 'templates');
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('Template.tsx'));

const primaryColors = [
  '#1E3A5F', '#C9A84C', '#0EA5E9', '#0284C7', '#7C3AED', '#6D28D9', 
  '#09090B', '#F5F5F5', '#E11D48', '#BE123C', '#2563EB', '#1D4ED8',
  '#D97706', '#B45309', '#020617', '#C2A370', '#18181B', '#F5F0E8',
  '#064E3B', '#F97316', '#EA580C', 'slate-900', 'slate-800', 'blue-600',
  'indigo-600', 'purple-600', 'rose-600', 'amber-600', 'red-600',
];

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Let's replace simple string classNames with JS template literals
  // We look for className="..."
  content = content.replace(/className="([^"]+)"/g, (match, inner) => {
    let newInner = inner;
    let modified = false;
    
    // Replace hex arrays
    primaryColors.forEach(color => {
      if (color.startsWith('#')) {
        if (newInner.includes(`bg-[${color}]`)) {
          newInner = newInner.replace(`bg-[${color}]`, `\${isReceipt ? 'bg-emerald-600' : 'bg-[${color}]'}`);
          modified = true;
        }
        if (newInner.includes(`text-[${color}]`)) {
          newInner = newInner.replace(`text-[${color}]`, `\${isReceipt ? 'text-emerald-600' : 'text-[${color}]'}`);
          modified = true;
        }
        if (newInner.includes(`border-[${color}]`)) {
          newInner = newInner.replace(`border-[${color}]`, `\${isReceipt ? 'border-emerald-600' : 'border-[${color}]'}`);
          modified = true;
        }
      } else {
        if (newInner.includes(`bg-${color}`)) {
          newInner = newInner.replace(`bg-${color}`, `\${isReceipt ? 'bg-emerald-600' : 'bg-${color}'}`);
          modified = true;
        }
        if (newInner.includes(`text-${color}`)) {
          newInner = newInner.replace(`text-${color}`, `\${isReceipt ? 'text-emerald-600' : 'text-${color}'}`);
          modified = true;
        }
        if (newInner.includes(`border-${color}`)) {
          newInner = newInner.replace(`border-${color}`, `\${isReceipt ? 'border-emerald-600' : 'border-${color}'}`);
          modified = true;
        }
      }
    });

    if (modified) {
      return `className={\`${newInner}\`}`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('Colors replaced successfully');
