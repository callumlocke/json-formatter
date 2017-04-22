import { themes } from './themes';
import { connect } from "./messaging";

const transitionStyles = require('../../sass/transition.scss');
let port, themeStyleElement, transitionStyleElement;

export function enableTheming() {
  port = connect();
  port.onMessage.addListener((message) => {
    if (message.type === 'STORED THEME') {
      switchToTheme(message.themeName);
    }
  });
  insertThemeOptionBar();
}

function insertThemeOptionBar() {
  const themeBar = document.createElement('div');
  themeBar.id = 'themeOptionBar';
  themeBar.classList.add('optionBar');

  const label = document.createElement('label');
  const select = document.createElement('select');
  label.innerText = 'Theme: ';
  select.id = 'themeSelect';
  select.innerHTML = generateOptionsHTML();

  select.addEventListener('change', () => {
    port.postMessage({type: 'UPDATE STORED THEME', theme: select.value});
    select.blur();
  });

  label.appendChild(select);
  themeBar.appendChild(label);
  document.body.insertBefore(themeBar, document.body.childNodes[0]);
  port.postMessage({type: 'GET STORED THEME'});
}

function getThemeSelect() {
  return document.getElementById('themeSelect');
}

function getThemesNestedByType() {
  return Object.keys(themes).reduce((output, key) => {
    const theme = themes[key];
    if (typeof theme === 'object') {
      output[theme.type] = output[theme.type] || [];
      output[theme.type][key] = theme;
    }
    return output;
  }, {});
}

function generateOptionsHTML() {
  const nestedThemes = getThemesNestedByType();

  return Object.keys(nestedThemes)
    .map((groupName) => {
      const themeGroup = nestedThemes[groupName];
      const groupOptions = Object.keys(themeGroup).map((key) => {
        const theme = themeGroup[key];
        return `<option value="${key}">${theme.name}</option>`;
      }).join('');

      return `<optgroup label="${groupName}">${groupOptions}</optgroup>`;
    }).join('');
}

function switchToTheme(themeName) {
  themeName = themes[themeName] ? themeName : themes.default;
  const theme = themes[themeName];
  const element = getThemeElement();

  if (element.innerHTML) {
    insertTransitionThemes();
  }
  if (element.innerHTML !== theme.styles) {
    element.innerHTML = theme.styles;
  }

  const themeSelect = getThemeSelect();
  const themeSelectOption = themeSelect && themeSelect.querySelector(`[value="${themeName}"]`);
  if (themeSelectOption) {
    themeSelectOption.selected = true;
  }
}

function getThemeElement() {
  if (!themeStyleElement) {
    themeStyleElement = document.createElement('style');
    document.head.appendChild(themeStyleElement);
  }

  return themeStyleElement;
}

function insertTransitionThemes() {
  if (!transitionStyleElement) {
    transitionStyleElement = document.createElement('style');
    transitionStyleElement.innerHTML = transitionStyles;
    document.head.appendChild(transitionStyleElement);
  }
}
