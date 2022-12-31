const radioButtons = [
  ...document.querySelectorAll('input[name="theme"]'),
] as HTMLInputElement[]

const getRadioButton = (value: 'system'): HTMLInputElement => {
  const el = radioButtons.find((input) => input.value === value)
  if (!el) throw new Error(`Could not find radio button with value "${value}".`)
  return el
}

// update UI on startup
chrome.storage.local.get('themeOverride', (result) => {
  const value = result.themeOverride
  // console.log('initial value', value)

  getRadioButton(value).checked = true
})

// update storage when UI changes
radioButtons.forEach((input) => {
  input.addEventListener('change', () => {
    // console.log('updating from input', input, input.value)

    switch (input.value) {
      case 'system':
      case 'force_light':
      case 'force_dark':
        chrome.storage.local.set({
          themeOverride: input.value,
        })
        break

      default:
        throw new Error(`Unexpected value "${input.value}"`)
    }
  })
})

// update UI when storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  // console.log('updating from storage', changes, areaName)

  if (areaName === 'local' && changes.themeOverride) {
    getRadioButton(changes.themeOverride.newValue).checked = true
  }
})
