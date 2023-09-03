"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writers = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
function hex2a(hexx) {
    var hex = hexx.toString(); //force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
exports.writers = {
    // handleDeploy will get invoked when a contract deployment
    // is found at a block
    handleDeploy: async (args) => {
        // we won't do anything at this time.
        console.log("handle deploy");
    },
    handleRequest: async ({ mysql, event, block }) => {
        if (!event)
            return;
    },
    handleCreated: async ({ mysql, block, instance, rawEvent }) => {
        var ctx = instance.getBaseContext();
        if (!rawEvent)
            return;
        const id = bignumber_1.BigNumber.from(rawEvent.data[0]).toHexString();
        const urlhex = bignumber_1.BigNumber.from(rawEvent.data[1]).toHexString() + (bignumber_1.BigNumber.from(rawEvent.data[2]).toHexString()).slice(2);
        const url = hex2a(urlhex.slice(2));
        const advertiser = bignumber_1.BigNumber.from(rawEvent.data[3]).toHexString();
        const startDate = bignumber_1.BigNumber.from(rawEvent.data[4]);
        const endDate = bignumber_1.BigNumber.from(rawEvent.data[5]);
        const typeSn = bignumber_1.BigNumber.from(rawEvent.data[6]);
        const viewRatio = bignumber_1.BigNumber.from(rawEvent.data[7]);
        const likeRatio = bignumber_1.BigNumber.from(rawEvent.data[8]);
        const shareRatio = bignumber_1.BigNumber.from(rawEvent.data[9]);
        // post object matches fields of Post entity we will
        // define in graphql schema
        const cmp = {
            id,
            advertiser,
            url,
            startDate,
            endDate,
            typeSn,
            viewRatio,
            likeRatio,
            shareRatio,
            token: "",
            totalFunds: 0,
            funds: 0,
            timestamp: block?.timestamp
        };
        ctx.log.info(cmp);
        // table names are `lowercase(EntityName)s` and can be interacted with sql
        await mysql.queryAsync('INSERT IGNORE INTO campaigns SET ?', [cmp]);
        instance.executeTemplate('Campaign', { contract: id, start: block?.block_number });
    },
    handleApplied: async ({ mysql, rawEvent, block }) => {
        if (!rawEvent)
            return;
        const cmp_id = bignumber_1.BigNumber.from(rawEvent.from_address).toHexString();
        const id = bignumber_1.BigNumber.from(rawEvent.data[0]).toHexString();
        const influencer = bignumber_1.BigNumber.from(rawEvent.data[1]).toHexString();
        const idUser = rawEvent.data[2];
        const idPost = rawEvent.data[3];
        const prm = { id,
            influencer,
            campaign: cmp_id,
            status: 0,
            amount: 0,
            reason: "",
            pendingAmount: 0,
            idUser,
            idPost,
            views: 0,
            likes: 0,
            shares: 0
        };
        await mysql.queryAsync('INSERT IGNORE INTO proms SET ?', [prm]);
    },
    handleAccepted: async ({ mysql, rawEvent, block }) => {
        if (!rawEvent)
            return;
        const id = bignumber_1.BigNumber.from(rawEvent.data[0]).toHexString();
        await mysql.queryAsync(`UPDATE proms SET status=1  WHERE id='${id}'`);
    },
    handleRejected: async ({ mysql, rawEvent, block }) => {
        if (!rawEvent)
            return;
        const id = bignumber_1.BigNumber.from(rawEvent.data[0]).toHexString();
        const reason = rawEvent.data[1];
        await mysql.queryAsync(`UPDATE proms SET status=2, reason='${reason}'  WHERE id='${id}'`);
    },
    handleFunded: async ({ mysql, rawEvent }) => {
        if (!rawEvent)
            return;
        const cmp_id = bignumber_1.BigNumber.from(rawEvent.from_address).toHexString();
        var rows = await mysql.queryAsync(`SELECT funds,totalFunds from campaigns WHERE id='${cmp_id}'`);
        const token = bignumber_1.BigNumber.from(rawEvent.data[0]).toHexString();
        const amount = bignumber_1.BigNumber.from(rawEvent.data[1]);
        var newFunds = amount.add(bignumber_1.BigNumber.from(rows[0].funds));
        var newTotalFunds = amount.add(bignumber_1.BigNumber.from(rows[0].totalFunds));
        await mysql.queryAsync(`UPDATE campaigns SET token = '${token}' , funds = '${newFunds}', totalFunds = '${newTotalFunds}' WHERE id='${cmp_id}'`);
    },
    handlePay: async ({ mysql, rawEvent, block }) => {
        if (!rawEvent)
            return;
        const cmp_id = bignumber_1.BigNumber.from(rawEvent.from_address).toHexString();
        const id = bignumber_1.BigNumber.from(rawEvent.data[0]).toHexString();
        const payed = bignumber_1.BigNumber.from(rawEvent.data[1]);
        var rowscmp = await mysql.queryAsync(`SELECT funds from campaigns WHERE id='${cmp_id}'`);
        var rowsprom = await mysql.queryAsync(`SELECT amount,pendingAmount from proms WHERE id='${id}'`);
        var newFunds = bignumber_1.BigNumber.from(rowscmp[0].funds).sub(payed);
        var newAmount = payed.add(bignumber_1.BigNumber.from(rowsprom[0].amount));
        var newPendingAmount = payed.add(bignumber_1.BigNumber.from(rowsprom[0].pendingAmount));
        await mysql.queryAsync(`UPDATE campaigns SET funds = '${newFunds}' WHERE id='${cmp_id}'`);
        await mysql.queryAsync(`UPDATE proms SET amount='${newAmount}', pendingAmount='${newPendingAmount}'  WHERE id='${id}'`);
    },
    handleResult: async ({ mysql, rawEvent, block }) => {
        if (!rawEvent)
            return;
        const id = bignumber_1.BigNumber.from(rawEvent.data[0]).toHexString();
        const views = bignumber_1.BigNumber.from(rawEvent.data[1]);
        const likes = bignumber_1.BigNumber.from(rawEvent.data[2]);
        const shares = bignumber_1.BigNumber.from(rawEvent.data[3]);
        await mysql.queryAsync(`UPDATE proms SET views=${views},likes=${likes},shares=${shares}  WHERE id='${id}'`);
        await mysql.queryAsync(`INSERT IGNORE INTO results SET id='${id}-${block?.timestamp}' prom=${id},views=${views},likes=${likes},shares=${shares},timestamp=${block?.timestamp} `);
    },
    handleRedeem: async ({ mysql, rawEvent, block }) => {
        if (!rawEvent)
            return;
        const cmp_id = bignumber_1.BigNumber.from(rawEvent.from_address).toHexString();
        await mysql.queryAsync(`UPDATE campaigns SET funds = '0' WHERE id='${cmp_id}'`);
    },
    handleOutOfFunds: async ({ mysql, rawEvent, block }) => {
        if (!rawEvent)
            return;
    },
};
