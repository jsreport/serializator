const serializator = require('./')
const { StringDecoder } = require('string_decoder')

function isBinaryInput (input) {
  return (
    Buffer.isBuffer(input) ||
    (input != null && (Object.prototype.toString.call(input) === '[object Uint8Array]' || input.constructor === Uint8Array))
  )
}

function createFrom (input) {
  if (typeof input === 'string') {
    const sharedBuf = new SharedArrayBuffer(Buffer.byteLength(input))
    const dataBuf = Buffer.from(sharedBuf)

    dataBuf.write(input)

    return dataBuf
  } else if (isBinaryInput(input)) {
    if (Object.prototype.toString.call(input.buffer) === '[object SharedArrayBuffer]' || input.buffer.constructor === SharedArrayBuffer) {
      if (isStrictUint8Array(input)) {
        return typeArrayToBuffer(input)
      }

      return input
    } else {
      let inputBuf = input
      const sharedBuf = new SharedArrayBuffer(inputBuf.byteLength)
      const buf = Buffer.from(sharedBuf)

      if (isStrictUint8Array(inputBuf)) {
        inputBuf = typeArrayToBuffer(inputBuf)
      }

      inputBuf.copy(buf)

      return buf
    }
  } else if (typeof input === 'object') {
    // if it is object or array just stringify
    return createFrom(serializator.serialize(input))
  }

  throw new Error('Invalid input type to create shared buffer')
}

function decodeObj (input) {
  if (isBinaryInput(input)) {
    const decoder = new StringDecoder('utf8')
    const jsonStr = decoder.end(input)

    if (jsonStr === '') {
      return undefined
    }

    return serializator.parse(jsonStr)
  }

  return input
}

function isStrictUint8Array (input) {
  return Object.prototype.toString.call(input) === '[object Uint8Array]' && input.constructor === Uint8Array
}

function typeArrayToBuffer (input) {
  let newBuf = Buffer.from(input.buffer)

  if (input.byteLength !== input.buffer.byteLength) {
    newBuf = newBuf.slice(input.byteOffset, input.byteOffset + input.byteLength)
  }

  return newBuf
}

module.exports.isBinaryInput = isBinaryInput
module.exports.createFrom = createFrom
module.exports.decodeObj = decodeObj
