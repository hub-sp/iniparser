# iniParser

A tool that allows you to parse and create `.ini` files to and from regular javascript objects

```js
const iniTool = require('@yaas/iniparser');
const fs = require('fs');

const ini = new iniTool();

const config = ini.parse('./config.ini', '\n'); // By default the eol is \n, but you can change it to \r\n if required.
fs.writeFileSync('./other_config.ini', ini.stringify(config), 'utf8');
```

## License

MIT
