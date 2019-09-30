import { connect } from './lib/messaging';
import { enableTheming } from './lib/theme-switcher';
import browser from "./lib/browser";

let jfContent;
let pre;
let jfStyleEl;
let slowAnalysisTimeout;

// Open the port 'jf' now, ready for when we need it
const port = connect();

// Add listener to receive response from BG when ready
port.onMessage.addListener(function(message) {
  switch (message[0]) {
    case 'NOT JSON' :
      document.documentElement.style.color = null;
      break;

    case 'FORMATTING' :
      convertPlainTextDocumentToPreIfNeeded();
      pre = document.querySelector('body > pre');
      pre.hidden = true;

      // It is JSON, and it's now being formatted in the background worker.
      enableTheming();

      // Add jfContent DIV, ready to display stuff
      jfContent = document.createElement('div');
      jfContent.id = 'jfContent';
      document.body.appendChild(jfContent);

      // Clear the slowAnalysisTimeout (if the BG worker had taken longer than 1s to respond with an answer to whether or not this is JSON, then it would have fired, unhiding the PRE... But now that we know it's JSON, we can clear this timeout, ensuring the PRE stays hidden.)
      clearTimeout(slowAnalysisTimeout);

      jfContent.innerHTML = '<p id="formattingMsg"><svg id="spinner" width="16" height="16" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" version="1.1"><path d="M 150,0 a 150,150 0 0,1 106.066,256.066 l -35.355,-35.355 a -100,-100 0 0,0 -70.711,-170.711 z" fill="#3d7fe6"></path></svg> Formatting...</p>';

      const formattingMsg = document.getElementById('formattingMsg');
      formattingMsg.hidden = true;
      setTimeout(function() {
        formattingMsg.hidden = false;
      }, 250);

      insertFormatOptionBar();

      break;

    case 'FORMATTED' :
      // Insert HTML content
      jfContent.innerHTML = message[1];
      pre.hidden = true;

      // Export parsed JSON for easy access in console
      // Only works if target page's CSP allows it
      setTimeout(function() {
        const script = document.createElement('script');
        script.innerHTML = `
          window.json=${message[2]};
          console.info("JSON Formatter: Type 'json' to inspect.");
        `;
        document.head.appendChild(script);
      }, 100);

      // Attach event handlers
      document.addEventListener('click', generalClick, false);

      break;

    default :
      throw new Error(`Message not understood: ${message[0]}`);
  }
});

function insertFormatOptionBar() {
  const formatBar = document.createElement('div');
  formatBar.id = 'formatOptionBar';
  formatBar.classList.add('optionBar');

  const buttonPlain = document.createElement('button');
  const buttonFormatted = document.createElement('button');
  buttonPlain.id = 'buttonPlain';
  buttonPlain.innerText = 'Raw';
  buttonFormatted.id = 'buttonFormatted';
  buttonFormatted.innerText = 'Parsed';
  buttonFormatted.classList.add('selected');

  buttonPlain.addEventListener('click', () => {
    pre.hidden = false;
    jfContent.hidden = true;
    buttonFormatted.classList.remove('selected');
    buttonPlain.classList.add('selected');
  });

  buttonFormatted.addEventListener('click', () => {
    pre.hidden = true;
    jfContent.hidden = false;
    buttonFormatted.classList.add('selected');
    buttonPlain.classList.remove('selected');
  });

  document.addEventListener('keyup', function(e) {
    if (e.keyCode === 37 && typeof buttonPlain !== 'undefined') {
      buttonPlain.click();
    }
    else if (e.keyCode === 39 && typeof buttonFormatted !== 'undefined') {
      buttonFormatted.click();
    }
  });

  formatBar.appendChild(buttonPlain);
  formatBar.appendChild(buttonFormatted);
  document.body.insertBefore(formatBar, pre);
}

function ready() {
  // First, check if it's plain text and exit if not
  const plainText = getTextFromTextOnlyDocument();
  if (!plainText || plainText.length > 3000000) {
    // If there is plain text and it's over 3MB, send alert
    plainText && alert('JSON Formatter Error: Cannot parse JSON larger than 3MB');
    port.disconnect();
    return;
  }

  // Hide the text immediately (until we know what to do, to prevent a flash of unstyled content)
  document.documentElement.style.color = 'transparent';
  slowAnalysisTimeout = setTimeout(function() {
    document.documentElement.style.color = null;
  }, 1000);

  // Send the text to the background script
  port.postMessage({
    type: 'SENDING TEXT',
    text: plainText
  });
}

