import { pipe } from 'wire'
import { src, dist } from './lib/dirs.ts'
import { compile } from './lib/compile.ts'

src.read().then(pipe(compile, dist.write))
