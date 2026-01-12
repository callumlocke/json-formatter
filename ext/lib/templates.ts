const baseSpan = document.createElement('span')

export const createBlankSpan = () =>
  baseSpan.cloneNode(false) as HTMLSpanElement

const getSpanWithClass = (className: string) => {
  const span = createBlankSpan()
  span.className = className
  return span
}

const getSpanWithBoth = (innerText: string, className: string) => {
  const span = createBlankSpan()
  span.className = className
  span.innerText = innerText
  return span
}

export const templates = {
  t_entry: getSpanWithClass('entry'),
  t_exp: getSpanWithClass('e'),
  t_key: getSpanWithClass('k'),
  t_string: getSpanWithClass('s'),
  t_number: getSpanWithClass('n'),

  t_null: getSpanWithBoth('null', 'nl'),
  t_true: getSpanWithBoth('true', 'bl'),
  t_false: getSpanWithBoth('false', 'bl'),

  t_oBrace: getSpanWithBoth('{', 'b'),
  t_cBrace: getSpanWithBoth('}', 'b'),
  t_oBracket: getSpanWithBoth('[', 'b'),
  t_cBracket: getSpanWithBoth(']', 'b'),

  t_sizeComment: getSpanWithClass('sizeComment'),

  t_ellipsis: getSpanWithClass('ell'),
  t_blockInner: getSpanWithClass('blockInner'),

  t_colonAndSpace: document.createTextNode(':\u00A0'),
  t_commaText: document.createTextNode(','),
  t_dblqText: document.createTextNode('"'),
}
