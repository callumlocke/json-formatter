import { tmpPath, distPath } from './lib/config.build'
import { rm } from 'node:fs/promises'

await rm(tmpPath, { recursive: true, force: true })
await rm(distPath, { recursive: true, force: true })
await rm('./.tsbuild', { recursive: true, force: true })

console.log('🫧  cleaned.')
