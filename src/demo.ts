import HSTReader from './hst_reader';
import path from 'path';

const hstReader = new HSTReader(path.join(__dirname, '../data/EURGBP.hst'));

console.log(hstReader.symbol);
console.log(hstReader.getNextCandle());
console.log(hstReader.getNextCandle());
console.log(hstReader.getPrevCandle());
console.log(hstReader.getPrevCandle());
console.log(hstReader.getCandleAt(new Date('01/26/2010')));
console.log(hstReader.getCandleAt(new Date('01/26/2009')));
console.log(hstReader.getCandleAt(new Date('03/8/2010')));
console.log(hstReader.candleNumber);

// while(!hstReader.endOfFile) {
//     console.log(hstReader.getNextCandle());
// }