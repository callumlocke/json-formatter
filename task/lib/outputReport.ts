import { Glob } from 'bun'
import { distPath, repoRoot } from './config.build'
import path from 'node:path'
import { stat } from 'node:fs/promises'
import type { Stats } from 'node:fs'
import chalk from 'chalk'

export const outputReport = async () => {
  const promises = new Map<string, Promise<void>>()
  const results = new Map<string, Stats>()

  for await (const file of new Glob('**/*').scan(distPath)) {
    const fullPath = path.resolve(distPath, file)
    promises.set(
      fullPath,
      stat(fullPath).then((stats) => {
        results.set(fullPath, stats)
      }),
    )
  }

  let nodeEnv = process.env.NODE_ENV || 'development'
  if (nodeEnv) nodeEnv = chalk.blue(nodeEnv)
  else nodeEnv = chalk.red(nodeEnv)

  console.log('\n')
  console.log(
    chalk.yellowBright.bold.underline('JSON Formatter build'),
    `${chalk.gray('(NODE_ENV=')}${nodeEnv})`,
  )
  console.log('\n')

  await Promise.all(promises.values())

  console.table(
    [...results.entries()]
      .sort((a, b) => b[1]!.size - a[1]!.size)
      .map(([file, stats]) => {
        let File = path.relative(repoRoot, file)
        let Size = `${(stats.size / 1024).toFixed(3)} KB`.padStart(20)

        if (File.endsWith('.js')) {
          File = chalk.yellow(File)
          Size = chalk.yellow(Size)
        }

        return { File, Size }
      }),
  )
}
