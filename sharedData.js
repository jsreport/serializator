const sharedBuffer = require('./sharedBuffer')
const { StringDecoder } = require('string_decoder')

function isSharedData (input) {
  if (
    input &&
    (Object.prototype.toString.call(input) === '[object Map]' || input.constructor === Map) &&
    input.has('content')
  ) {
    return true
  }

  return false
}

function createFrom (input, parentSharedData) {
  const inputIsSharedData = isSharedData(input)

  if (inputIsSharedData && parentSharedData == null) {
    return input
  }

  const sharedData = new Map()

  if (parentSharedData != null && isSharedData(parentSharedData)) {
    sharedData.set('content', [...parentSharedData.get('content')])
    sharedData.set('baseItem', sharedData.get('content').length)
  } else {
    sharedData.set('baseItem', 0)
    sharedData.set('content', [])
  }

  if (inputIsSharedData) {
    sharedData.set('baseItem', sharedData.get('content').length + input.get('baseItem'))
    sharedData.get('content').push(...input.get('content'))
  } else {
    sharedData.get('content').push(sharedBuffer.createFrom(input))
  }

  return sharedData
}

function getData (input) {
  let result

  if (!isSharedData(input)) {
    result = input
  } else {
    for (const [idx, item] of input.get('content').entries()) {
      const obj = sharedBuffer.decodeObj(item)

      if (idx === 0) {
        result = obj
      } else {
        Object.assign(result, obj)
      }
    }
  }

  return result
}

function contentIsArray (input) {
  if (!isSharedData(input)) {
    return Array.isArray(input)
  }

  const mainContentBuf = input.get('content')[input.get('baseItem')]

  if (mainContentBuf.length < 2) {
    return false
  }

  const lastIndex = mainContentBuf.length - 1
  let firstOffset = 0
  let lastOffset = lastIndex
  let firstCharacter
  let lastCharacter

  const notWhiteSpaceRegExp = /[^\s]/
  const firstCharDecoder = new StringDecoder('utf8')
  const lastCharDecoder = new StringDecoder('utf8')

  while (
    firstCharacter == null &&
    firstOffset <= lastIndex
  ) {
    const str = firstCharDecoder.write(mainContentBuf.slice(firstOffset, firstOffset + 1))
    const match = str.match(notWhiteSpaceRegExp)

    if (match) {
      firstCharacter = match[0]
    }

    firstOffset++
  }

  firstCharDecoder.end()

  while (
    lastCharacter == null &&
    lastOffset >= firstOffset
  ) {
    const str = lastCharDecoder.write(mainContentBuf.slice(lastOffset, lastOffset + 1))
    const match = str.match(notWhiteSpaceRegExp)

    if (match) {
      lastCharacter = match[0]
    }

    lastOffset--
  }

  lastCharDecoder.end()

  return firstCharacter === '[' && lastCharacter === ']'
}

module.exports.isSharedData = isSharedData
module.exports.createFrom = createFrom
module.exports.getData = getData
module.exports.contentIsArray = contentIsArray
