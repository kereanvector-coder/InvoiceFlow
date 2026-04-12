const fs = require('fs');
const path = require('path');

const templates = [
  {
    file: 'ExecutiveTemplate.tsx',
    replacements: {
      'bg-[#F9FAFB]': 'bg-[#242424]',
      'border-[#9CA3AF]': 'border-[#C9A84C]',
      'text-[#6B7280]': 'text-[#C9A84C]',
      'text-[#111827]': 'text-[#F5F0E8]',
      'text-[#4B5563]': 'text-[#A09880]'
    }
  },
  {
    file: 'NoirTemplate.tsx',
    replacements: {
      'bg-[#F9FAFB]': 'bg-[#1A1A1A]',
      'border-[#9CA3AF]': 'border-[#C4977A]',
      'text-[#6B7280]': 'text-[#C4977A]',
      'text-[#111827]': 'text-[#F5F0E8]',
      'text-[#4B5563]': 'text-[#888888]'
    }
  },
  {
    file: 'ModernTemplate.tsx',
    replacements: {
      'bg-[#F9FAFB]': 'bg-[#1A1A1A]',
      'border-[#9CA3AF]': 'border-[#26262699]',
      'text-[#6B7280]': 'text-[#A3A3A3]',
      'text-[#111827]': 'text-[#D4D4D4]',
      'text-[#4B5563]': 'text-[#737373]'
    }
  },
  {
    file: 'TechTemplate.tsx',
    replacements: {
      'bg-[#F9FAFB]': 'bg-[#161B22]',
      'border-[#9CA3AF]': 'border-[#30363D]',
      'text-[#6B7280]': 'text-[#8B949E]',
      'text-[#111827]': 'text-[#E6EDF3]',
      'text-[#4B5563]': 'text-[#8B949E]'
    }
  }
];

const dir = path.join(__dirname, 'src/components/templates');

for (const { file, replacements } of templates) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const [key, value] of Object.entries(replacements)) {
    // Only replace within the specific blocks to avoid messing up other parts
    // We'll just replace the exact strings since they are mostly unique to these blocks in these files
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
