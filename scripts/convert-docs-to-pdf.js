#!/usr/bin/env node
/*
 * Convert all Markdown files in the `docs/` folder into PDF.
 * This script will find all `.md` files under `docs/` and render them into `docs/pdfs/` preserving folder structure.
 * It uses `npx md-to-pdf` for conversion, which will fetch the tool if not installed locally.
 */

const path = require('path');
const fsSync = require('fs');
const fs = fsSync.promises;
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const OUT_DIR = path.join(DOCS_DIR, 'pdfs');

async function findMarkdownFiles(dir) {
  const result = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip the generated pdfs directory
      if (path.basename(fullPath) === 'pdfs') continue;
      const sub = await findMarkdownFiles(fullPath);
      result.push(...sub);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(fullPath);
    }
  }
  return result;
}

function ensureDirectoryExists(filePath) {
  return fs.mkdir(filePath, { recursive: true });
}

async function renderMarkdownToPdf(srcFile, destFile) {
  // Prefer programmatic API if the package is available
  try {
    const { mdToPdf } = require('md-to-pdf');
    await mdToPdf({ path: srcFile }, { dest: destFile });
    return;
  } catch (err) {
    // fallback to CLI (local binary or npx)
  }

  return new Promise((resolve, reject) => {
    const localBin = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'md-to-pdf.cmd' : 'md-to-pdf');
    const useLocal = fsSync.existsSync(localBin);
    const cmd = useLocal ? localBin : 'npx';
    const args = useLocal ? [srcFile, '-o', destFile] : ['md-to-pdf', srcFile, '-o', destFile];
    const proc = spawn(cmd, args, { stdio: 'inherit', shell: true });

    proc.on('close', (code) => {
      if (code === 0) return resolve();
      return reject(new Error(`md-to-pdf failed with code ${code}`));
    });
    proc.on('error', (err) => reject(err));
  });
}

async function convert() {
  console.log('Searching for markdown files in:', DOCS_DIR);
  const files = await findMarkdownFiles(DOCS_DIR);
  if (!files.length) {
    console.log('No markdown files found under docs/');
    return;
  }

  await ensureDirectoryExists(OUT_DIR);

  const failures = [];
  for (const file of files) {
    // Compute relative path from docs/ and output in pdfs/
    const rel = path.relative(DOCS_DIR, file);
    const outPath = path.join(OUT_DIR, rel.replace(/\.md$/i, '.pdf'));
    const outDir = path.dirname(outPath);
    await ensureDirectoryExists(outDir);

    console.log(`Rendering ${rel} -> ${path.relative(ROOT, outPath)}`);
    try {
      await renderMarkdownToPdf(file, outPath);
      console.log('Done:', outPath);
    } catch (error) {
      console.error('Failed to render:', rel, error.message);
      failures.push({ file: rel, error: error.message });
    }
  }

  console.log('\nConversion complete.');
  if (failures.length) {
    console.log('Some files failed to convert:');
    failures.forEach((f) => console.log(` - ${f.file}: ${f.error}`));
    process.exitCode = 2;
  }
}

convert().catch((err) => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
