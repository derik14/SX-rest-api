"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const order_1 = require("./order");
const market_1 = require("./market");
const order_2 = require("./order");
const web_socket_1 = require("./web_socket");
const cancel_orders_1 = require("./cancel_orders");
ethers_1.constants.MaxUint256;
``;
ethers_1.providers.JsonRpcProvider;
// User Details
//const PRIVATE_KEY = add private key
const TOKEN_TRANSFER_PROXY_ADDRESS = "0xD7cCD18d33d3EC2879A6DF8e82Ef81C8830c534F";
const EIP712FillHasherAddress = "0xC8dbedb008deB9c870E871F7a470f847C67135E9";
const CHAIN_ID = 79479957;
const DOMAIN_VERSION = "6.0";
// Tokens
// SXR -- New Network
const USDC_SXN = "0x5147891461a7C81075950f8eE6384e019e39ab98";
const USDC_SXR = "0x1BC6326EA6aF2aB8E4b6Bc83418044B1923b2956";
async function main() {
    await (0, web_socket_1.initializeWebSocket)();
    await (0, web_socket_1.subscribeToTrades)();
    console.log("Initialized WebSocket, waiting 5 seconds...");
    await new Promise(f => setTimeout(f, 5000));
    //await enableBet();
    const market = await (0, market_1.findMarkets)();
    for (let x = 0; x < 10; x++) {
        testOrder(market);
    }
}
async function testOrder(market) {
    const post = await (0, order_1.postOrder)(market.marketHash, true);
    console.log(`Post Order result: ${post}`);
    const search = await (0, market_1.findOrder)(); // search for an order on the first market (market[0])
    if (!search) {
        console.log("Order not found... exiting");
        return;
    }
    const fill = (0, order_2.fillOrder)(search.signature, search.marketHash, search.maker, search.salt, search.orderHash, search.percentageOdds, search.isMakerBettingOutcomeOne, search.apiExpiry, search.totalBetSize, search.executor, search.baseToken, search.expiry); //fillOrder(post.signature, ) // fillOrder(...);
    fill.then((fill) => console.log(`Fill Order result: ${fill}`));
    //console.log(`Fill Order result: ${fill}`);
    await new Promise(f => setTimeout(f, 2500));
    const cancel_result = await (0, cancel_orders_1.cancelOrder)([search.orderHash]);
    console.log("Result: " + cancel_result);
}
async function enableBet() {
    console.log('enable bet start');
    const provider = new ethers_1.providers.JsonRpcProvider('https://rpc.sx-rollup-testnet.t.raas.gelato.cloud');
    const wallet = new ethers_1.Wallet(PRIVATE_KEY).connect(provider);
    const tokenContract = new ethers_1.Contract(USDC_SXR, [
        {
            constant: false,
            inputs: [
                { internalType: "address", name: "usr", type: "address" },
                { internalType: "uint256", name: "wad", type: "uint256" },
            ],
            name: "approve",
            outputs: [{ internalType: "bool", name: "", type: "bool" }],
            payable: false,
            stateMutability: "nonpayable",
            type: "function",
        },
    ], wallet);
    await tokenContract.approve(TOKEN_TRANSFER_PROXY_ADDRESS, ethers_1.constants.MaxUint256, { gasLimit: 100000,
    });
    console.log('enable bet end');
}
main().then(() => console.log("Finished!")).catch((e) => console.log(`Something went wrong...${e}`));
