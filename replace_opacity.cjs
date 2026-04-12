const fs = require('fs');
const path = require('path');

const replacements = {
  'text-white/70': 'text-[#FFFFFFB3]',
  'text-white/60': 'text-[#FFFFFF99]',
  'text-white/80': 'text-[#FFFFFFCC]',
  'bg-white/30': 'bg-[#FFFFFF4D]',
  'bg-[#C9A84C]/30': 'bg-[#C9A84C4D]',
  'border-[#C9A84C]/40': 'border-[#C9A84C66]',
  'bg-[#238636]/10': 'bg-[#2386361A]',
  'text-[#10B981]/80': 'text-[#10B981CC]',
  'border-[#262626]/60': 'border-[#26262699]',
  'border-[#262626]/50': 'border-[#26262680]'
};

const dir = path.join(__dirname, 'src/components/templates');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [key, value] of Object.entries(replacements)) {
    // Replace whole words to avoid partial matches
    // Since keys contain brackets and slashes, we need to escape them
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, value);
      modified = true;
    } else if (content.includes(key)) {
      // Fallback to simple string replacement if regex fails due to word boundaries
      content = content.split(key).join(value);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
