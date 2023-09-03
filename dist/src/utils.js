"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexStrArrToStr = exports.toAddress = void 0;
const address_1 = require("@ethersproject/address");
const bignumber_1 = require("@ethersproject/bignumber");
const strings_1 = require("@snapshot-labs/sx/dist/utils/strings");
const toAddress = bn => {
    try {
        return (0, address_1.getAddress)(bignumber_1.BigNumber.from(bn).toHexString());
    }
    catch (e) {
        return bn;
    }
};
exports.toAddress = toAddress;
const hexStrArrToStr = (data, start, length) => {
    const dataSlice = data.slice(start, start + Number(length));
    return (0, strings_1.shortStringArrToStr)(dataSlice.map(m => BigInt(m)));
};
exports.hexStrArrToStr = hexStrArrToStr;
