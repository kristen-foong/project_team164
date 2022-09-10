"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IInsightFacade_1 = require("./IInsightFacade");
const QueryPerformerUtil_1 = require("./QueryPerformerUtil");
const decimal_js_1 = require("decimal.js");
class QueryPerformer {
    constructor() {
        this.performerUtils = new QueryPerformerUtil_1.default();
    }
    QueryPerformer(query, data) {
        let whereBlock = query["WHERE"];
        let colsBlock = query["OPTIONS"]["COLUMNS"];
        let orderBlock = query["OPTIONS"]["ORDER"];
        const whereLength = Object.keys(whereBlock).length;
        const checkTransf = (query["TRANSFORMATIONS"] !== undefined);
        if (whereLength === 0 && checkTransf) {
            return this.streamOne(data, query, colsBlock, orderBlock);
        }
        if (whereLength === 0 && !checkTransf) {
            return this.streamTwo(data, query, colsBlock, orderBlock);
        }
        if (whereLength !== 0 && checkTransf) {
            return this.streamThree(data, query, colsBlock, orderBlock);
        }
        if (whereLength !== 0 && !checkTransf) {
            return this.streamFour(data, query, colsBlock, orderBlock);
        }
    }
    streamOne(data, query, colsBlock, orderBlock) {
        let groupedData = this.genGROUPS(data, query["TRANSFORMATIONS"]["GROUP"]);
        let transformedData = this.performAPPLY(groupedData, query["TRANSFORMATIONS"]["APPLY"], colsBlock);
        if (transformedData.length > 5000) {
            return Promise.reject(new IInsightFacade_1.ResultTooLargeError());
        }
        else {
            let colsData = this.filterCOLUMNS(transformedData, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }
    streamTwo(data, query, colsBlock, orderBlock) {
        if (data.length > 5000) {
            return Promise.reject(new IInsightFacade_1.ResultTooLargeError());
        }
        else {
            let colsData = this.filterCOLUMNS(data, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }
    streamThree(data, query, colsBlock, orderBlock) {
        let filteredData = this.performerUtils.performWHERE(query["WHERE"], data);
        let groupedData = this.genGROUPS(filteredData, query["TRANSFORMATIONS"]["GROUP"]);
        let transformedData = this.performAPPLY(groupedData, query["TRANSFORMATIONS"]["APPLY"], colsBlock);
        if (transformedData.length > 5000) {
            return Promise.reject(new IInsightFacade_1.ResultTooLargeError());
        }
        else {
            let colsData = this.filterCOLUMNS(transformedData, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }
    streamFour(data, query, colsBlock, orderBlock) {
        let filteredData = this.performerUtils.performWHERE(query["WHERE"], data);
        if (filteredData.length > 5000) {
            Promise.reject(new IInsightFacade_1.ResultTooLargeError());
        }
        else {
            let colsData = this.filterCOLUMNS(filteredData, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }
    performAPPLY(groupedData, applyBlock, colsBlock) {
        let resultAll = [];
        for (const elem of groupedData) {
            const resultOne = {};
            for (const key of colsBlock) {
                resultOne[key] = elem[0][key];
            }
            for (const applyRule of applyBlock) {
                const applyKey = Object.keys(applyRule)[0];
                const applyToken = Object.keys(Object.values(applyRule)[0])[0];
                const tokenKey = Object.values(Object.values(applyRule)[0])[0];
                resultOne[applyKey] = this.performTOKEN(elem, applyToken, tokenKey);
            }
            resultAll.push(resultOne);
        }
        return resultAll;
    }
    performTOKEN(group, applyToken, tokenKey) {
        if (applyToken === "MAX") {
            let largestSeen = Number.NEGATIVE_INFINITY;
            for (const elem of group) {
                if (elem[tokenKey] > largestSeen) {
                    largestSeen = elem[tokenKey];
                }
            }
            return largestSeen;
        }
        if (applyToken === "MIN") {
            let smallestSeen = Number.POSITIVE_INFINITY;
            for (const elem of group) {
                if (elem[tokenKey] < smallestSeen) {
                    smallestSeen = elem[tokenKey];
                }
            }
            return smallestSeen;
        }
        if (applyToken === "SUM") {
            let total = new decimal_js_1.default(0);
            for (const elem of group) {
                const val = new decimal_js_1.default(elem[tokenKey]);
                total = total.add(val);
            }
            let sum = total.toNumber();
            return Number(sum.toFixed(2));
        }
        if (applyToken === "AVG") {
            let total = new decimal_js_1.default(0);
            for (const elem of group) {
                const val = new decimal_js_1.default(elem[tokenKey]);
                total = total.add(val);
            }
            let avg = total.toNumber() / group.length;
            return Number(avg.toFixed(2));
        }
        if (applyToken === "COUNT") {
            let uniqueVals = [];
            for (const elem of group) {
                if (!uniqueVals.includes(elem[tokenKey])) {
                    uniqueVals.push(elem[tokenKey]);
                }
            }
            return uniqueVals.length;
        }
    }
    genGROUPS(filteredData, groupBlock) {
        let groupMap = {};
        for (const elem of filteredData) {
            const newObj = {};
            for (const key of groupBlock) {
                newObj[key] = elem[key];
            }
            const mapKey = JSON.stringify(newObj);
            if (groupMap[mapKey] === undefined) {
                groupMap[mapKey] = [elem];
            }
            else {
                groupMap[mapKey].push(elem);
            }
        }
        return Object.values(groupMap);
    }
    filterCOLUMNS(filteredData, colsBlock) {
        for (const elem of filteredData) {
            const elemCols = Object.keys(elem);
            for (const col of elemCols) {
                if (!colsBlock.includes(col)) {
                    delete elem[col];
                }
            }
        }
        return filteredData;
    }
    sortData(colsData, orderBlock) {
        if (orderBlock === undefined) {
            return colsData;
        }
        let direction = orderBlock["dir"];
        let keys = orderBlock["keys"];
        let index = 0;
        if (direction === "UP") {
            return colsData.sort((a, b) => {
                return this.sortUp(keys, a, b, index);
            });
        }
        else if (direction === "DOWN") {
            return colsData.sort((a, b) => {
                return this.sortDown(keys, a, b, index);
            });
        }
        return colsData;
    }
    sortUp(keys, a, b, index) {
        if (index < keys.length) {
            if (a[keys[index]] < b[keys[index]]) {
                return -1;
            }
            else if (a[keys[index]] > b[keys[index]]) {
                return 1;
            }
            else {
                return this.sortUp(keys, a, b, index + 1);
            }
        }
    }
    sortDown(keys, a, b, index) {
        if (index < keys.length) {
            if (a[keys[index]] > b[keys[index]]) {
                return -1;
            }
            else if (a[keys[index]] < b[keys[index]]) {
                return 1;
            }
            else {
                return this.sortUp(keys, a, b, index + 1);
            }
        }
    }
}
exports.default = QueryPerformer;
//# sourceMappingURL=QueryPerformer.js.map