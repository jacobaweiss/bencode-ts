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

export function encode(data: any): Buffer {
  return new Buffer(_encode(data));
}
