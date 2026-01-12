import WebSocket, { WebSocketServer } from 'ws'
import { watch } from 'fs'
import { build } from './lib/build'
import { DEV, extPath } from './lib/config.build'
import { jsonServer } from './jsonServer'

// autoreload notification server
const wss = DEV ? new WebSocketServer({ port: 8585 }) : null

// Also run a file server for testing things in dev
jsonServer()

watch(extPath, { recursive: true }, async (event, file) => {
  console.log(`${event}: ./src/${file}`)
  await build()

  // notify any locally running extension worker that's connected
  if (wss)
    for (const client of wss.clients)
      if (client.readyState === WebSocket.OPEN) client.send('reload_extension')
})

// initial build
await build()
