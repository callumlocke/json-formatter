export const themes = {
  dawn: require('../../sass/dawn.scss'),
  monokai: require('../../sass/monokai.scss'),
  default: 'dawn'
};

const transition = require('../../sass/transition.scss');
let themeElement;

export function switchToTheme(theme) {
  const element = getThemeElement();
  element.innerText = element.innerText ? theme + transition : theme;
}

function getThemeElement() {
  if (!themeElement) {
    themeElement = document.createElement('style');
    document.head.appendChild(themeElement);
  }

  return themeElement;
}
