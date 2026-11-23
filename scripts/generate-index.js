#!/usr/bin/env node
/**
 * Gera index.json a partir de catalog.json, calculando o SHA-256 de cada
 * extensão. Use `node scripts/generate-index.js --check` no CI para apenas
 * validar se o índice está atualizado.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const catalogPath = path.join(root, 'catalog.json');
const indexPath = path.join(root, 'index.json');
const checkOnly = process.argv.includes('--check');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const extensions = [];

for (const entry of catalog.extensions) {
  const filePath = path.join(root, entry.file);
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${entry.file}`);
    process.exit(1);
  }

  const code = fs.readFileSync(filePath);
  const sha256 = crypto.createHash('sha256').update(code).digest('hex');

  extensions.push({
    id: entry.id,
    name: entry.name,
    version: entry.version,
    file: entry.file,
    sha256,
    lang: entry.lang || 'pt-BR',
    nsfw: Boolean(entry.nsfw),
    description: entry.description || '',
    minAppVersion: entry.minAppVersion || '0.1.0',
  });
}

const index = { version: catalog.version || 1, extensions };
const generated = JSON.stringify(index, null, 2) + '\n';

if (checkOnly) {
  const current = fs.existsSync(indexPath)
    ? fs.readFileSync(indexPath, 'utf8')
    : '';
  if (current.replace(/\r\n/g, '\n') !== generated) {
    console.error('index.json desatualizado. Rode: node scripts/generate-index.js');
    process.exit(1);
  }
  console.log(`OK: ${extensions.length} extensão(ões) validada(s).`);
} else {
  fs.writeFileSync(indexPath, generated, 'utf8');
  console.log(`index.json gerado com ${extensions.length} extensão(ões).`);
}
