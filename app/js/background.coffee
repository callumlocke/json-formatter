# chrome.runtime.onInstalled.addListener (details) ->
#   console.log 'onInstalled', details.previousVersion, details.reason

getSettings = require './get-settings'

# Get (initialised) settings first
getSettings (settings) ->

  # Update our local settings var whenever the real settings change
  chrome.storage.onChanged.addListener (changes, namespace) ->
    console.log 'onChanged', namespace, changes
    if namespace is 'sync' && changes.settings?
      settings = changes.settings.newValue

  if settings.debug
    console.log 'Main background script running.'

  queue = {}

  chrome.webRequest.onHeadersReceived.addListener(
    (details) ->
      for header in details.responseHeaders
        if header.name.toLowerCase() is 'content-type'
          mime = header.value.split(';')[0].trim()
          queue[details.tabId] = mime
          break
    ,
    {
      urls:  ['<all_urls>']
      types: ['main_frame']
    },
    ['responseHeaders']
  )

  chrome.runtime.onConnect.addListener (port) ->
    throw new Error "Unknown port name: #{port.name}" if port.name isnt 'jf'

    console.log 'Port connection from tab', port.sender.tab.id if settings.debug

    # Immediately send a message to the client page saying what its MIME type is
    tabId = port.sender.tab.id
    port.postMessage ['mime', queue[tabId], settings]
    delete queue[tabId]

    console.log 'Remaining queue', queue if settings.debug

    port.onMessage.addListener (payload) ->
      console.assert payload.length is 2, 'Payload must be array of length 2'    
      [messageType, message] = payload
      console.log "Received #{messageType} message", message if settings.debug
