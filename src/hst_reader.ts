// packages
import * as fs from 'fs';
// interfaces
import Candle from './interfaces/Candle';

export default class HSTReader {
    // Variables
    fd: number;
    byteOffset: number;
    candleByteSize: number;
    candleNumber: number;
    filesize: number;
    endOfFile: boolean;
    // File Headers
    version: number;
    symbol: string;
    period: number;
    start: Date;

    // Constructor reads headers of specified file and stores
    // into class variables.
    constructor(filename: string) {
        // check if file exists
        if(!fs.existsSync(filename)) {
            throw new Error(`Can't find this file: ${filename}`);
        }
        // open file and store file descriptor as variable
        this.fd = fs.openSync(filename, 'r');
        // verify filesize is larger than header size
        this.filesize = fs.statSync(filename).size;
        if(this.filesize < 148) {
            throw new Error(`Damn, that's a small file. Too small.`);
        }
        // set up buffers
        const version: Buffer = Buffer.alloc(4);
        const symbol: Buffer = Buffer.alloc(12);
        const period: Buffer = Buffer.alloc(4);
        const start: Buffer = Buffer.alloc(4);
        
        // scoped byte offset
        let byteOffset: number = 0;
        // read version number
        fs.readSync(this.fd, version, 0, 4, byteOffset);
        // read into symbol buffer (skip copyright header [+64 bytes])
        fs.readSync(this.fd, symbol, 0, 12, byteOffset += 64 + 4);
        // read period
        fs.readSync(this.fd, period, 0, 4, byteOffset += 12);
        // read start date from first candle
        fs.readSync(this.fd, start, 0, 4, 148);
        // convert to js types and store in class variables
        this.version = version.readInt32LE(0);
        this.symbol = symbol.toString('utf8');
        this.period = period.readInt32LE(0);
        this.start = new Date(start.readInt32LE(0) * 1000);
        this.endOfFile = false;
        // set byte offset to end of header-block
        this.candleByteSize = this.version === 400 ? 44 : 60;
        this.byteOffset = 148 - this.candleByteSize;
        this.candleNumber = 0;
    }
    // checks if version header is as expected
    isValidFormat(): boolean {
        return this.version === 400 || this.version === 401;
    }
    getNextCandle(): Candle {
        if(this.byteOffset + this.candleByteSize <= this.filesize) {
            this.byteOffset += this.candleByteSize;
            this.candleNumber += 1;
            this.endOfFile = false;
        } else {
            this.endOfFile = true;
        }
        return this.readCandle();
    }
    getPrevCandle(): Candle {
        if(this.byteOffset - this.candleByteSize >= 148) {
            this.byteOffset -= this.candleByteSize;
            this.candleNumber -= 1;
            this.endOfFile = false;
        }
        return this.readCandle();
    }
    getCandleNumber(candleNumber: number): Candle {
        this.candleNumber = candleNumber;
        this.byteOffset = 148 + (candleNumber * this.candleByteSize);
        return this.readCandle();
    }
    // date search function
    // smart function. great function. the best function.
    getCandleAt(date: Date, startDate: Date = this.start, i: number = 0): Candle {
        const candleOffset = (date.getTime() - startDate.getTime()) / (60000 * this.period);
        let candle = this.getCandleNumber(this.candleNumber + candleOffset)
        if(candle.timestamp.getTime() == date.getTime()) {
            return candle;
        } else if (i < 50 && candle.timestamp.getTime()) {
            return this.getCandleAt(date, candle.timestamp, i + 1);
        } else if (i < 50) {
            candle = this.getCandleNumber(Math.floor(this.candleNumber / 2));
            return this.getCandleAt(date, candle.timestamp, i + 1);
        } else {
            throw new Error('Could not find candle');
        }
    }
    private readCandle(): Candle {
        if(this.byteOffset < 148) {
            this.byteOffset = 148;
        }

        const timestamp: Buffer = Buffer.alloc(4);
        const open: Buffer = Buffer.alloc(8);
        const low: Buffer = Buffer.alloc(8);
        const high: Buffer = Buffer.alloc(8);
        const close: Buffer = Buffer.alloc(8);
        const volume: Buffer = Buffer.alloc(8);

        fs.readSync(this.fd, timestamp, 0, 4, this.byteOffset);
        fs.readSync(this.fd, open, 0, 8, this.byteOffset += 4);
        fs.readSync(this.fd, low, 0, 8, this.byteOffset += 8);
        fs.readSync(this.fd, high, 0, 8, this.byteOffset += 8);
        fs.readSync(this.fd, close, 0, 8, this.byteOffset += 8);
        fs.readSync(this.fd, volume, 0, 8, this.byteOffset += 8);

        this.byteOffset -= this.candleByteSize - 8;

        return {
            timestamp: new Date(timestamp.readInt32LE(0) * 1000),
            open: open.readDoubleLE(0),
            low: low.readDoubleLE(0),
            high: high.readDoubleLE(0),
            close: close.readDoubleLE(0),
            volume: volume.readDoubleLE(0),
            spread: 0, 
            realVolume: 0,
        };
    }
}