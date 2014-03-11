startTime = Date.now()

mime = null
settings = null

logTime = (msg) ->
  console.log "#{Date.now() - startTime}ms - #{msg}"

Deferred = require('simply-deferred').Deferred
gotMime = new Deferred

# Establish port with background page
port = chrome.runtime.connect name: 'jf'

# Listen for messages from background page
port.onMessage.addListener (msg) ->
  console.log 'Got message', msg

  [messageType, messageBody] = msg

  switch msg[0]
    when 'mime'
      mime = msg[1]
      settings = msg[2]
      console.assert mime?, 'Got MIME type'
      console.assert settings?, 'Got settings'
      logTime "Got MIME: #{mime}" if settings.debug
      console.log 'Got settings', settings if settings.debug
      gotMime.resolve()

    when 'formatting'
      todo()
      format = messageBody

    when 'invalid'
      # The background page didn't like what we sent it (in combination with the MIME type we specified).
      todo()

    when 'formatted'
      todo()

    else
      throw new Error "JSON Formatter: Unknown message type from background script: #{messageType}"

# Functions for showing/hiding the page as needed
hiddenPage = false
hidePage = ->
  document.body.style.display = 'none'
  hiddenPage = true
unhidePage = ->
  if hiddenPage
    document.body.style.display = null
    hiddenPage = false

# Wait for the DOM to be ready
document.addEventListener 'DOMContentLoaded', (event) ->
  logTime 'DOM ready'

  # See if there's a 'body>pre' (indicating it's probably a text page)
  pre = document.querySelector 'body>pre'

  if pre?
    # Hide the body to prevent FOUC
    logTime '<pre> element found; possibly a text page'
    hidePage()

    # Automatically unhide the page if it's hidden for ages
    setTimeout ->
      if hiddenPage
        console.log 'JSON Formatter: Unhiding page due to long wait'
        unhidePage()
    , 1000

    # Wait until we have the MIME type back
    gotMime.then ->
      if settings.jsonTypes.indexOf(mime) != -1
        console.log "It is JSON (#{mime})" if settings.debug
        unhidePage()

      else if settings.jsonpTypes.indexOf(mime) != -1
        console.log "It is possibly JSONP (#{mime})" if settings.debug
        unhidePage()

      else
        console.log "Neither JSON nor JSONP (#{mime})" if settings.debug
        unhidePage()