function getTextFromTextOnlyDocument() {
  const bodyChildren = document.body.childNodes;
  const firstChild = bodyChildren[0];

  const bodyHasOnlyOneElement = document.body.childNodes.length === 1;
  const isPre = isPreElement(firstChild);
  const isPlainText = isPlainTextElement(firstChild);

  if (bodyHasOnlyOneElement && (isPre || isPlainText)) {
    return firstChild.innerText || firstChild.nodeValue;
  }
}

function convertPlainTextDocumentToPreIfNeeded() {
  if (isPlainTextDocument()) {
    const plainTextNode = document.body.childNodes[0];
    const preElement = document.createElement('pre');
    preElement.innerText = plainTextNode.nodeValue;
    document.body.appendChild(preElement);
    document.body.removeChild(plainTextNode);
  }
}

function isPlainTextDocument() {
  return document.body.childNodes.length === 1
    && isPlainTextElement(document.body.childNodes[0]);
}

function isPreElement(element) {
  return element.tagName === 'PRE';
}

function isPlainTextElement(element) {
  return element.nodeType === Node.TEXT_NODE;
}

document.addEventListener('DOMContentLoaded', ready, false);

let lastKeyValueOrValueIdGiven = 0;
function collapse(elements) {

  for (let i = elements.length - 1; i >= 0; i--) {
    let blockInner, count;
    const el = elements[i];
    el.classList.add('collapsed');

    // (CSS hides the contents and shows an ellipsis.)

    // Add a count of the number of child properties/items (if not already done for this item)
    if (!el.id) {
      el.id = `keyValueOrValue${++lastKeyValueOrValueIdGiven}`;

      // Find the blockInner
      blockInner = el.firstElementChild;
      while (blockInner && !blockInner.classList.contains('blockInner')) {
        blockInner = blockInner.nextElementSibling;
      }
      if (!blockInner) {
        continue;
      }

      // See how many children in the blockInner
      count = blockInner.children.length;

      // Generate comment text eg '4 items'
      const comment = count + (count === 1 ? ' item' : ' items');
      // Add CSS that targets it
      port.postMessage({
        type: 'INSERT CSS',
        code: `#keyValueOrValue${lastKeyValueOrValueIdGiven}.collapsed:after{content:" // ${comment}"}`
      });
    }
  }
}

function expand(elements) {
  for (let i = elements.length - 1; i >= 0; i--) {
    elements[i].classList.remove('collapsed');
  }
}

const mac = navigator.platform.indexOf('Mac') !== -1;
let modKey;
if (mac) {
  modKey = function(ev) {
    return ev.metaKey;
  };
} else {
  modKey = function(ev) {
    return ev.ctrlKey;
  };
}

function generalClick(ev) {
  if (ev.which === 1) {
    const elem = ev.target;

    if (elem.className === 'expander') {
      ev.preventDefault();

      const parent = elem.parentNode;
      const div = jfContent;
      const scrollTop = document.body.scrollTop;

      if (parent.classList.contains('collapsed')) {
        // EXPAND
        if (modKey(ev)) {
          expand(parent.parentNode.children);
        } else {
          expand([parent]);
        }
      } else {
        // COLLAPSE
        if (modKey(ev)) {
          collapse(parent.parentNode.children);
        } else {
          collapse([parent]);
        }
      }

      // Restore scrollTop somehow
      // Clear current extra margin, if any
      div.style.marginBottom = 0;

      // No need to worry if all content fits in viewport
      if (document.body.offsetHeight < window.innerHeight) {
        return;
      }

      // And no need to worry if scrollTop still the same
      if (document.body.scrollTop === scrollTop) {
        return;
      }

      // The body has got a bit shorter.
      // We need to increase the body height by a bit (by increasing the bottom margin on the jfContent div). The amount to increase it is whatever is the difference between our previous scrollTop and our new one.

      // Work out how much more our target scrollTop is than this.
      const difference = scrollTop - document.body.scrollTop + 8; // it always loses 8px; don't know why

      // Add this difference to the bottom margin
      div.style.marginBottom = difference + 'px';

      // Now change the scrollTop back to what it was
      document.body.scrollTop = scrollTop;

      return;
    }
  }
}
