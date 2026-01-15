import { $, Glob, type BuildConfig } from 'bun'
import path from 'path'
import {
  DEV,
  SOURCE_MAPS,
  tmpPath,
  extPath,
  repoRoot,
  distPath,
  PERFMARKS,
  GIVEFREELY_ID,
} from './config.build'
import { singleFile } from './singleFile'
import { rm, rename } from 'fs/promises'
import { cp } from 'fs/promises'
import { readFile } from 'fs/promises'
import { outputReport } from './outputReport'

export const build = singleFile(async () => {
  if (process.cwd() !== repoRoot) {
    console.error('Build must be run from repo root!')
    return
  }

  // src -> tmp (compile TS, copy the rest)
  {
    const consoleBundle = 'content/console.entry.ts'

    const [entrypoints] = await Promise.all([
      // Glob TS entries
      Array.fromAsync(new Glob('**/*.entry.{ts,tsx}').scan(extPath)).then(
        (arr) =>
          arr
            .filter((name) => name !== consoleBundle)
            .map((f) => path.join(extPath, f)),
      ),

      // Wipe tmp
      rm(tmpPath, { recursive: true, force: true }),
    ])

    const buildOpts: BuildConfig = {
      entrypoints,
      root: extPath,
      outdir: tmpPath,
      env: 'inline',
      define: {
        $PERFMARKS: JSON.stringify(PERFMARKS),
        $GIVEFREELY_ID: JSON.stringify(GIVEFREELY_ID),
      },
      // external: ['../vendor/gf-worker.js'],
      minify: true,
      sourcemap: SOURCE_MAPS ? 'linked' : false,
      tsconfig: 'tsconfig.json',
    }

    await Promise.all([
      // Bundle TypeScript entrypoints into tmp
      Bun.build(buildOpts),
      // Do console bundle separately in IIFE mode as it's got `"world": "MAIN"`
      Bun.build({
        ...buildOpts,
        entrypoints: [path.join(extPath, consoleBundle)],
        format: 'iife',
      }),

      // Generate .d.ts files for all modules
      $`./node_modules/.bin/tsc -p ./tsconfig.json --outDir tmp`,

      // Copy other files over
      cp(extPath, tmpPath, {
        recursive: true,
        filter: (source) =>
          !/\.tsx?$/.test(source) &&
          (!source.endsWith('.css') ||
            [
              // 'content/style.css',
              'options/options.css',
              // 'global.css',
            ].some((file) => source.endsWith(file))),
      }),
    ])
  }

  // Mutate files in tmp
  {
    // First steps: wrap bundles etc
    await Promise.all([
      // Wrap bundles to make them idempotent and optionally add perf marks
      (async () => {
        const promises: Promise<void>[] = []

        for await (const script of new Glob('**/*.entry.js').scan(tmpPath)) {
          promises.push(
            (async () => {
              const filePath = path.join(tmpPath, script)
              let code = await readFile(filePath, 'utf-8')
              const jfContext = script.replace(/\.entry\.js$/, '')

              let header = ''
              if (DEV)
                header += `if (globalThis['__jf_context']) throw new Error('Content script ran more than once'); `
              header += `globalThis['__jf_context'] = ${JSON.stringify(jfContext)}; `

              code = `${header}${code}`

              if (PERFMARKS)
                code = `performance.mark('SCRIPT_PARSE_START'); ${code}\nperformance.mark('SCRIPT_PARSE_END');`

              await Bun.write(filePath, code)
            })(),
          )
        }

        await Promise.all(promises)
      })(),

      SOURCE_MAPS &&
        (async () => {
          // TODO add 'web_accessible_resources' to manifest if SOURCEMAPS
          /*
                ,
          "web_accessible_resources": [
            {
              "resources": ["*.map"],
              "matches": ["<all_urls>"]
            }
          ]*/
        })(),
    ])

    // rename bundles etc
    {
      for await (const bundledEntry of new Glob('**/*.entry.js').scan(
        tmpPath,
      )) {
        const oldBundleName = path.join(tmpPath, bundledEntry)
        const newBundleName = oldBundleName.replace(/\.entry\.js/, '.js')

        await rename(oldBundleName, newBundleName)

        // also fix sourcemap comment URI inside just-renamed file
        if (SOURCE_MAPS) {
          const newMapNameForUri = newBundleName
            .substring(tmpPath.length)
            .replace(/\.js$/, '.entry.js.map')

          const jsLines = (await Bun.file(newBundleName).text()).split('\n')

          await Bun.write(
            newBundleName,
            jsLines
              .map((line) =>
                line.startsWith('//# sourceMappingURL=')
                  ? `//# sourceMappingURL=${newMapNameForUri}`
                  : line,
              )
              .join('\n'),
          )
        }
      }
    }

    // compiled tailwind based on the final optimised tmp
    await Promise.all(
      [
        // just options for now
        [`${tmpPath}/options`, 'options.css'],
      ].map(([cwd, file]) =>
        $`./node_modules/.bin/tailwindcss --cwd ${cwd} -i ./${file} -o ./${file}-compiled`.then(
          () => rename(`${cwd}/${file}-compiled`, `${cwd}/${file}`),
        ),
      ),
    )
  }

  // tmp -> dist
  {
    // Start scanning files in tmp
    const neededTmpFiles = new Glob(`**/*.{js,css,html,json,map,png}`).scan(
      tmpPath,
    )

    // Wipe dist
    await rm(distPath, { force: true, recursive: true })

    // Selectively copy over the files we need
    const addfile = async (file: string) => {
      console.log('addFile', file)
      if (file.endsWith('.max.js')) return
      if (file === 'externs.js') return
      if (file.endsWith('tsconfig.json')) return
      if (file.endsWith('.map.json')) throw new Error('Unexpected:' + file)

      const pathInTmp = path.resolve(tmpPath, file)
      const pathInDist = path.resolve(
        distPath,
        file,
        // file.endsWith('.js.map')
        //   ? file.replace(/\.js\.map$/, '.map.json')
        //   : file,
      )

      await cp(pathInTmp, pathInDist, {
        recursive: true,
        errorOnExist: true,
      })
    }
    const copies = []
    for await (const file of neededTmpFiles) copies.push(addfile(file))

    await Promise.all(copies)

    // finally, modify manifest to highlight if this is a dev build
    if (DEV) {
      const distManifestFile = Bun.file(path.join(distPath, 'manifest.json'))
      const manifest = await distManifestFile.json()
      manifest.name = `🚧 ${manifest.name} 🚧`
      manifest.version_name = `DEV.${(await $`bun run checksum`.text()).trim().substring(0, 8)}`
      await distManifestFile.write(JSON.stringify(manifest, null, 2) + '\n')
    }
  }

  // Report dist file sizes
  await outputReport()
})
