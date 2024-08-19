"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = cancelOrder;
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const ethers_1 = require("ethers");
const random_1 = require("@ethersproject/random");
const order_1 = require("./order");
async function cancelOrder(orderHashes) {
    const privateKey = order_1.MAKER_PRIVATE_KEY;
    const bufferPrivateKey = Buffer.from(privateKey, "hex");
    const saltbuffer = Buffer.from((0, random_1.randomBytes)(32));
    const salt = `0x${saltbuffer.toString("hex")}`;
    const timestamp = Math.floor(new Date().getTime() / 1000);
    const wallet = new ethers_1.Wallet(privateKey);
    const signature = (0, eth_sig_util_1.signTypedData)({
        privateKey: bufferPrivateKey,
        data: {
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "salt", type: "bytes32" },
                ],
                Details: [
                    { name: "orderHashes", type: "string[]" },
                    { name: "timestamp", type: "uint256" },
                ],
            },
            primaryType: "Details",
            domain: {
                name: "CancelOrderV2SportX",
                version: "1.0",
                chainId: order_1.CHAIN_ID,
                salt: saltbuffer,
            },
            message: { orderHashes, timestamp },
        },
        version: eth_sig_util_1.SignTypedDataVersion.V4
    });
    const apiPayload = {
        signature,
        orderHashes,
        salt,
        maker: wallet.address,
        timestamp,
        //chainVersion: "SXR"
    };
    const result = await fetch("https://api.toronto.sx.bet/orders/cancel/v2?chainVersion=SXR", {
        method: "POST",
        body: JSON.stringify(apiPayload),
        headers: { "Content-Type": "application/json" },
    });
    return result.text();
}
