const assert = require('assert').strict;
const ini = require('..');
const { readFileSync } = require('fs');

const cmtData = readFileSync('./test/comments.ini', 'utf8');
const arrData = readFileSync('./test/array.ini', 'utf8');
const objData = readFileSync('./test/object.ini', 'utf8');
const boolData = readFileSync('./test/bool.ini', 'utf8');

const comments = ini.parse(cmtData);
const array = ini.parse(arrData);
const obj = ini.parse(objData);
const bool = ini.parse(boolData);

console.dir(comments);
console.dir(bool);
console.dir(array);
console.dir(obj);

describe('#parse', () => {
  it('ignores comments', () => {
    assert.deepStrictEqual(comments, { inline: true });
  });
  it('correctly parses arrays', () => {
    assert.deepStrictEqual(array, { arr: ['a', 'b', 'c', 'd'] });
  });
  it('returns correct booleans', () => {
    assert.deepStrictEqual(bool, { boolOne: true, boolTwo: true, boolThree: true });
  });
  it('gives correct object', () => {
    assert.deepStrictEqual(obj, {
      bool: true,
      user: {
        bool: true,
        name: 'Sam',
      },
      fool: 'otherName',
    });
  });
});

describe('#stringify', () => {
  it('stringifies correctly', () => {
    assert.strictEqual(ini.stringify(comments), 'inline\n');
    assert.strictEqual(ini.stringify(array), arrData + '\n');
    assert.strictEqual(ini.stringify(obj), 'bool\nfool = otherName\n[user]\nbool\nname = Sam\n');
  });
});
