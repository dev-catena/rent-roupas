#!/usr/bin/env node

/**
 * Script para atualizar cores hardcoded para usar a paleta de cores
 * Execute: node atualizar-cores.js
 */

const fs = require('fs');
const path = require('path');

const colorMap = {
  '#6366f1': 'colors.primary',
  '#fff': 'colors.white',
  '#ffffff': 'colors.white',
  '#e5e7eb': 'colors.border',
  '#6b7280': 'colors.gray',
  '#1f2937': 'colors.text',
  '#f3f4f6': 'colors.lightGray',
  '#f9fafb': 'colors.backgroundLight',
  '#374151': 'colors.darkGray',
  '#9ca3af': 'colors.textLight',
  '#fee2e2': 'colors.errorLight',
  '#dc2626': 'colors.error',
  '#fef3c7': 'colors.warningLight',
  '#92400e': 'colors.warning',
  '#e0e7ff': 'colors.accent',
};

const screensDir = path.join(__dirname, 'src/screens');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Adicionar import se não existir
  if (!content.includes("from '../../constants/colors'") && !content.includes("from '../constants/colors'")) {
    const importMatch = content.match(/import.*from ['"]\.\.\/\.\.\/contexts\/AuthContext['"]/);
    if (importMatch) {
      content = content.replace(
        importMatch[0],
        importMatch[0] + "\nimport { colors } from '../../constants/colors';"
      );
      modified = true;
    } else {
      const importMatch2 = content.match(/import.*from ['"]\.\.\/contexts\/AuthContext['"]/);
      if (importMatch2) {
        content = content.replace(
          importMatch2[0],
          importMatch2[0] + "\nimport { colors } from '../constants/colors';"
        );
        modified = true;
      }
    }
  }

  // Substituir cores
  for (const [oldColor, newColor] of Object.entries(colorMap)) {
    const regex = new RegExp(oldColor.replace('#', '\\#'), 'g');
    if (content.includes(oldColor)) {
      content = content.replace(regex, newColor);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Atualizado: ${filePath}`);
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      count += walkDir(filePath);
    } else if (file.endsWith('.js') && !file.includes('.backup')) {
      if (updateFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

console.log('🎨 Atualizando cores nos arquivos...\n');
const count = walkDir(screensDir);
console.log(`\n✅ ${count} arquivo(s) atualizado(s)!`);

