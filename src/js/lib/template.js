function createSpanWithTextAndClass(innerText, className) {
  const span = createSpan();
  span.className = className;
  span.innerText = innerText;
  return () => span.cloneNode(true);
}

function createSpanWithClass(className) {
  const span = createSpan();
  span.className = className;
  return () => span.cloneNode(true);
}

function createTextNode(text) {
  const node = document.createTextNode(text);
  return () => node.cloneNode(true);
}

export function createSpan() {
  return document.createElement('span');
}

export const Templates = {
  keyValueOrValue: createSpanWithClass('keyValueOrValue'),
  expander: createSpanWithClass('expander'),
  key: createSpanWithClass('key'),
  string: createSpanWithClass('string'),
  number: createSpanWithClass('number'),
  boolean: createSpanWithClass('bool'),
  null: createSpanWithTextAndClass('null', 'null'),

  openingBrace: createSpanWithTextAndClass('{', 'brace'),
  closingBrace: createSpanWithTextAndClass('}', 'brace'),
  openingBracket: createSpanWithTextAndClass('[', 'brace'),
  closingBracket: createSpanWithTextAndClass(']', 'brace'),

  ellipsis: createSpanWithClass('ellipsis'),
  blockInner: createSpanWithClass('blockInner'),

  colonAndSpace: createTextNode(':\u00A0'),
  commaText: createTextNode(','),
  doubleQuoteText: createTextNode('"')
};
