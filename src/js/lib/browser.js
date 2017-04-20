'use strict';

export default {
  get runtime() {
    return getBrowser().runtime;
  },
  get storage() {
    return getBrowser().storage;
  }
};

function getBrowser() {
  return typeof browser !== 'undefined' ? browser : chrome;
}
