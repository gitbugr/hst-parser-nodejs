import Candle from "./interfaces/candle";
export default class HSTReader {
    version: number;
    symbol: string;
    period: number;
    start: Date;
    candleNumber: number;
    endOfFile: boolean;
    private fd;
    private byteOffset;
    private candleByteSize;
    private filesize;
    /**
     * @param {string} filename Reads headers of specified file and stores into class variables.
     */
    constructor(filename: string);
    /**
     * @return {boolean} checks if parser supports file version
     */
    isValidFormat(): boolean;
    /**
     * @return {Candle} returns the next candle in the file
     */
    getNextCandle(): Candle;
    /**
     * @return {Candle} returns the previous candle in the file
     */
    getPrevCandle(): Candle;
    /**
     * @param {number} candleNumber finds candle from number
     * @return {Candle} returns specified candle
     */
    getCandleNumber(candleNumber: number): Candle;
    /**
     * @param {Date} date finds candle at specified date and time
     * @param {Date=} startDate optional: due to missing candles, we try to find based on most likely position
     * @param {number=} i optional: count attempts to limit search area
     * @return {Candle} returns the candle if found
     */
    getCandleAt(date: Date, startDate?: Date, i?: number): Candle;
    /**
     * @return {Candle} returns candle at byte position
     */
    private readCandle;
}
