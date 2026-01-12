import { initializeAdUnit as giveFreelyInitContent } from '@givefreely/library'
import { GIVEFREELY_ID } from '../lib/config.browser'

export const initGfContent = GIVEFREELY_ID
  ? async () => {
      giveFreelyInitContent()
    }
  : () => {}
