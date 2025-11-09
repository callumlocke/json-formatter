import * as pathUtil from 'std/path/mod.ts'
import {
  createMatcher,
  Matchable,
  subset,
  tmp,
  Transform
  } from 'wire'

// HACK esbuild wire plugin using tmp - better to use esbuild's plugin API providing custom resolver and loader to avoid tmp files
export const esbuild = ({
  filter = '**/*.{ts,js,jsx,tsx}',
  entry = '**/*.entry.ts',
  rename = (name: string) => name.replace(/\.entry\.ts$/, '.js'),
  minify = false,
  sourceMap = false,
  tmpRoot,
}: {
  filter?: Matchable
  entry?: Matchable

  /** Function to rename entry filenames in the output - defaults to a function that removes `.entry` and replaces extension with `.js` */
  rename?: (name: string) => string

  minify?: boolean
  sourceMap?: boolean
  tmpRoot?: string
}): Transform => {
  const match = createMatcher(filter)
  const matchEntry = createMatcher(entry)

  return subset(
    match,
    tmp(async (input, output) => {
      const files = await input.read()
      const entryFileNames = Object.keys(files).filter(matchEntry)

      // compile each entry file with esbuild
      await Promise.all(
        entryFileNames.map(async (entryFile) => {
          const cmd = [
            './node_modules/.bin/esbuild',
            '--bundle',
            pathUtil.join(input.path, entryFile),
            '--outfile=' + pathUtil.join(output.path, rename(entryFile)),
          ]
          if (minify) cmd.push('--minify')
          if (sourceMap) cmd.push('--sourcemap')

          const command = new Deno.Command(cmd.shift(), {
            args: cmd,
            cwd: tmpRoot || Deno.cwd(),
            // env: { ...Deno.env.toObject() },
          })

          const child = await command.spawn()
          const result = await child.status
          if (!result.success) throw new Error('compile failed')
          await Promise.resolve()
        })
      )
    }, tmpRoot)
  )
}
