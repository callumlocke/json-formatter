load = ->
  chrome.storage.sync.get 'settings', (data) ->
    settings = data.settings
    console.log 'Loaded', settings if settings.debug

    $('#option-debug').prop('checked', settings.debug)
    $('#option-jsonTypes').val(settings.jsonTypes.join('\n') + '\n')
    $('#option-jsonpTypes').val(settings.jsonpTypes.join('\n') + '\n')


$ ->
  load()

  $('#save').click ->
    settings = {
      debug: $('#option-debug').is(':checked')
      jsonTypes: $('#option-jsonTypes').val().split('\n').filter((line) -> line.length)
      jsonpTypes: $('#option-jsonpTypes').val().split('\n').filter((line) -> line.length)
    }

    chrome.storage.sync.set({settings}, ->
      console.log 'Saved', settings if settings.debug
      load()
    )
