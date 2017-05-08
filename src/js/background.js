'use strict';

import browser from './lib/browser';
import { listen } from './lib/messaging';
import { removeComments, firstJSONCharIndex } from './lib/utilities';
import { jsonStringToHTML } from './lib/dom-builder';

// Record current version (in case a future update wants to know)
browser.storage.local.set({appVersion: browser.runtime.getManifest().version});

// Listen for requests from content pages wanting to set up a port
listen((port, msg) => {
  let jsonpFunctionName = null;
  let validJsonText;

  if (msg.type === 'SENDING TEXT') {
    // Try to parse as JSON
    let obj;
    let text = msg.text;

    // Strip any leading garbage, such as a 'while(1);'
    const strippedText = text.substring(firstJSONCharIndex(text));

    try {
      obj = JSON.parse(strippedText);
      validJsonText = strippedText;
    } catch (e) {
      // Not JSON; could be JSONP though.
      // Try stripping 'padding' (if any), and try parsing it again
      text = text.trim();
      // Find where the first paren is (and exit if none)
      const indexOfParen = text.indexOf('(');
      if (!indexOfParen) {
        port.postMessage(['NOT JSON', 'no opening parenthesis']);
        port.disconnect();
        return;
      }

      // Get the substring up to the first "(", with any comments/whitespace stripped out
      const firstBit = removeComments(text.substring(0, indexOfParen)).trim();
      if (!firstBit.match(/^[a-zA-Z_$][\.\[\]'"0-9a-zA-Z_$]*$/)) {
        // The 'firstBit' is NOT a valid function identifier.
        port.postMessage(['NOT JSON', 'first bit not a valid function name']);
        port.disconnect();
        return;
      }

      // Find last parenthesis (exit if none)
      const indexOfLastParen = text.lastIndexOf(')');
      if (!indexOfLastParen) {
        port.postMessage(['NOT JSON', 'no closing paren']);
        port.disconnect();
        return;
      }

      // Check that what's after the last parenthesis is just whitespace, comments, and possibly a semicolon (exit if anything else)
      const lastBit = removeComments(text.substring(indexOfLastParen + 1)).trim();
      if (lastBit !== "" && lastBit !== ';') {
        port.postMessage(['NOT JSON', 'last closing paren followed by invalid characters']);
        port.disconnect();
        return;
      }

      // So, it looks like a valid JS function call, but we don't know whether it's JSON inside the parentheses...
      // Check if the 'argument' is actually JSON (and record the parsed result)
      text = text.substring(indexOfParen + 1, indexOfLastParen);
      try {
        obj = JSON.parse(text);
        validJsonText = text;
      }
      catch (e2) {
        // Just some other text that happens to be in a function call.
        // Respond as not JSON, and exit
        port.postMessage(['NOT JSON', 'looks like a function call, but the parameter is not valid JSON']);
        return;
      }

      jsonpFunctionName = firstBit;
    }

    // If still running, we now have obj, which is valid JSON.

    // Ensure it's not a number or string (technically valid JSON, but no point prettifying it)
    if (typeof obj !== 'object' && typeof obj !== 'array') {
      port.postMessage(['NOT JSON', 'technically JSON but not an object or array']);
      port.disconnect();
      return;
    }

    // And send it the message to confirm that we're now formatting (so it can show a spinner)
    port.postMessage(['FORMATTING']);

    // Do formatting
    jsonStringToHTML(validJsonText, jsonpFunctionName)
      .then(html => port.postMessage(['FORMATTED', html, validJsonText]));
  } else if (msg.type === 'GET STORED THEME') {
    browser.storage.sync.get('theme', (data) => {
      port.postMessage({type: 'STORED THEME', themeName: data && data.theme})
    });
  } else if (msg.type === 'UPDATE STORED THEME') {
    browser.storage.sync.set({theme: msg.theme}, () => {
      port.postMessage({type: 'STORED THEME', themeName: msg.theme});
    });
  }
});
