import chalk from 'chalk'
import path from 'path'

// Build env
export const DEV = process.env.NODE_ENV !== 'production'
export const SOURCE_MAPS = process.env.SOURCE_MAPS
  ? process.env.SOURCE_MAPS !== 'false'
  : DEV
export const MINIFY = process.env.MINIFY ? process.env.MINIFY !== 'false' : !DEV
export const PERFMARKS = process.env.PERFMARKS
  ? process.env.PERFMARKS !== 'false'
  : DEV

export const GIVEFREELY_ID = process.env.GIVEFREELY_ID ?? null

// Directories
export const repoRoot = path.resolve(__dirname, '..', '..')
export const extPath = path.join(repoRoot, 'ext')
export const distPath = path.join(repoRoot, 'dist')
export const tmpPath = path.join(repoRoot, 'tmp')

//////

console.log(
  chalk.gray(
    `Build env:`,
    Object.entries({
      NODE_ENV: process.env.NODE_ENV,
      DEV,
      SOURCE_MAPS,
      MINIFY,
      PERFMARKS,
    })
      .map(([name, value]) => `${name}=${chalk.white(value)}`)
      .join(', '),
  ),
  '\n',
)
