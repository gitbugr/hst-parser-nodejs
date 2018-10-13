"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// packages
const fs = __importStar(require("fs"));
// parser dataa
const parser_data_1 = __importDefault(require("./parser_data"));
class HSTReader {
    /**
     * @param {string} filename Reads headers of specified file and stores into class variables.
     */
    constructor(filename) {
        // check if file exists
        if (!fs.existsSync(filename)) {
            throw new Error(`Can't find this file: ${filename}`);
        }
        // open file and store file descriptor as variable
        this.fd = fs.openSync(filename, 'r');
        // verify filesize is larger than header size
        this.filesize = fs.statSync(filename).size;
        if (this.filesize < 148) {
            throw new Error(`Damn, that's a small file. Too small.`);
        }
        // set up buffers
        const version = Buffer.alloc(4);
        const symbol = Buffer.alloc(12);
        const period = Buffer.alloc(4);
        const start = Buffer.alloc(4);
        // scoped byte offset
        let byteOffset = 0;
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
        this.symbol = symbol.toString("utf8");
        this.period = period.readInt32LE(0);
        this.start = new Date(start.readInt32LE(0) * 1000);
        this.endOfFile = false;
        // set byte offset to end of header-block
        this.candleByteSize = this.version === 400 ? 44 : 60;
        this.byteOffset = 148 - this.candleByteSize;
        this.candleNumber = 0;
    }
    /**
     * @return {boolean} checks if parser supports file version
     */
    isValidFormat() {
        return Object.keys(parser_data_1.default).indexOf(this.version.toString()) !== -1;
    }
    /**
     * @return {Candle} returns the next candle in the file
     */
    getNextCandle() {
        if (this.byteOffset + this.candleByteSize <= this.filesize) {
            this.byteOffset += this.candleByteSize;
            this.candleNumber += 1;
            this.endOfFile = false;
        }
        else {
            this.endOfFile = true;
        }
        return this.readCandle();
    }
    /**
     * @return {Candle} returns the previous candle in the file
     */
    getPrevCandle() {
        if (this.byteOffset - this.candleByteSize >= 148) {
            this.byteOffset -= this.candleByteSize;
            this.candleNumber -= 1;
            this.endOfFile = false;
        }
        return this.readCandle();
    }
    /**
     * @param {number} candleNumber finds candle from number
     * @return {Candle} returns specified candle
     */
    getCandleNumber(candleNumber) {
        this.candleNumber = candleNumber;
        this.byteOffset = 148 + (candleNumber * this.candleByteSize);
        return this.readCandle();
    }
    /**
     * @param {Date} date finds candle at specified date and time
     * @param {Date=} startDate optional: due to missing candles, we try to find based on most likely position
     * @param {number=} i optional: count attempts to limit search area
     * @return {Candle} returns the candle if found
     */
    getCandleAt(date, startDate = this.start, i = 0) {
        const candleOffset = (date.getTime() - startDate.getTime()) / (60000 * this.period);
        let candle = this.getCandleNumber(this.candleNumber + candleOffset);
        if (candle.timestamp.getTime() == date.getTime()) {
            return candle;
        }
        else if (i < 50 && candle.timestamp.getTime()) {
            return this.getCandleAt(date, candle.timestamp, i + 1);
        }
        else if (i < 50) {
            candle = this.getCandleNumber(Math.floor(this.candleNumber / 2));
            return this.getCandleAt(date, candle.timestamp, i + 1);
        }
        else {
            throw new Error("Could not find candle");
        }
    }
    /**
     * @return {Candle} returns candle at byte position
     */
    readCandle() {
        if (this.byteOffset < 148) {
            this.byteOffset = 148;
        }
        const parserFunctions = {
            date: (buffer) => {
                let timestamp = buffer.readInt32LE(0);
                timestamp = timestamp < 9999999999 ? timestamp * 1000 : timestamp;
                return new Date(timestamp);
            },
            double: (buffer) => buffer.readDoubleLE(0),
            i32: (buffer) => buffer.readInt32LE(0),
            undefined: (buffer) => undefined,
        };
        const candleData = {};
        Object.entries(parser_data_1.default[this.version]).forEach(([key, data]) => {
            if (typeof data.value !== "undefined") {
                candleData[key] = data.value;
            }
            else {
                candleData[key] = Buffer.alloc(data.size || 0);
                fs.readSync(this.fd, candleData[key], 0, data.size || 0, this.byteOffset + (data.position || 0));
                candleData[key] = parserFunctions[data.type || "undefined"](candleData[key]);
            }
        });
        return candleData;
    }
}
exports.default = HSTReader;
module.exports = {
    HSTReader,
};
