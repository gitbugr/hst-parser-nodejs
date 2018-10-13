export default interface parserData { 
    [version: string]: {
        [key: string]: {
            "size"?: number;
            "position"?: number;
            "type"?: string;
            "value"?: any;
        }
    };
}
