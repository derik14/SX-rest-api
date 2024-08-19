"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
exports.tradeUpdates = tradeUpdates;
const ably = __importStar(require("ably"));
const axios_1 = __importDefault(require("axios"));
let client;
async function createTokenRequest() {
    const response = await axios_1.default.get("https://api.toronto.sx.bet/user/token", {
        headers: {
            "x-api-key": "e57752a1-2f13-4091-a950-bd292a9c47dd", // "4c34e675-42b1-4fbf-8eaa-2ea58e0eb412",
        },
    });
    return response.data;
}
async function initialize() {
    //const realtime = new ably.Realtime.Promise
    client = new ably.Realtime({
        authCallback: async (tokenParams, callback) => {
            try {
                const tokenRequest = await createTokenRequest();
                // Make a network request to GET /user/token passing in
                // `x-api-key: [YOUR_API_KEY]` as a header
                callback(null, tokenRequest);
            }
            catch (error) {
                callback(error, null);
            }
        },
    });
    await client.connection.once("connected");
}
async function tradeUpdates() {
    // const client = await initialize();
    // let channel = client.channels.get('recent_trades');
    //const channel = realtime.channels.get(`recent_trades`);
    var channel = client.channels.get('recent_trades');
    channel.subscribe((message) => {
        console.log(JSON.stringify(message.data));
    });
}
