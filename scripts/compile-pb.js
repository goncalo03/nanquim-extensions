#!/usr/bin/env node
/**
 * Compila uma extensão .js para o formato .pb (Protocol Buffers) do Nanquim.
 *
 * Uso: node scripts/compile-pb.js extensions/minha-fonte.js
 * Saída: extensions/minha-fonte.pb
 */
const fs = require('fs');
const path = require('path');

function varint(value) {
  const bytes = [];
  let v = value >>> 0;
  while ((v & ~0x7f) !== 0) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v);
  return Buffer.from(bytes);
}

function fieldString(number, value) {
  const data = Buffer.from(value || '', 'utf8');
  if (data.length === 0) return Buffer.alloc(0);
  return Buffer.concat([varint((number << 3) | 2), varint(data.length), data]);
}

function fieldBool(number, value) {
  return Buffer.concat([varint(number << 3), varint(value ? 1 : 0)]);
}

function meta(source, key, fallback = '') {
  const start = source.indexOf('globalThis.__nanquimExtension');
  const block = start === -1 ? source : source.slice(start);
  const match = block.match(new RegExp('\\b' + key + ":\\s*['\"]([^'\"]+)['\"]"));
  return match ? match[1] : fallback;
}

const input = process.argv[2];
if (!input) {
  console.error('Uso: node scripts/compile-pb.js <arquivo.js>');
  process.exit(1);
}

const resolved = path.resolve(input);
const source = fs.readFileSync(resolved, 'utf8');
const baseMatch = source.match(/const\s+baseUrl\s*=\s*['"]([^'"]+)['"]/);
const nsfwMatch = source.match(/\bnsfw\s*:\s*(true|false)/);

const extension = {
  id: meta(source, 'id'),
  name: meta(source, 'name'),
  version: meta(source, 'version', '1.0.0'),
  lang: meta(source, 'lang', 'pt-BR'),
  baseUrl: baseMatch ? baseMatch[1] : '',
  code: source,
  nsfw: nsfwMatch ? nsfwMatch[1] === 'true' : false,
  format: 'js',
};

if (!extension.id) {
  console.error('Não foi possível encontrar o id da extensão.');
  process.exit(1);
}

const output = Buffer.concat([
  fieldString(1, extension.id),
  fieldString(2, extension.name),
  fieldString(3, extension.version),
  fieldString(4, extension.lang),
  fieldString(5, extension.baseUrl),
  fieldString(6, extension.code),
  fieldBool(7, extension.nsfw),
  fieldString(8, extension.format),
]);

const target = resolved.replace(/\.js$/i, '.pb');
fs.writeFileSync(target, output);
console.log(`${path.basename(target)} gerado (${extension.id} v${extension.version}, ${output.length} bytes).`);
