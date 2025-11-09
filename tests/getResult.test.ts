// @ts-types="@types/jsdom"
import { JSDOM } from 'jsdom'
import { getResult, MAX_LENGTH, type Result } from '../src/lib/getResult.ts'
import { assertObjectMatch } from '@std/assert'
import { expandGlob } from '@std/fs'

const UPDATE_SNAPSHOTS = Deno.env.has('UPDATE_SNAPSHOTS')

Deno.test(getResult.name, async (t) => {
  for await (const f of expandGlob('./tests/fixtures/*.html')) {
    const rawHtml = await Deno.readTextFile(f.path)
    const EXPECTED_COMMENT_REGEX = /<!--\s*EXPECT\s+(?<expected>[\s\S]+?)-->/
    const commentMatch = rawHtml.match(EXPECTED_COMMENT_REGEX)

    const html = rawHtml.replaceAll('{{VERY_LONG_STRING}}', () => 'A'.repeat(MAX_LENGTH + 1))
    const jsdom = new JSDOM(html)
    const { document, HTMLElement } = jsdom.window

    // patch `checkVisibility`, which is not implemented in JSDOM
    HTMLElement.prototype.checkVisibility = function() {
      return !this.hidden && this.style.display !== 'none'
    }

    const actual = getResult(document)

    let expected: Partial<Result> = {}

    if (UPDATE_SNAPSHOTS) {
      const serialized = JSON.stringify(actual, null, 2).split('\n').map(line => `  ${line}`).join('\n')
      const expectedComment = `<!--\n  EXPECT ${serialized.trimStart()}\n-->`
      const newHtml = commentMatch == null
        ? `${expectedComment}\n${rawHtml}`
        : rawHtml.replace(EXPECTED_COMMENT_REGEX, expectedComment)

      await Deno.writeTextFile(f.path, newHtml)
    } else {
      expected = JSON.parse(commentMatch!.groups!.expected)
    }

    await t.step(f.name, () => {
      assertObjectMatch(actual, expected)
    })
  }
})
