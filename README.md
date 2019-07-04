# iniParser

A tool that allows you to parse and create `.ini` files to and from regular javascript objects

```js
const fs = require('fs');
const ini = require('@yaas/iniparser');

const config = ini.parse(fs.readFileSync('./config.ini', 'utf8'), '\n'); // By default the eol is \n, but you can change it to \r\n if required.
fs.writeFileSync('./other_config.ini', ini.stringify(config), 'utf8');
```

## Valid `.ini` config to JS object

```ini
; This is a comment
# This is also a comment
key = value ; This is now valid
[scope=global]
globalBool
[user]
name = Sam Price
[user.data]
someDataKey = dataProp
[global]
name = iniFile

arr[] = value1 ; value at index 0
arr[] = value2 ; value at index 1
```

Is transformed into

```js
// Assuming you parsed it correctly into the variable `config`
const config = {
  key: 'value',
  globalBool: true,
  name: 'iniFile',
  arr: ['value1', 'value2'],
  user: {
    name: 'Sam Price',
    data: {
      someDataKey: 'dataProp'
    }
  }
};
```

NOTE: `Number`s, `Set`s, `Bigint`s, `NaN` or `false`

## License

MIT
