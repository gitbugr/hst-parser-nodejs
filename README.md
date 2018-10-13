<img src="hst_parser.png" height="80px" />

# HST File Parser

### Summary

Parser for the MetaTrader History (.hst) File Format in Node.js

### Table of Contents

  * [Summary](#)
  * [Table of Contents](#)
  * [Installation](#)
  * [Usage](#)
  * [Author](#)
  * [Thank You](#)
  * [Licence](#)

### Installation

```sh
npm install hst-parser --save
# or
yarn add hst-parser
# or
bower install hst-parser --save
```

### Usage

```javascript
const HSTReader = require('hst-parser').HSTReader;

const tradeHistory = new HSTReader('./data/USDGBP.hst'); // your .hst file
```


#### Variables
the HSTReader class exposes some variables for you to use
```javascript
console.log(tradeHistory.version); // file version from headers
// example output: 400

console.log(tradeHistory.symbol); // the symbol / ticker / currency pair from the file
// example output: "USDGBP"

console.log(tradeHistory.period); // the interval (in minutes) of the data
// example output: 1

console.log(tradeHistory.start); // the JS Date of the first candle
// example output: Tue Nov 05 1985 00:52:00 GMT+0000 (GMT)

console.log(tradeHistory.candleNumber); // the number of the last read candle
// example output: 12345

console.log(tradeHistory.endOfFile); // true or false, has the parser hit the end of the file?
// example output: false
```

#### Candle

Candles are a section of data at any given interval.

Example:
```json
{ 
  "close": 90.26,
  "high": 90.27,
  "low": 90.25,
  "open": 90.27,
  "realVolume": 0,
  "spread": 0,
  "timestamp": "2010-01-26T00:00:00.000Z",
  "volume": 9 
}
```

#### isValidFormat()

Checks if file can be parsed by HSTReader. (currently supports versions 400 and 401 of .hst files)
```javascript
if(tradeHistory.isValidFormat()) {
  // do stuff
} else {
  // error?
}
```

#### getCandleNumber(candleNumber)

Returns candle data at specified position
```javascript
console.log(tradeHistory.getCandleNumber(200));
// output: {Candle}
```

#### getNextCandle()

Returns next set of candle data
```javascript
console.log(tradeHistory.getNextCandle());
// output: {Candle}
```

#### getPrevCandle()

Returns previous set of candle data
```javascript
console.log(tradeHistory.getPrevCandle());
// output: {Candle}
```

#### getCandleAt(date, ...[startDate, i])

Returns set of candle data at specified date and time
```javascript
const myBirthday = new Date(1996, 0, 26);
console.log(tradeHistory.getCandleAt(myBirthday));
// output: {Candle}
```

### Author

Kyron Taylor (gitbugr)

### Thank You

Simon Gniadkowski: [HTS File Specification](https://www.mql5.com/en/forum/149178)

### Licence

MIT
