// INI File Parser

const { writeFileSync } = require('fs');

const _getSect = line => {
  line.substring(1, line.length - 1);
};

const _getParam = line => {
  return line.split(/=/).map(p => p.trim());
};

const _addNested = (obj, is, value) => {
  if (typeof is == 'string') return this._addNested(obj, is.split('.'), value);
  else if (is.length == 1 && value !== undefined) return (obj[is[0]] = value);
  else if (is.length == 0) return obj;
  else return this._addNested(obj[is[0]], is.slice(1), value);
};

const parse = (data, delimeter = '\n') => {
  let out = {};
  let tmp = out;
  let sect = null;

  const COMMENT = /^[;#]/;
  const SECTION = /^\[[^\]]*\]$/;
  const PARAM = /^[^=]+=.*$/;

  const lines = data.split(new RegExp(`${delimeter}+`, 'g')).map(l => l.trim());

  for (let line of lines) {
    if (!line || COMMENT.test(line)) continue;

    if (/^\s*\[(scope\s?=\s?)?global\]/.test(line)) {
      sect = null;
      continue;
    }

    if (SECTION.test(line)) {
      sect = this._getSect(line)
        .split('.')
        .map(s => s.trim());
      this._addNested(out, sect, {});
    } else if (PARAM.test(line)) {
      const p = this._getParam(line);
      if (!sect) {
        out[p[0]] = p[1];
      } else {
        this._addNested(out, sect.concat(p[0]), p[1]);
      }
    } else {
      if (!sect) {
        out[line] = true;
      } else {
        this._addNested(out, sect.concat(line), true);
      }
    }
  }
  return out;
};

const stringify = (obj = {}, section = '') => {
  let children = [];
  let out = '';

  Object.keys(obj).forEach(k => {
    let val = obj[k];

    if (val && Array.isArray(val)) {
      val.forEach(v => {
        out += `${k}[] = ${v}\n`;
      });
    } else if (val && typeof val === 'object') {
      out += `[${section}${section.length ? '.' : ''}${k}]\n`;
      children.push([val, k]);
    } else {
      if (val === true) {
        out += `${k}\n`;
      } else {
        out = `${k} = ${val}\n`;
      }
    }
  });
  // START CHILDREN MANIPULATION

  children.forEach(o => {
    const child = this.stringify(o[0], o[1]);
    out += `${child}`;
  });

  // END CHILDREN MANIPULATION

  return out;
};

module.exports = {
  parse,
  stringify,
};
