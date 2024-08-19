import eth, { signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util"
import {Wallet} from "ethers";
import { randomBytes } from "@ethersproject/random";
import { CHAIN_ID, MAKER_PRIVATE_KEY } from "./order";

export async function cancelOrder(orderHashes: string[]) {

  const privateKey = MAKER_PRIVATE_KEY;
  const bufferPrivateKey = Buffer.from(privateKey, "hex");
  
  const saltbuffer = Buffer.from(randomBytes(32));
  const salt = `0x${saltbuffer.toString("hex")}`;
  
  const timestamp = Math.floor(new Date().getTime() / 1000);
  const wallet = new Wallet(privateKey);
  
  const signature = signTypedData({
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
          chainId: CHAIN_ID,
          salt: saltbuffer,
        },
        message: { orderHashes, timestamp },
      },
    version: SignTypedDataVersion.V4});

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
