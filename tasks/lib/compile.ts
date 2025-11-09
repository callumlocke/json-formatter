import { subset, Transform } from 'wire'
import { esbuild } from './esbuild.ts'

export const compile: Transform = subset(
  '**/*.{ts,css}',

  esbuild({
    filter: '**/*.{ts,css}',
    minify: true,
  })
)
