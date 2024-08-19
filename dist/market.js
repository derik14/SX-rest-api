"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMarkets = findMarkets;
exports.findOrder = findOrder;
const order_1 = require("./order");
async function findMarkets() {
    const url = "https://api.toronto.sx.bet/markets/active?onlyMainLine=true&chainVersion=SXR";
    const response = await fetch(url);
    const data = await response.json();
    const market = data.data.markets[0];
    return market;
}
async function findOrder() {
    const url = "https://api.toronto.sx.bet/orders?maker=0x27cC7A399e8fd2Dffd503528162e9C3810222e6F";
    const response = await fetch(url);
    const data = await response.json();
    let order = undefined;
    if (data && data.data && data.data.length > 0) {
        order = data.data.map((order) => {
            if (order.maker !== order_1.TAKER_ADDRESS) {
                return order;
            }
        });
    }
    return order ? order[0] : undefined;
}
