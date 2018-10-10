export default interface Candle {
    timestamp: Date;
    open: number;
    low: number;
    high: number;
    close: number;
    volume: number;
    spread: number;
    realVolume: number;
}
