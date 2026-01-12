import type { GiveFreelyService } from '@givefreely/library/background'
import { GIVEFREELY_ID } from '../lib/config.browser'
import invariant from 'tiny-invariant'

let service: GiveFreelyService | null = null

export const initGfBackground = GIVEFREELY_ID
  ? async () => {
      if (!service) {
        console.log('GF: instantiating')
        const gf = await import('@givefreely/library/background')
        invariant(GIVEFREELY_ID)
        service = new gf.GiveFreelyService(GIVEFREELY_ID)
      }

      console.log('GF: initializing')
      await service.initialize()
      console.log('GF: initialized')
    }
  : () => {}

export const disableGfBackground = async () => {
  if (service) {
    console.log('GF: destroying')
    const _service = service
    service = null

    await _service.destroy()
    console.log('GF: destroyed')
  }
}
