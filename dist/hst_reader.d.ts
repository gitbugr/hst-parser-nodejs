import Candle from "./interfaces/candle";
export default class HSTParser {
    version: number;
    symbol: string;
    period: number;
    start: Date;
    candleNumber: number;
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
     * @return {Promise} returns promise that resolves to the next candle in the file
     */
    getNextCandleAsync(): Promise<Candle>;
    /**
     * @return {Candle} returns the previous candle in the file
     */
    getPrevCandle(): Candle;
    /**
     * @return {Promise} returns promise that resolves to the previous candle in the file
     */
    getPrevCandleAsync(): Promise<Candle>;
    /**
     * @param {number} candleNumber finds candle from number
     * @return {Candle} returns specified candle
     */
    getCandleNumber(candleNumber: number): Candle;
    /**
     * @param {number} candleNumber finds candle from number
     * @return {Promise} returns promise that resolves to specified candle
     */
    getCandleNumberAsync(candleNumber: number): Promise<Candle>;
    /**
     * @param {Date} date finds candle at specified date and time
     * @param {Date=} startDate optional: due to missing candles, we try to find based on most likely position
     * @param {number=} i optional: count attempts to limit search area
     * @return {Candle} returns the candle if found
     */
    getCandleAt(date: Date, startDate?: Date, i?: number): Candle;
    /**
     * @param {Date} date finds candle at specified date and time
     * @return {Promise} returns promise, resolves to Candle object
     */
    getCandleAtAsync(date: Date): Promise<Candle>;
    /**
     * @return {Candle} returns candle at byte position
     */
    private readCandle;
}
