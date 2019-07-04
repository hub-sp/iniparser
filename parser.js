// INI File Parser

const { writeFileSync } = require('fs');

const _getSect = line => {
  return line.substring(1, line.length - 1);
};

const _getParam = line => {
  return line.split(/=/).map(p => p.trim());
};

const _addNested = (obj, is, value) => {
  if (is.length == 1 && value !== undefined) return (obj[is[0]] = value);
  else return _addNested(obj[is[0]], is.slice(1), value);
};

const parse = (data, delimeter = '\n') => {
  let out = {};
  let sect = null;
  let arr = {};
  let tmp = {};

  const ESCAPED = /\\(?!\\)/g;
  const COMMENT = /^[;#]/;
  const PART_COMMENT = /(?<!\\)[;#]/;
  const SECTION = /^\[[^\]]*\]$/;
  const PARAM = /^[^=]+=.*$/;

  const lines = data.split(new RegExp(`${delimeter}+`, 'g')).map(l => l.trim());

  for (let line of lines) {
    if (!line || COMMENT.test(line)) continue;
    if (PART_COMMENT.test(line)) {
      const comment_semi = line.indexOf(';');
      const comment_hash = line.indexOf('#');
      const comment_char = comment_semi !== -1 ? comment_semi : comment_hash;
      line = line.substring(0, comment_char).trim();
    }

    line = line.replace(ESCAPED, '').replace(/\\(?=\\)/g, '');

    if (/^\s*\[(scope\s?=\s?)?global\]/.test(line)) {
      sect = null;
      continue;
    }

    if (SECTION.test(line)) {
      sect = _getSect(line)
        .split('.')
        .map(s => s.trim());
      _addNested(out, sect, {});
    } else if (PARAM.test(line)) {
      const p = _getParam(line);
      if (p[0].endsWith('[]')) {
        let name = p[0].substring(0, p[0].length - 2);
        arr[name] = tmp[name] || [];
        arr[name].push(p[1]);
        tmp[name] = arr[name];
        continue;
      }
      if (!sect) {
        out[p[0]] = p[1];
      } else {
        _addNested(out, sect.concat(p[0]), p[1]);
      }
    } else {
      if (!sect) {
        out[line] = true;
      } else {
        _addNested(out, sect.concat(line), true);
      }
    }
  }

  Object.keys(arr).forEach(k => {
    out[k] = arr[k];
  });

  return out;
};

const stringify = (obj = {}, section) => {
  const children = [];
  let out = '';

  Object.keys(obj).forEach(k => {
    const val = obj[k];
    if (Array.isArray(val)) {
      val.forEach(item => {
        out += `${k}[] = ${item}\n`;
      });
    } else if (typeof val === 'object') {
      children.push(k);
    } else {
      if (val === true) {
        out += `${k}\n`;
      } else {
        out += `${k} = ${val}\n`;
      }
    }
  });

  if (section) out = `[${section}]\n` + out;

  children.forEach(k => {
    const sect = (section ? section + '.' : '') + k;
    const child = stringify(obj[k], sect);
    out += child;
  });

  return out;
};

module.exports = {
  parse,
  stringify,
};
