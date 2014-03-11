Promise = require 'bluebird'
assign = require 'lodash.assign'

defaults =
  debug: false
  jsonTypes: ['application/json', 'text/json']
  jsonpTypes: ['application/javascript', 'text/javascript']

module.exports = ->
  if not promise?
    promise = new Promise (resolve) ->

      chrome.storage.sync.get 'settings', (data) ->
        console.log 'old settings', data.settings
        settings = {}

        for own key, value of defaults
          settings[key] = (if data.settings[key]? then data.settings[key] else value)

        chrome.storage.sync.set {settings: settings}, ->
          if settings.debug
            console.log 'Settings initialised', settings
          resolve()

  promise
