import * as path from 'https://deno.land/std@0.167.0/path/mod.ts'
import { debounce } from 'https://deno.land/std@0.167.0/async/mod.ts'

const REPO_ROOT = path.dirname(path.dirname(path.fromFileUrl(import.meta.url)))
const CWD = Deno.cwd()

const WATCH_PATTERNS = [
  '{src,tasks}/**',
  'package.json',
  'pnpm-lock.json',
  'tsconfig.json',
].map((pattern) => path.globToRegExp(pattern))

// ensure we are running in the repo root
if (CWD !== REPO_ROOT) {
  console.error(`Please run this script from the repository root: ${REPO_ROOT}`)
  Deno.exit(1)
}

const build = debounce(
  () =>
    Deno.run({
      cmd: ['bin/build'],
    }).status(),
  100
)

for await (const event of Deno.watchFs('.')) {
  const shouldRebuild = event.paths.some((filePath) =>
    WATCH_PATTERNS.some((regex) =>
      regex.test(path.relative(REPO_ROOT, filePath))
    )
  )

  if (shouldRebuild) await build()
}
