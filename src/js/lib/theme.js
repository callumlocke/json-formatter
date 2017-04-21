export const themes = {
  ambiance: require('../../sass/themes/ambiance.scss'),
  chaos: require('../../sass/themes/chaos.scss'),
  clouds: require('../../sass/themes/clouds.scss'),
  cloudsMidnight: require('../../sass/themes/clouds-midnight.scss'),
  chrome: require('../../sass/themes/chrome.scss'),
  cobalt: require('../../sass/themes/cobalt.scss'),
  crimsonEditor: require('../../sass/themes/crimson-editor.scss'),
  dawn: require('../../sass/themes/dawn.scss'),
  dreamweaver: require('../../sass/themes/dreamweaver.scss'),
  eclipse: require('../../sass/themes/eclipse.scss'),
  github: require('../../sass/themes/github.scss'),
  gob: require('../../sass/themes/gob.scss'),
  gruvbox: require('../../sass/themes/gruvbox.scss'),
  idleFingers: require('../../sass/themes/idle-fingers.scss'),
  iplastic: require('../../sass/themes/iplastic.scss'),
  katzenMilch: require('../../sass/themes/katzen-milch.scss'),
  krTheme: require('../../sass/themes/kr-theme.scss'),
  kurior: require('../../sass/themes/kurior.scss'),
  merbivore: require('../../sass/themes/merbivore.scss'),
  merbivoreSoft: require('../../sass/themes/merbivore-soft.scss'),
  monoIndustrial: require('../../sass/themes/mono-industrial.scss'),
  monokai: require('../../sass/themes/monokai.scss'),
  pastelOnDark: require('../../sass/themes/pastel-on-dark.scss'),
  solarizedDark: require('../../sass/themes/solarized-dark.scss'),
  solarizedLight: require('../../sass/themes/solarized-light.scss'),
  sqlServer: require('../../sass/themes/sql-server.scss'),
  terminal: require('../../sass/themes/terminal.scss'),
  textmate: require('../../sass/themes/textmate.scss'),
  tomorrow: require('../../sass/themes/tomorrow.scss'),
  tomorrowNight: require('../../sass/themes/tomorrow-night.scss'),
  tomorrowNightBlue: require('../../sass/themes/tomorrow-night-blue.scss'),
  tomorrowNightBright: require('../../sass/themes/tomorrow-night-bright.scss'),
  tomorrowNightEighties: require('../../sass/themes/tomorrow-night-eighties.scss'),
  twilight: require('../../sass/themes/twilight.scss'),
  vibrantInk: require('../../sass/themes/vibrant-ink.scss'),
  xcode: require('../../sass/themes/xcode.scss'),
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
