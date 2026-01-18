#!/usr/bin/env node

/**
 * Script para corrigir erros de sintaxe de cores
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Corrigir erros comuns
  const fixes = [
    // Corrigir color=colors.xxx" para color={colors.xxx}
    [/(\w+)=colors\.(\w+)"?/g, '$1={colors.$2}'],
    // Corrigir color="colors.xxx" para color={colors.xxx}
    [/color="colors\.(\w+)"/g, 'color={colors.$1}'],
    [/backgroundColor="colors\.(\w+)"/g, 'backgroundColor={colors.$1}'],
    // Corrigir colors.whitefff para colors.white
    [/colors\.whitefff/g, 'colors.white'],
  ];

  fixes.forEach(([pattern, replacement]) => {
    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigido: ${filePath}`);
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
      if (fixFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

console.log('🔧 Corrigindo erros de sintaxe de cores...\n');
const count = walkDir(path.join(__dirname, 'src/screens'));
console.log(`\n✅ ${count} arquivo(s) corrigido(s)!`);

