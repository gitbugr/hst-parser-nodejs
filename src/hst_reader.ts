"use strict";

// packages
import * as fs from "fs";
// interfaces
import Candle from "./interfaces/candle";
// parser dataa
import parserData from "./parser_data";

export default class HSTReader {
    // File Headers
    public version: number;
    public symbol: string;
    public period: number;
    public start: Date;
    // Variables
    public candleNumber: number;
    public endOfFile: boolean;
    private fd: number;
    private byteOffset: number;
    private candleByteSize: number;
    private filesize: number;

    /**
     * @param {string} filename Reads headers of specified file and stores into class variables.
     */
    constructor(filename: string) {
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
    public isValidFormat(): boolean {
        return Object.keys(parserData).indexOf(this.version.toString()) !== -1;
    }
    /**
     * @return {Candle} returns the next candle in the file
     */
    public getNextCandle(): Candle {
        if (this.byteOffset + this.candleByteSize <= this.filesize) {
            this.byteOffset += this.candleByteSize;
            this.candleNumber += 1;
            this.endOfFile = false;
        } else {
            this.endOfFile = true;
        }
        return this.readCandle();
    }
    /**
     * @return {Candle} returns the previous candle in the file
     */
    public getPrevCandle(): Candle {
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
    public getCandleNumber(candleNumber: number): Candle {
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
    public getCandleAt(date: Date, startDate: Date = this.start, i: number = 0): Candle {
        const candleOffset = (date.getTime() - startDate.getTime()) / (60000 * this.period);
        let candle = this.getCandleNumber(this.candleNumber + candleOffset);
        if (candle.timestamp.getTime() == date.getTime()) {
            return candle;
        } else if (i < 50 && candle.timestamp.getTime()) {
            return this.getCandleAt(date, candle.timestamp, i + 1);
        } else if (i < 50) {
            candle = this.getCandleNumber(Math.floor(this.candleNumber / 2));
            return this.getCandleAt(date, candle.timestamp, i + 1);
        } else {
            throw new Error("Could not find candle");
        }
    }
    /**
     * @return {Candle} returns candle at byte position
     */
    private readCandle(): Candle {
        if (this.byteOffset < 148) {
            this.byteOffset = 148;
        }

        const parserFunctions: any = {
            date: (buffer: Buffer) => {
                let timestamp: number = buffer.readInt32LE(0);
                timestamp = timestamp < 9999999999 ? timestamp * 1000 : timestamp;
                return new Date(timestamp);
            },
            double: (buffer: Buffer) => buffer.readDoubleLE(0),
            i32: (buffer: Buffer) => buffer.readInt32LE(0),
            undefined: (buffer: Buffer) => undefined,
        };

        const candleData: any = {};

        Object.entries(parserData[this.version]).forEach(([key, data]) => {
            if (typeof data.value !== "undefined") {
                candleData[key] = data.value;
            } else {
                candleData[key] = Buffer.alloc(data.size || 0);
                fs.readSync(this.fd, candleData[key], 0, data.size || 0, this.byteOffset + (data.position || 0));
                candleData[key] = parserFunctions[data.type || "undefined"](candleData[key]);
            }
        });

        return candleData;
    }
}
