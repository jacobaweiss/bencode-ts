'use strict';

import { Buffer } from 'buffer';

function encodeString(data: string): Buffer {
  let bytes = Buffer.from(data);

  return Buffer.concat([
    Buffer.from(bytes.length.toString()),
    Buffer.from(':'),
    bytes
  ]);
}

function encodeInteger(data: number): Buffer {
  return Buffer.from(`i${data}e`);
}

function encodeList(data: any[]): Buffer {
  let elements = data.map((obj) => {
    return _encode(obj).toString();
  }).join('');

  return Buffer.from(`l${elements}e`)
}

function encodeObject(data: any): Buffer {
  let sorted = Object.keys(data).sort().map((k) => {
    return `${_encode(k)}${_encode(data[k])}`;
  }).join('');

  return Buffer.from(`d${sorted}e`);
}

function _encode(data: any): Buffer {
  switch (typeof data) {
    case 'string':
      return encodeString(data);
    case 'number':
      return encodeInteger(data);
    case 'object':
      if (Array.isArray(data)) {
        return encodeList(data);
      }
      return encodeObject(data);
  }
}

enum Delimiters {
    i = 0x69,
    e = 0x65,
    l = 0x6c,
    d = 0x64,
    colon = 0x3a
}

interface DecodeResult {
  value: any,
  rest?: Buffer
}

function decodeString(data: Buffer): DecodeResult {
  let [lenStr, ...rest] = data.toString().split(':');
  rest = rest.join(':');

  let len = +lenStr
  let res = rest.slice(0, len);

  return {
    value: res,
    rest: Buffer.from(rest.slice(res.length))
  }
}

function decodeNumber(data: Buffer): DecodeResult {
  let [_, rest] = data.toString().split('i');
  let endIdx: number = null;

  for (let i=1; i < data.length; i++) {
    if (data[i] === Delimiters.e) {
      endIdx = i;
      break;
    }
  }

  return {
    value: parseInt(data.slice(1,endIdx).toString()),
    rest: data.slice(endIdx + 1)
  }
}

function decodeList(data: Buffer): DecodeResult {
  let result: any[] = [];
  let rest = data.slice(1);
  let value: any;

  while(true) {
    let first = rest[0];

    if (first === Delimiters.i) {
      ({ value, rest } = decodeNumber(rest));
      result.push(value);
    } else if (encodesDigit(first)) {
      ({ value, rest } = decodeString(rest));
      result.push(value);
    } else if (first === Delimiters.l) {
      ({ value, rest } = decodeList(rest));
      result.push(value);
    } else if (first === Delimiters.d) {
      ({ value, rest } = decodeObject(rest));
      result.push(value);
    } else if (first === Delimiters.e) {
      rest = rest.slice(1);
      break;
    }
  }

  return {
    value: result,
    rest: rest
  }
}

function decodeObject(data: Buffer): DecodeResult {
  let result = {};
  let rest = data.slice(1);
  let value = null;
  let key: string;

  while (rest.length !== 0) {
    let first = rest[0];

    if (first === Delimiters.e) {
      rest = rest.slice(1);
      break;
    }
    ({ value: key, rest } = decodeString(rest));
    ({ value, rest } = _decode(rest));
    result[key] = value;

  }

  return {
    value: result,
    rest: rest
  }
}

function encodesDigit(x: number) {
    return (x >= 0x30) && (x <= 0x39);
}

function _decode(data: Buffer): any {
  let first: byte = data[0];

  if (first === Delimiters.i) {
    return decodeNumber(data);
  } else if (encodesDigit(first)) {
    return decodeString(data);
  } else if (first === Delimiters.l) {
    return decodeList(data);
  } else if (first === Delimiters.d) {
    return decodeObject(data);
  }
}

export function decode(data: Buffer): any {
  let {value, rest} = _decode(data);

  return value;
}

function _encode(data: any): Buffer {
  switch (typeof data) {
    case 'string':
      return encodeString(data);
    case 'number':
      return encodeInteger(data);
    case 'object':
      if (Array.isArray(data)) {
        return encodeList(data);
      }
      return encodeObject(data);
  }
}

export function encode(data: any): Buffer {
  return new Buffer(_encode(data));
}
