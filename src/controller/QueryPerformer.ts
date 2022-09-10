import {ResultTooLargeError, SectionDataset} from "./IInsightFacade";
import QueryPerformerUtil from "./QueryPerformerUtil";
import Decimal from "decimal.js";

export default class QueryPerformer {
    private performerUtils: QueryPerformerUtil;

    constructor() {
        // nothing for now
        this.performerUtils = new QueryPerformerUtil();
    }


    public QueryPerformer (query: any, data: any[]): any {
        let whereBlock = query["WHERE"];
        let colsBlock = query["OPTIONS"]["COLUMNS"];
        let orderBlock = query["OPTIONS"]["ORDER"];


        // Check length of where block, store as an integer
        // Check Transforamtions here, and store as a boolean
        const whereLength: number = Object.keys(whereBlock).length;
        const checkTransf: boolean = (query["TRANSFORMATIONS"] !== undefined);

        // if no where block & transformations -> streamOne
        if (whereLength === 0 && checkTransf) {
            return this.streamOne(data, query, colsBlock, orderBlock);
        }

        // If no where block & no transformations -> streamTwo
        if (whereLength === 0 && !checkTransf) {
            return this.streamTwo(data, query, colsBlock, orderBlock);
        }

        // if where block & transformations -> streamThree
        if (whereLength !== 0 && checkTransf) {
            return this.streamThree(data, query, colsBlock, orderBlock);
        }

        // if where block & no transformations -> streamFour
        if (whereLength !== 0 && !checkTransf) {
            return this.streamFour(data, query, colsBlock, orderBlock);
        }
    }

