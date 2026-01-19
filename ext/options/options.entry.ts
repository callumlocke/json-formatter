import { prefStore } from '../lib/preferences/preferences'

const radioButtons = [
  ...document.querySelectorAll('input[name="theme"]'),
] as HTMLInputElement[]

const getRadioButton = (value: string): HTMLInputElement => {
  const el = radioButtons.find((input) => input.value === value)
  if (!el) throw new Error(`Could not find radio button with value "${value}".`)
  return el
}

prefStore.get().then((prefs) => {
  getRadioButton((prefs.themeOverride as string) || 'system').checked = true
})

// update storage when UI changes
{
  radioButtons.forEach((input) => {
    input.addEventListener('change', () => {
      // console.log('updating from input', input, input.value)
      const { value } = input
      switch (value) {
        case 'system':
        case 'force_light':
        case 'force_dark':
          prefStore.set({ themeOverride: value })
          break

        default:
          throw new Error(`Unexpected value "${input.value}"`)
      }
    })
  })
}

// update UI when storage changes
prefStore.onChange(({ newValue }) => {
  if (newValue?.themeOverride) {
    const radioButton = getRadioButton(newValue.themeOverride)
    radioButton.checked = true
  }
})
