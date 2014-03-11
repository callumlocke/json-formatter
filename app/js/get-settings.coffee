setDefaults = require './set-defaults'

defaults =
  debug: false

module.exports = (callback) ->
  setDefaults().then ->
    chrome.storage.sync.get 'settings', (data) ->
      callback(data.settings)
