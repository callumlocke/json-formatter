/*
  This is intended to be run via `bin/build` or `bin/dev`.
*/

import * as colors from 'https://deno.land/std@0.153.0/fmt/colors.ts'
import * as path from 'https://deno.land/std@0.167.0/path/mod.ts'
import * as fs from 'https://deno.land/std@0.167.0/fs/mod.ts'
import * as esbuild from 'https://deno.land/x/esbuild@v0.15.16/mod.js'
import { assert } from 'https://deno.land/std@0.167.0/_util/asserts.ts'

const ENTRY_POINTS = ['src/content.ts', 'src/options/options.ts']

/** Extra files to copy from src to dist after bundling (eg manifest and icons) */
const STATIC_FILES_GLOB = 'src/**/*.{json,png,html}'

console.log('----------')
console.time('build time')

const REPO_ROOT = path.dirname(path.dirname(path.fromFileUrl(import.meta.url)))
const CWD = Deno.cwd()

// ensure we are running in the repo root
if (CWD !== REPO_ROOT) {
  console.error(`Please run this script from the repository root: ${REPO_ROOT}`)
  Deno.exit(1)
}

// empty/create dist folder
await fs.emptyDir('dist')

// build JS bundles to dist
const result = await esbuild.build({
  entryPoints: ENTRY_POINTS,
  bundle: true,
  outdir: 'dist',
  // sourcemap: 'inline',
  loader: { '.css': 'text' },
})

console.log(colors.blue('bundled'), result)

// copy static files to dist
for await (const file of fs.expandGlob(STATIC_FILES_GLOB)) {
  assert(file.isFile, `Expected this to be a file: ${file}`)

  const outputFilePath = file.path.replace('/src/', '/dist/')
  console.log(
    'copying',
    colors.yellow(path.relative(REPO_ROOT, file.path)),
    '->',
    colors.yellow(path.relative(REPO_ROOT, outputFilePath))
  )

  await fs.ensureDir(path.dirname(outputFilePath))
  await fs.copy(file.path, outputFilePath)
}

console.log(colors.green('done'))
console.timeEnd('build time')

Deno.exit(0)
