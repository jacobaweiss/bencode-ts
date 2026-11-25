const bencoder = require('./bencoder.ts');

describe('bencoder', () => {
  describe('encode', () => {
    describe('strings', () => {
      it('encodes strings properly', () => {
        expect(bencoder.encode('abc123').toString()).toEqual('6:abc123');
      });
    });

    describe('numbers', () => {
      it('encodes numbers properly', () => {
        expect(bencoder.encode(12345).toString()).toEqual('i12345e');
        expect(bencoder.encode(-50).toString()).toEqual('i-50e');
      });
    });

    describe('lists', () => {
      it('encodes lists properly', () => {
        expect(bencoder.encode(['bencode', -20]).toString()).toEqual('l7:bencodei-20ee');
      });
    });

    describe('objects', () => {
      it('encodes objects properly', () => {
        let obj = {
          'wiki': 'bencode',
          'meaning': 42
        }

        expect(bencoder.encode(obj).toString()).toEqual('d7:meaningi42e4:wiki7:bencodee');
      });
    });
  })

  describe('decode', () => {
    describe('strings', () => {
      it('decodes strings properly', () => {
        let encoded = bencoder.encode('abc123');
        expect(bencoder.decode(encoded).toString()).toEqual('abc123');
      });
    });

    describe('numbers', ()=> {
      it('decodes numbers properly', ()=> {
        expect(bencoder.decode(bencoder.encode(12345))).toEqual(12345);
        expect(bencoder.decode(bencoder.encode(-50))).toEqual(-50);
      });
    });

    describe('lists', () => {
      it('decodes lists properly', () => {
        let encoded = bencoder.encode(['bencode', -20]);

        expect(bencoder.decode(encoded)).toEqual(['bencode', -20]);
      });
    });

    describe('objects', () => {
      it('decodes objects properly', () => {
        let obj = { 'wiki': 'bencode', 'meaning': 42 };
        let encoded = bencoder.encode(obj);

        expect(bencoder.decode(encoded)).toEqual(obj);
      });
    });
  });
});
