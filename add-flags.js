const fs = require('fs');
const path = 'src/data/destinations.ts';
let content = fs.readFileSync(path, 'utf8');

const flags = {
    germany: '🇩🇪',
    usa: '🇺🇸',
    australia: '🇦🇺',
    canada: '🇨🇦',
    uk: '🇬🇧',
    france: '🇫🇷',
    china: '🇨🇳',
    netherlands: '🇳🇱',
    norway: '🇳🇴',
    portugal: '🇵🇹',
    austria: '🇦🇹',
    belgium: '🇧🇪',
    'south-korea': '🇰🇷',
    malaysia: '🇲🇾',
    turkey: '🇹🇷',
    latvia: '🇱🇻',
    cyprus: '🇨🇾'
};

for (const [key, flag] of Object.entries(flags)) {
    // If flag doesn't already exist for this country
    const regexStr = \`\${key}: \\{\\s*slug:.*?,\\s*name:.*?,\\s*heroImage:.*?,(?:\\s*flag:.*?,)?\\s*(hero:)\`;
    const regex = new RegExp(regexStr, 'g');
    
    // Simplest replacement based on exactly what the file looks like
    // Let's just find \`heroImage: "...",\` inside that country object, if it doesn't already have flag below it
    
    // We can split the string by \`\${key}: {\`
    const parts = content.split(new RegExp(\`(^|\\s)\${key}: \\{\`, 'm'));
    if (parts.length > 2) {
        // It found it
        const suffix = parts[2];
        // If it doesn't have a flag just after heroImage
        if (!suffix.includes('flag:')) {
            // Find heroImage: "..." and insert flag after
            parts[2] = suffix.replace(/(heroImage: .*?,)/, \`\$1\n        flag: "\${flag}",\`);
            content = parts.join('');
        }
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done mapping flags!');
