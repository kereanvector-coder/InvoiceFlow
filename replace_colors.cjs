const fs = require('fs');
const path = require('path');

const replacements = {
  'text-gray-400': 'text-[#9CA3AF]',
  'text-gray-500': 'text-[#6B7280]',
  'text-gray-600': 'text-[#4B5563]',
  'text-gray-900': 'text-[#111827]',
  'text-red-400': 'text-[#F87171]',
  'text-emerald-400': 'text-[#34D399]',
  'text-emerald-500': 'text-[#10B981]',
  'text-neutral-200': 'text-[#E5E5E5]',
  'text-neutral-300': 'text-[#D4D4D4]',
  'text-neutral-400': 'text-[#A3A3A3]',
  'text-neutral-500': 'text-[#737373]',
  'bg-emerald-500/20': 'bg-[#10B98133]',
  'border-emerald-500/30': 'border-[#10B9814D]',
  'bg-emerald-500/10': 'bg-[#10B9811A]',
  'border-emerald-500/20': 'border-[#10B98133]',
  'bg-red-500/20': 'bg-[#EF444433]',
  'border-red-500/30': 'border-[#EF44444D]',
  'bg-neutral-800': 'bg-[#262626]',
  'border-neutral-700': 'border-[#404040]',
  'border-neutral-800': 'border-[#262626]',
  'text-emerald-500/80': 'text-[#10B981CC]',
  'bg-gray-50': 'bg-[#F9FAFB]',
  'border-gray-400': 'border-[#9CA3AF]',
  'border-neutral-300': 'border-[#D4D4D4]'
};

const dir = path.join(__dirname, 'src/components/templates');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [key, value] of Object.entries(replacements)) {
    // Replace whole words to avoid partial matches
    const regex = new RegExp(`\\b${key.replace(/\//g, '\\/')}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, value);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
