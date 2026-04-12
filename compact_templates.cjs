const fs = require('fs');
const path = require('path');

const replacements = {
  'py-9': 'py-5',
  'py-8': 'py-4',
  'py-6': 'py-3',
  'py-5': 'py-3',
  'py-4': 'py-2',
  'p-8': 'p-4',
  'p-7': 'p-4',
  'p-6': 'p-4',
  'p-5': 'p-3',
  'px-8': 'px-5',
  'px-7': 'px-5',
  'px-6': 'px-4',
  'mb-8': 'mb-4',
  'mb-6': 'mb-3',
  'mb-5': 'mb-3',
  'mt-8': 'mt-4',
  'mt-6': 'mt-3',
  'mt-5': 'mt-3',
  'text-[48px]': 'text-[32px]',
  'text-[52px]': 'text-[32px]',
  'text-[42px]': 'text-[28px]',
  'text-[36px]': 'text-[28px]',
  'text-[24px]': 'text-[20px]',
  'text-[22px]': 'text-[18px]',
  'text-[18px]': 'text-[16px]',
  'text-4xl': 'text-2xl',
  'text-3xl': 'text-xl',
  'text-2xl': 'text-lg',
  'text-xl': 'text-base',
  'gap-8': 'gap-4',
  'gap-6': 'gap-3',
  'gap-4': 'gap-2',
  'space-y-6': 'space-y-3',
  'space-y-4': 'space-y-2',
  'space-y-3': 'space-y-1.5'
};

const dir = path.join(__dirname, 'src/components/templates');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [key, value] of Object.entries(replacements)) {
    if (content.includes(key)) {
      content = content.split(key).join(value);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
