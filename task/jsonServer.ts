import { $ } from 'bun'
import path from 'node:path'

const samplesPath = path.resolve(__dirname, '..', 'samples')

// Serves JSON (and other) samples for manually testing
export const jsonServer = async () => {
  console.log(`bunx serve -l ${8586} ${samplesPath}`)

  $`bunx serve -l ${8586} ${samplesPath}`.then(() => {
    // command doesn't work without this .then() (???)
  })
}
