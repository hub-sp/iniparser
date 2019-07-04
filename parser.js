// INI File Parser

const { writeFileSync } = require('fs');

const _getSect = line => {
  return line.substring(1, line.length - 1);
};

const _getParam = line => {
  return line.split(/=/).map(p => p.trim());
};

const _addNested = (obj, is, value) => {
  if (typeof is == 'string') return _addNested(obj, is.split('.'), value);
  else if (is.length == 1 && value !== undefined) return (obj[is[0]] = value);
  else if (is.length == 0) return obj;
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
  if (Object.keys(arr).length >= 1) {
    Object.keys(arr).forEach(k => {
      out[k] = arr[k];
    });
  }
  return out;
};

// const stringify = (obj = {}, section = '') => {
//   let children = [];
//   let out = '';

//   Object.keys(obj).forEach(k => {
//     let val = obj[k];

//     if (val && Array.isArray(val)) {
//       val.forEach(v => {
//         out += `${k}[] = ${v}\n`;
//       });
//     } else if (val && typeof val === 'object') {
//       out += `[${section}${section.length ? '.' : ''}${k}]\n`;
//       children.push([val, k]);
//     } else {
//       if (val === true) {
//         out += `${k}\n`;
//       } else {
//         out = `${k} = ${val}\n`;
//       }
//     }
//   });
//   // START CHILDREN MANIPULATION

//   children.forEach(o => {
//     const child = stringify(o[0], o[1]);
//     out += `${child}`;
//   });

//   // END CHILDREN MANIPULATION

//   return out;
// };

module.exports = {
  parse,
  // stringify,
};
