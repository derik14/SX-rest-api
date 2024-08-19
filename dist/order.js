"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_ID = exports.MAKER_PRIVATE_KEY = exports.TAKER_ADDRESS = void 0;
exports.fillOrder = fillOrder;
exports.postOrder = postOrder;
const ethers_1 = require("ethers");
const eth_sig_util_1 = require("@metamask/eth-sig-util");
const utils_1 = require("ethers/lib/utils");
const utils_2 = require("./utils");
//User Details
const TAKER_PRIVATE_KEY = "ec9a2ca474f08ad0903e1f33d25f32f366846e051c5874cb59d4120c465e3a37";
exports.TAKER_ADDRESS = "0x2356DCD73Cb7D11d5C081e170735D82610B40E63";
const MAKER_ADDRESS = "0x27cC7A399e8fd2Dffd503528162e9C3810222e6F";
exports.MAKER_PRIVATE_KEY = "4479ed34a36b2756e915a4c7efab9ceb491bdb67c00e519a44e2ca6032929dce";
const TOKEN_TRANSFER_PROXY_ADDRESS = "0xD7cCD18d33d3EC2879A6DF8e82Ef81C8830c534F";
const EIP712FillHasherAddress = "0xC8dbedb008deB9c870E871F7a470f847C67135E9";
exports.CHAIN_ID = 79479957; //647;
const DOMAIN_VERSION = "6.0";
const PROVIDER_URL = "https://rpc.sx-rollup-testnet.t.raas.gelato.cloud";
// SXR -- New Network
//const USDC_SXN = "0x5147891461a7C81075950f8eE6384e019e39ab98";
const USDC_SXR = "0x1BC6326EA6aF2aB8E4b6Bc83418044B1923b2956";
async function fillOrder(orderSignature, marketHash, maker, salt, orderHash, percentageOdds, isMakerBettingOutcomeOne, apiExpiry, totalBetSize, executor, baseToken, expiry) {
    const bufferPrivateKey = Buffer.from(TAKER_PRIVATE_KEY, "hex");
    const wallet = new ethers_1.Wallet(TAKER_PRIVATE_KEY).connect(new ethers_1.providers.JsonRpcProvider(PROVIDER_URL));
    const takerAmounts = ["1000000"]; // TODO: Fill with the amount of the maker's order you want to take
    const fillSalt = ethers_1.BigNumber.from((0, utils_1.randomBytes)(32)).toString();
    const approvalAmount = ethers_1.constants.MaxUint256;
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
        {
            inputs: [
                {
                    internalType: "address",
                    name: "user",
                    type: "address",
                },
            ],
            name: "getNonce",
            outputs: [
                {
                    internalType: "uint256",
                    name: "nonce",
                    type: "uint256",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
        {
            inputs: [
                {
                    internalType: "address",
                    name: "owner",
                    type: "address",
                },
            ],
            name: "nonces",
            outputs: [
                {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                },
            ],
            stateMutability: "view",
            type: "function",
            constant: true,
        },
        {
            inputs: [],
            name: "name",
            outputs: [
                {
                    internalType: "string",
                    name: "",
                    type: "string"
                }
            ],
            stateMutability: "view",
            type: "function",
            constant: true
        }
    ], wallet);
    let nonce = await tokenContract.nonces(exports.TAKER_ADDRESS);
    const tokenName = await tokenContract.name();
    const abiEncodedFunctionSig = tokenContract.interface.encodeFunctionData("approve", [TOKEN_TRANSFER_PROXY_ADDRESS, approvalAmount]);
    const ordersToFill = [
        {
            orderHash: orderHash,
            marketHash: marketHash,
            maker: maker,
            totalBetSize: totalBetSize,
            percentageOdds: percentageOdds,
            apiExpiry: apiExpiry,
            baseToken: baseToken,
            expiry: expiry,
            executor: executor,
            salt: salt,
            signature: orderSignature,
            isMakerBettingOutcomeOne: isMakerBettingOutcomeOne,
            createdAt: new Date(),
        },
    ];
    const approveProxySignature = (0, eth_sig_util_1.signTypedData)({
        privateKey: bufferPrivateKey,
        data: {
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "verifyingContract", type: "address" },
                    { name: "salt", type: "bytes32" },
                ],
                MetaTransaction: [
                    { name: "nonce", type: "uint256" },
                    { name: "from", type: "address" },
                    { name: "functionSignature", type: "bytes" },
                ],
            },
            domain: {
                name: tokenName,
                version: "1",
                salt: ethers_1.utils.zeroPad(ethers_1.utils.hexlify(exports.CHAIN_ID), 32),
                verifyingContract: USDC_SXR,
            },
            message: {
                nonce: nonce.toNumber(),
                from: exports.TAKER_ADDRESS,
                functionSignature: abiEncodedFunctionSig,
            },
            primaryType: "MetaTransaction",
        },
        version: eth_sig_util_1.SignTypedDataVersion.V4,
    });
    const signature = (0, eth_sig_util_1.signTypedData)({
        privateKey: bufferPrivateKey,
        data: {
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "chainId", type: "uint256" },
                    { name: "verifyingContract", type: "address" },
                ],
                Details: [
                    { name: "action", type: "string" },
                    { name: "market", type: "string" },
                    { name: "betting", type: "string" },
                    { name: "stake", type: "string" },
                    { name: "odds", type: "string" },
                    { name: "returning", type: "string" },
                    { name: "fills", type: "FillObject" },
                ],
                FillObject: [
                    { name: "orders", type: "Order[]" },
                    { name: "makerSigs", type: "bytes[]" },
                    { name: "takerAmounts", type: "uint256[]" },
                    { name: "fillSalt", type: "uint256" },
                    { name: "beneficiary", type: "address" },
                    { name: "beneficiaryType", type: "uint8" },
                    { name: "cashOutTarget", type: "bytes32" }
                ],
                Order: [
                    { name: "marketHash", type: "bytes32" },
                    { name: "baseToken", type: "address" },
                    { name: "totalBetSize", type: "uint256" },
                    { name: "percentageOdds", type: "uint256" },
                    { name: "expiry", type: "uint256" },
                    { name: "salt", type: "uint256" },
                    { name: "maker", type: "address" },
                    { name: "executor", type: "address" },
                    { name: "isMakerBettingOutcomeOne", type: "bool" },
                ],
            },
            primaryType: "Details",
            domain: {
                name: "SX Bet",
                version: DOMAIN_VERSION,
                chainId: exports.CHAIN_ID,
                verifyingContract: EIP712FillHasherAddress,
            },
            message: {
                action: "N/A",
                market: "N/A",
                betting: "N/A",
                stake: "N/A",
                odds: "N/A",
                returning: "N/A",
                fills: {
                    makerSigs: ordersToFill.map((order) => order.signature),
                    orders: ordersToFill.map((order) => ({
                        marketHash: order.marketHash,
                        baseToken: order.baseToken,
                        totalBetSize: order.totalBetSize.toString(),
                        percentageOdds: order.percentageOdds.toString(),
                        expiry: order.expiry.toString(),
                        salt: order.salt.toString(),
                        maker: order.maker,
                        executor: order.executor,
                        isMakerBettingOutcomeOne: order.isMakerBettingOutcomeOne,
                    })),
                    takerAmounts,
                    fillSalt,
                    beneficiary: ethers_1.constants.AddressZero,
                    beneficiaryType: 0,
                    cashOutTarget: ethers_1.constants.HashZero,
                },
            },
        },
        version: eth_sig_util_1.SignTypedDataVersion.V4,
    });
    const apiPayload = {
        orderHashes: ordersToFill.map((order) => order.orderHash),
        takerAmounts,
        taker: exports.TAKER_ADDRESS,
        takerSig: signature,
        fillSalt,
        action: "N/A",
        market: "N/A",
        betting: "N/A",
        stake: "N/A",
        odds: "N/A",
        returning: "N/A",
    };
    // console.log("APPROVESIGPROXY: " + JSON.stringify(approveProxySignature));
    // console.log("API PAYLOAD:" + JSON.stringify(apiPayload));
    // console.log("SIGNATURE: " + JSON.stringify(signature));
    // console.log("signedTypeData: " + JSON.stringify({
    //   types: {
    //     EIP712Domain: [
    //       { name: "name", type: "string" },
    //       { name: "version", type: "string" },
    //       { name: "chainId", type: "uint256" },
    //       { name: "verifyingContract", type: "address" },
    //     ],
    //     Details: [
    //       { name: "action", type: "string" },
    //       { name: "market", type: "string" },
    //       { name: "betting", type: "string" },
    //       { name: "stake", type: "string" },
    //       { name: "odds", type: "string" },
    //       { name: "returning", type: "string" },
    //       { name: "fills", type: "FillObject" },
    //     ],
    //     FillObject: [
    //       { name: "orders", type: "Order[]" },
    //       { name: "makerSigs", type: "bytes[]" },
    //       { name: "takerAmounts", type: "uint256[]" },
    //       { name: "fillSalt", type: "uint256" },
    //       { name: "beneficiary", type: "address" }
    //     ],
    //     Order: [
    //       { name: "marketHash", type: "bytes32" },
    //       { name: "baseToken", type: "address" },
    //       { name: "totalBetSize", type: "uint256" },
    //       { name: "percentageOdds", type: "uint256" },
    //       { name: "expiry", type: "uint256" },
    //       { name: "salt", type: "uint256" },
    //       { name: "maker", type: "address" },
    //       { name: "executor", type: "address" },
    //       { name: "isMakerBettingOutcomeOne", type: "bool" },
    //     ],
    //   },
    //   primaryType: "Details",
    //   domain: {
    //     name: "SX Bet",
    //     version: DOMAIN_VERSION,
    //     chainId: CHAIN_ID,
    //     verifyingContract: EIP712FillHasherAddress,
    //   },
    //   message: {
    //     action: "N/A",
    //     market: "N/A",
    //     betting: "N/A",
    //     stake: "N/A",
    //     odds: "N/A",
    //     returning: "N/A",
    //     fills: {
    //       makerSigs: ordersToFill.map((order) => order.signature),
    //       orders: ordersToFill.map((order) => ({
    //         marketHash: order.marketHash,
    //         baseToken: order.baseToken,
    //         totalBetSize: order.totalBetSize.toString(),
    //         percentageOdds: order.percentageOdds.toString(),
    //         expiry: order.expiry.toString(),
    //         salt: order.salt.toString(),
    //         maker: order.maker,
    //         executor: order.executor,
    //         isMakerBettingOutcomeOne: order.isMakerBettingOutcomeOne,
    //       })),
    //       takerAmounts,
    //       fillSalt,
    //       beneficiary: constants.AddressZero
    //     },
    //   },
    // }));
    // console.log("approve proxy: " + JSON.stringify({
    //   types: {
    //     EIP712Domain: [
    //       { name: "name", type: "string" },
    //       { name: "version", type: "string" },
    //       { name: "verifyingContract", type: "address" },
    //       { name: "salt", type: "bytes32" },
    //     ],
    //     MetaTransaction: [
    //       { name: "nonce", type: "uint256" },
    //       { name: "from", type: "address" },
    //       { name: "functionSignature", type: "bytes" },
    //     ],
    //   },
    //   domain: {
    //     name: tokenName,
    //     version: "1",
    //     salt: utils.zeroPad(utils.hexlify(CHAIN_ID), 32),
    //     verifyingContract: USDC_SXR,
    //   },
    //   message: {
    //     nonce: nonce.toNumber(),
    //     from: TAKER_ADDRESS,
    //     functionSignature: abiEncodedFunctionSig,
    //   },
    //   primaryType: "MetaTransaction",
    // }));
    const response = await fetch(`https://api.toronto.sx.bet/orders/fill`, {
        method: "POST",
        body: JSON.stringify(apiPayload),
        headers: { "Content-Type": "application/json" },
    });
    if (response.status === 200) {
        return "success";
    }
    return "fail";
}
async function postOrder(marketHash, isMakerBettingOutcomeOne) {
    console.log('main start');
    var d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    const order = {
        marketHash: marketHash,
        maker: MAKER_ADDRESS,
        totalBetSize: ethers_1.BigNumber.from("10000000").toString(),
        percentageOdds: (0, utils_2.roundDownOddsToNearestStep)(ethers_1.BigNumber.from("47846889952153115000")).toString(),
        baseToken: USDC_SXR,
        apiExpiry: parseInt((d.getTime() / 1000).toFixed(0)),
        expiry: 2209006800,
        executor: "0x3259E7Ccc0993368fCB82689F5C534669A0C06ca",
        isMakerBettingOutcomeOne: isMakerBettingOutcomeOne,
        salt: ethers_1.BigNumber.from(ethers_1.utils.randomBytes(32)).toString(),
    };
    const orderHash = ethers_1.utils.arrayify(ethers_1.utils.solidityKeccak256([
        "bytes32",
        "address",
        "uint256",
        "uint256",
        "uint256",
        "uint256",
        "address",
        "address",
        "bool",
    ], [
        order.marketHash,
        order.baseToken,
        order.totalBetSize,
        order.percentageOdds,
        order.expiry,
        order.salt,
        order.maker,
        order.executor,
        order.isMakerBettingOutcomeOne,
    ]));
    // Example shown here with an ethers.js wallet if you're interacting with the exchange using a private key
    const wallet = new ethers_1.Wallet(exports.MAKER_PRIVATE_KEY);
    const signature = await wallet.signMessage(orderHash);
    const signedOrder = Object.assign(Object.assign({}, order), { signature });
    const result = await fetch("https://api.toronto.sx.bet/orders/new?chainVersion=SXR", {
        method: "POST",
        body: JSON.stringify({ orders: [signedOrder] }),
        headers: { "Content-Type": "application/json" },
    });
    if (result.status === 200) {
        return "success";
    }
    return "fail";
}
