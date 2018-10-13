"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parserData = {
    400: {
        close: {
            position: 28,
            size: 8,
            type: "double",
        },
        high: {
            position: 20,
            size: 8,
            type: "double",
        },
        low: {
            position: 12,
            size: 8,
            type: "double",
        },
        open: {
            position: 4,
            size: 8,
            type: "double",
        },
        realVolume: {
            value: 0,
        },
        spread: {
            value: 0,
        },
        timestamp: {
            position: 0,
            size: 4,
            type: "date",
        },
        volume: {
            position: 36,
            size: 8,
            type: "double",
        },
    },
    401: {
        close: {
            position: 32,
            size: 8,
            type: "double",
        },
        high: {
            position: 24,
            size: 8,
            type: "double",
        },
        low: {
            position: 16,
            size: 8,
            type: "double",
        },
        open: {
            position: 8,
            size: 8,
            type: "double",
        },
        realVolume: {
            position: 58,
            size: 8,
            type: "double",
        },
        spread: {
            position: 42,
            size: 4,
            type: "date",
        },
        timestamp: {
            position: 0,
            size: 8,
            type: "date",
        },
        volume: {
            position: 50,
            size: 8,
            type: "double",
        },
    },
};
exports.default = parserData;
