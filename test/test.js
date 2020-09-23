'use strict'

const should = require('should')
const serializator = require('../')
const { sharedBuffer, sharedData } = serializator

describe('serializator', () => {
  it('should serialize and parse object with standard JSON supported values', () => {
    const obj = {
      a: 1,
      b: 'string',
      c: true,
      d: null
    }

    const json = serializator.serialize(obj)

    should(json).be.eql('{"a":1,"b":"string","c":true,"d":null}')

    const result = serializator.parse(json)

    should(result).be.eql(obj)
  })

  it('should serialize and parse array with standard JSON supported values', () => {
    const arr = [{
      a: 1,
      b: 'string',
      c: true,
      d: null
    }]

    const json = serializator.serialize(arr)

    should(json).be.eql('[{"a":1,"b":"string","c":true,"d":null}]')

    const result = serializator.parse(json)

    should(result).be.eql(arr)
  })

  it('should serialize and parse object with undefined values', () => {
    const obj = {
      a: 1,
      b: 'string',
      c: true,
      d: undefined
    }

    const json = serializator.serialize(obj)

    should(json).be.eql('{"a":1,"b":"string","c":true,"d":null}')

    const result = serializator.parse(json)

    obj.d = null

    should(result).be.eql(obj)
  })

  it('should serialize and parse array with undefined values', () => {
    const arr = [1, 'string', undefined, { registration: undefined }]

    const json = serializator.serialize(arr)

    should(json).be.eql('[1,"string",null,{"registration":null}]')

    const result = serializator.parse(json)

    arr[2] = null
    arr[3].registration = null

    should(result).be.eql(arr)
  })

  it('should serialize and parse object with Date', () => {
    const obj = {
      a: 1,
      b: 'string',
      c: true,
      d: new Date('2018-01-01')
    }

    const json = serializator.serialize(obj)

    should(json).be.eql('{"a":1,"b":"string","c":true,"d":{"$$$date$$$":1514764800000}}')

    const result = serializator.parse(json)

    should(result).be.eql(obj)
  })

  it('should serialize and parse array with Date', () => {
    const arr = [1, 'string', new Date('2018-10-01'), { startDate: new Date('2018-04-01') }]

    const json = serializator.serialize(arr)

    should(json).be.eql('[1,"string",{"$$$date$$$":1538352000000},{"startDate":{"$$$date$$$":1522540800000}}]')

    const result = serializator.parse(json)

    should(result).be.eql(arr)
  })

  it('should serialize and parse object with Buffer', () => {
    const obj = {
      a: 1,
      b: 'string',
      c: true,
      d: Buffer.from('something')
    }

    const json = serializator.serialize(obj)

    should(json).be.eql('{"a":1,"b":"string","c":true,"d":{"$$$buffer$$$":"c29tZXRoaW5n"}}')

    const result = serializator.parse(json)

    obj.d = obj.d.toString()
    result.d = result.d.toString()

    should(result).be.eql(obj)
  })

  it('should serialize and parse array with Buffer', () => {
    const arr = [1, 'string', Buffer.from('something'), { binaryFormat: Buffer.from('binary') }]

    const json = serializator.serialize(arr)

    should(json).be.eql('[1,"string",{"$$$buffer$$$":"c29tZXRoaW5n"},{"binaryFormat":{"$$$buffer$$$":"YmluYXJ5"}}]')

    const result = serializator.parse(json)

    arr[2] = arr[2].toString()
    arr[3].binaryFormat = arr[3].binaryFormat.toString()
    result[2] = result[2].toString()
    result[3].binaryFormat = result[3].binaryFormat.toString()

    should(result).be.eql(arr)
  })

  it('should serialize and parse object with empty Buffer', () => {
    const obj = {
      a: 1,
      b: 'string',
      c: true,
      d: Buffer.from('')
    }

    const json = serializator.serialize(obj)

    should(json).be.eql('{"a":1,"b":"string","c":true,"d":{"$$$buffer$$$":""}}')

    const result = serializator.parse(json)

    obj.d = obj.d.toString()
    result.d = result.d.toString()

    should(result).be.eql(obj)
  })

  it('sharedBuffer -> .isBinaryInput should return true', () => {
    sharedBuffer.isBinaryInput(Buffer.from('foo')).should.be.True()
    sharedBuffer.isBinaryInput(new Uint8Array(5)).should.be.True()
  })

  it('sharedBuffer -> .isBinaryInput should return false', () => {
    sharedBuffer.isBinaryInput('foo').should.be.False()
    sharedBuffer.isBinaryInput(undefined).should.be.False()
    sharedBuffer.isBinaryInput(false).should.be.False()
    sharedBuffer.isBinaryInput(1).should.be.False()
    sharedBuffer.isBinaryInput({}).should.be.False()
    sharedBuffer.isBinaryInput([]).should.be.False()
    sharedBuffer.isBinaryInput(new Uint16Array(5)).should.be.False()
  })

  it('sharedBuffer -> .createFrom should return shared buffer from string', () => {
    isValidSharedBuffer(sharedBuffer.createFrom('test')).should.be.True()
  })

  it('sharedBuffer -> .createFrom should return shared buffer from Buffer', () => {
    isValidSharedBuffer(sharedBuffer.createFrom(Buffer.from('test'))).should.be.True()
  })

  it('sharedBuffer -> .createFrom should return shared buffer from object', () => {
    isValidSharedBuffer(sharedBuffer.createFrom({ x: true })).should.be.True()
  })

  it('sharedBuffer -> .createFrom should return shared buffer from array', () => {
    isValidSharedBuffer(sharedBuffer.createFrom([{ x: true }])).should.be.True()
  })

  it('sharedBuffer -> .createFrom should throw error for invalid input', () => {
    (function () {
      isValidSharedBuffer(sharedBuffer.createFrom(undefined))
    }).should.throw()
  })

  it('sharedBuffer -> .decodeObj should return object', () => {
    const buf = sharedBuffer.createFrom({ foo: 'foo' })
    sharedBuffer.decodeObj(buf).foo.should.be.eql('foo')
    const buf2 = sharedBuffer.createFrom([{ foo: 'foo' }])
    sharedBuffer.decodeObj(buf2)[0].foo.should.be.eql('foo')
  })

  it('sharedBuffer -> .decodeObj should return original object when not passing buffer', () => {
    const obj = { foo: 'foo' }
    sharedBuffer.decodeObj(obj).should.be.eql(obj)
  })

  it('sharedData -> .createFrom should return shared data from string', () => {
    sharedData.createFrom('{ "x": true }').should.have.key('content')
  })

  it('sharedData -> .createFrom should return shared data from Buffer', () => {
    sharedData.createFrom(Buffer.from('{ "x": true }')).should.have.key('content')
  })

  it('sharedData -> .createFrom should return shared data from object', () => {
    sharedData.createFrom({ x: true }).should.have.key('content')
  })

  it('sharedData -> .createFrom should return shared data from array', () => {
    sharedData.createFrom([{ x: true }]).should.have.key('content')
  })

  it('sharedData -> .createFrom should throw error for invalid input', () => {
    (function () {
      sharedData.createFrom(undefined).should.have.key('content')
    }).should.throw()
  })

  it('sharedData -> .isSharedData should return true', () => {
    sharedData.isSharedData(sharedData.createFrom('{ "x": true }')).should.be.True()
  })

  it('sharedData -> .isSharedData should return false', () => {
    sharedData.isSharedData({}).should.be.False()
  })

  it('sharedData -> .getData should return object', () => {
    sharedData.getData(sharedData.createFrom('{ "x": true }')).x.should.be.True()
  })

  it('sharedData -> .getData should return original object when not passing buffer', () => {
    const obj = { x: true }
    sharedData.getData(obj).should.be.eql(obj)
  })

  it('sharedData -> .contentIsArray should return true', () => {
    sharedData.contentIsArray(sharedData.createFrom('[{ "x": true }]')).should.be.True()
    sharedData.contentIsArray(sharedData.createFrom([{ x: true }])).should.be.True()
  })

  it('sharedData -> .contentIsArray should return false', () => {
    sharedData.contentIsArray(sharedData.createFrom('{ "x": true }')).should.be.False()
    sharedData.contentIsArray(sharedData.createFrom({ x: true })).should.be.False()
  })
})

function isValidSharedBuffer (buf) {
  return Object.prototype.toString.call(buf.buffer) === '[object SharedArrayBuffer]'
}