    // no where block and transformations
    public streamOne(data: any[], query: any, colsBlock: any, orderBlock: any): any {
        let groupedData: any[] = this.genGROUPS(data, query["TRANSFORMATIONS"]["GROUP"]); // group our data
        // apply transformations
        let transformedData: any = this.performAPPLY(groupedData, query["TRANSFORMATIONS"]["APPLY"], colsBlock);
        // check if too large
        if (transformedData.length > 5000) {
            return Promise.reject(new ResultTooLargeError()); // return error
        } else {
            // remove unnecessary columns & return sorted
            let colsData: any = this.filterCOLUMNS(transformedData, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }

    // no where block & no transformations -> streamTwo
    public streamTwo(data: any[], query: any, colsBlock: any, orderBlock: any): any {
        // check if too large
        if (data.length > 5000) {
            return Promise.reject(new ResultTooLargeError()); // return error
        } else {
            // remove unnecessary columns & return sorted
            let colsData: any = this.filterCOLUMNS(data, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }

    // where block & transformations -> streamThree
    public streamThree(data: any[], query: any, colsBlock: any, orderBlock: any): any {
        let filteredData: any[] = this.performerUtils.performWHERE(query["WHERE"], data); // filter our data
        let groupedData: any[] = this.genGROUPS(filteredData, query["TRANSFORMATIONS"]["GROUP"]); // make groups
        // apply transformations

        let transformedData: any = this.performAPPLY(groupedData, query["TRANSFORMATIONS"]["APPLY"], colsBlock);
        // check if too large
        if (transformedData.length > 5000) {
            return Promise.reject(new ResultTooLargeError()); // return error
        } else {
            // remove unnecessary columns & return sorted
            let colsData: any = this.filterCOLUMNS(transformedData, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }

    // where block and no transformations -> streamFour
    public streamFour(data: any [], query: any, colsBlock: any, orderBlock: any): any {
        let filteredData: any[] = this.performerUtils.performWHERE(query["WHERE"], data); // filter our data
        // check if too large
        if (filteredData.length > 5000) {
            Promise.reject(new ResultTooLargeError());
        } else {
            // remove unnecessary columns & return sorted
            let colsData: any[] = this.filterCOLUMNS(filteredData, colsBlock);
            return this.sortData(colsData, orderBlock);
        }
    }

    /**
     * Consumes our groupedData, which is [object[], ...], and performs apply on each group
     * Also consumes the applyBlock (what is applied to each group), and colsBlock (contains columns we want in obj)
     * @param groupedData
     * @param applyBlock
     * @param colsBlock
     */
    public performAPPLY(groupedData: any[], applyBlock: any, colsBlock: any): any {
        let resultAll: any[] = []; // Stores the results of applyBlock on each group
        // Iterate over every group in our groupedData
        for (const elem of groupedData) {
            const resultOne: any = {}; // stores the keys we want (a group is reduced down to a single object)
            // fill our single object with information that exists
            for (const key of colsBlock) {
                resultOne[key] = elem[0][key]; // If does not exist, its an applyKey, set to undefined
            }
            // each group needs our applyBlock performed on it
            for (const applyRule of applyBlock) {
                const applyKey: string = Object.keys(applyRule)[0]; // grab applyKey
                const applyToken: string = Object.keys(Object.values(applyRule)[0])[0]; // grab token rule
                const tokenKey: string = Object.values(Object.values(applyRule)[0])[0]; // grab token key
                resultOne[applyKey] = this.performTOKEN(elem, applyToken, tokenKey);
            }
            resultAll.push(resultOne); // push to resultAll when completed
        }
        return resultAll;
    }

    /**
     * Apply the token rule on our respective group, given the token key
     * Different operations performed depending on type
     * In the end, returns a single value that is the result of operation
     * @param group
     * @param applyToken
     * @param tokenKey
     */
    public performTOKEN(group: any[], applyToken: string, tokenKey: string): any {
        if (applyToken === "MAX") {
            let largestSeen: number = Number.NEGATIVE_INFINITY;
            for (const elem of group) {
                if (elem[tokenKey] > largestSeen) {
                    largestSeen = elem[tokenKey];
                }
            }
            return largestSeen;
        }
        if (applyToken === "MIN") {
            let smallestSeen: number = Number.POSITIVE_INFINITY;
            for (const elem of group) {
                if (elem[tokenKey] < smallestSeen) {
                    smallestSeen = elem[tokenKey];
                }
            }
            return smallestSeen;
        }
        if (applyToken === "SUM") {
            let total: Decimal = new Decimal(0);
            for (const elem of group) {
                const val: Decimal = new Decimal(elem[tokenKey]);
                total = total.add(val);
            }
            let sum: number = total.toNumber();
            return Number(sum.toFixed(2));
        }
        if (applyToken === "AVG") {
            let total: Decimal = new Decimal(0);
            for (const elem of group) {
                const val: Decimal = new Decimal(elem[tokenKey]);
                total = total.add(val);
            }
            let avg: number = total.toNumber() / group.length;
            return Number(avg.toFixed(2));
        }
        // Perhaps will need special case here for decimal vals?
        if (applyToken === "COUNT") {
            // return number of unique vals associated with the key
            let uniqueVals: any = [];
            for (const elem of group) {
                if (!uniqueVals.includes(elem[tokenKey])) {
                    uniqueVals.push(elem[tokenKey]);
                }
            }
            return uniqueVals.length;
        }
    }

    /**
     * Consumes our filteredData, along with the the keys we wish to group by in an array
     * We want to take an array of sections, and eventually get an array of groups
     * Each group is an array of sections, which share the same values for the keys specified in groupBlock!
     */
    public genGROUPS(filteredData: any[], groupBlock: any): any[] {
        let groupMap: {[objKey: string]: any[]} = {};
        for (const elem of filteredData) {
            // We stringify the element here according to the keys we need
            const newObj: any = {};
            for (const key of groupBlock) {
                newObj[key] = elem[key];
            }
            const mapKey: string = JSON.stringify(newObj);
            if (groupMap[mapKey] === undefined) {
                groupMap[mapKey] = [elem];
            } else {
                groupMap[mapKey].push(elem);
            }
        }
        return Object.values(groupMap);
    }

    /**
     * Consumes our data (whereBlock applied to it), returns an array of sections
     * Iterates over our array of sections, and removes all cols not in colsBlock
     */
    public filterCOLUMNS(filteredData: any[], colsBlock: any): any[] {
        // Iterate over every section
        for (const elem of filteredData) {
            // Remove all columns not in colsBlock
            const elemCols: string[] = Object.keys(elem); // get all our columns in a single obj
            // for every column in our obj, check if its in colsBlock
            for (const col of elemCols) {
                if (!colsBlock.includes(col)) {
                    delete elem[col];
                }
            }
        }
        return filteredData;
    }

    /**
     * Consumes our filteredData (only have the cols we desire)
     * Performs a sort (maybe we can use built-in functions to accomplish this)
     * Order & Direction - order has direction & keys - check spec
     * Test w/o transformations block
     */
    public sortData(colsData: any[], orderBlock: any): any[] {
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
        } else if (direction === "DOWN") {
            return colsData.sort((a, b) => {
                return this.sortDown(keys, a, b, index);
            });
        }
        // this.sortHelper(colsData, keys, direction, 0);
        return colsData;
    }


    public sortUp(keys: any, a: any, b: any, index: number): any {
        if (index < keys.length) {
            if (a[keys[index]] < b[keys[index]]) {
                return -1;
            } else if (a[keys[index]] > b[keys[index]]) {
                return 1;
            } else {
                return this.sortUp(keys, a, b, index + 1);
            }
        }
    }

    public sortDown(keys: any, a: any, b: any, index: number): any {
        if (index < keys.length) {
            if (a[keys[index]] > b[keys[index]]) {
                return -1;
            } else if (a[keys[index]] < b[keys[index]]) {
                return 1;
            } else {
                return this.sortUp(keys, a, b, index + 1);
            }
        }
    }
}
