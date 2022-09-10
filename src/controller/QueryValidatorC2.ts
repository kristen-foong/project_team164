import QueryValidatorUtils from "./QueryValidatorUtils";
import Log from "../Util";
const courseNumericFields: string[] = ["avg", "pass", "fail", "audit", "year"];
const roomNumericFields: string[] = ["lat", "lon", "seats"];
const courseStringFields: string[] = ["dept", "id", "uuid", "instructor", "title"];
const roomStringFields: string[] = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

export default class QueryValidatorC2 {
    private idLocal: string; // keeps track of our id
    private transf: boolean; // transformations present
    private kind: string; // keeps track of what kind it is
    private applyKeys: string[]; // keeps track of all our applyKeys
    private validatorUtils: QueryValidatorUtils; // holds extra utility functions

    constructor() {
        this.idLocal = ""; // initialized as empty
        this.transf = false;
        this.kind = "";
        this.applyKeys = [];
        this.validatorUtils = new QueryValidatorUtils();
    }

    // returns of type [idLocal, kind, valid?]
    public queryValidator(query: any): any[] {
        if (!("WHERE" in query)) {
            return [0, 0, false];
        }
        if (!("OPTIONS" in query)) {
            return [0, 0, false];
        }
        // Check for empty options
        if (Object.keys(query["OPTIONS"]).length === 0) {
            return [0, 0, false];
        }
        if ("TRANSFORMATIONS" in query) {
            this.transf = true;
        }
        if (query["OPTIONS"]["COLUMNS"] === undefined) {
            return [0, 0, false];
        }
        let checkWhere: boolean;
        if (Object.keys(query["WHERE"]).length !== 0) {
            checkWhere = this.validateWHERE(query["WHERE"]);
        }
        let checkOptions = this.validateOPTIONS(query["OPTIONS"]);
        if (this.transf) {
            // populate applyKeys
            this.validatorUtils.populateApplyKeys((query["OPTIONS"]["COLUMNS"]),
                this.applyKeys, this.kind, this.idLocal);
            let checkTransformations = this.validateTRANSFORMATIONS(query["TRANSFORMATIONS"],
                (query["OPTIONS"]["COLUMNS"]));
            if (Object.keys(query["WHERE"]).length !== 0) {
                return [this.idLocal, this.kind, (checkWhere && checkOptions && checkTransformations)];
            } else {
                return [this.idLocal, this.kind, (checkOptions && checkTransformations)];
            }
        } else {
            if (Object.keys(query["WHERE"]).length !== 0) {
                return [this.idLocal, this.kind, (checkWhere && checkOptions)];
            } else {
                return [this.idLocal, this.kind, (checkOptions)];
            }
        }
    }

    private validateWHERE(block: any): boolean {
        // Base cases
        if ("GT" in block) {
            return this.mCOMP(block["GT"]);
        }
        if ("LT" in block) {
            return this.mCOMP(block["LT"]);
        }
        if ("EQ" in block) {
            return this.mCOMP(block["EQ"]);
        }
        if ("IS" in block) {
            return this.sCOMP(block["IS"]);
        }
        if ("NOT" in block) {
            return this.validateWHERE(block["NOT"]);
        }
        if ("AND" in block) {
            if (!Array.isArray(block["AND"])) {
                return false;
            }
            let boolArray: boolean[] = [];
            block["AND"].forEach((element: any) => {
                boolArray.push(this.validateWHERE(element));
            });
            return this.validatorUtils.resolveArray(boolArray);
        }
        if ("OR" in block) {
            if (!Array.isArray(block["OR"])) {
                return false;
            }
            let boolArray: boolean[] = [];
            block["OR"].forEach((element: any) => {
                boolArray.push(this.validateWHERE(element));
            });
            return this.validatorUtils.resolveArray(boolArray);
        }
        return false;
    }

    private mCOMP(block: any): boolean {
        if (Object.keys(block).length !== 1) {
            return false;
        }
        let mKeyVal: any = Object.values(block)[0];
        if (typeof mKeyVal !== "number") {
            return false;
        }
        let mKey: any = Object.keys(block)[0];
        let index: number = mKey.indexOf("_");
        let idString: string = mKey.substr(0, index);                   // get idString
        let mField: string = mKey.substr(index + 1, mKey.length);       // get mField
        return (this.checkidString(idString) && this.check_mField(mField)); // return validation
    }

    private sCOMP(block: any): boolean {
        // Check that length is 1
        if (Object.keys(block).length !== 1) {
            return false;
        }
        let sKeyVal: any = Object.values(block)[0];
        if (typeof sKeyVal !== "string") {
            return false;
        }
        if (sKeyVal.slice(1, sKeyVal.length - 1).includes("*")) {
            return false;
        }
        let sKey: any = Object.keys(block)[0];
        let index: number = sKey.indexOf("_");
        let idString: string = sKey.substr(0, index);                   // get idString
        let sField: string = sKey.substr(index + 1, sKey.length);       // get sField
        return (this.checkidString(idString) && this.check_sField(sField)); // return validation
    }

    private validateOPTIONS(optionsBlock: any): boolean {
        // must have columns -> checked earlier
        if (Object.keys(optionsBlock["COLUMNS"]).length === 0) {
            return false;
        }
        const columnKeys: string[] = optionsBlock["COLUMNS"];
        const valCOLS: any = this.validatorUtils.validateCOLUMNKeys(columnKeys);
        if (valCOLS === false) {
            return false;
        } else {
            this.idLocal = valCOLS[0];
            this.kind = valCOLS[1];
        }
        if (optionsBlock["ORDER"] === undefined) {
            return true;
        } else {
            return this.validateORDER(optionsBlock["ORDER"], columnKeys);
        }
    }

    private validateORDER(orderBlock: any, columnKeys: string[]): boolean {
        if (typeof orderBlock === "string") {
            return columnKeys.includes(orderBlock); // ANYKEY case
        }
        const objKeys: any = Object.keys(orderBlock);   // must have dir and keys inside (any order)
        if (!(objKeys.length === 2 && objKeys.includes("dir") && objKeys.includes("keys"))) {
            return false;
        }
        if (!(orderBlock["dir"] === "UP" || orderBlock["dir"] === "DOWN")) { // dir must be UP or DOWN
            return false;
        }
        if (!Array.isArray(orderBlock["keys"])) {  // if not Array
            return (columnKeys.includes(orderBlock["keys"]));
        } else {
            if (orderBlock["keys"].length === 0) { // cannot be empty
                return false;
            }
            // everything in keys must be in colKeys
            for (const elem of orderBlock["keys"]) {
                if (!columnKeys.includes(elem)) {
                    return false;
                }
            }
        }
        return true;
    }

    private validateTRANSFORMATIONS(transformBlock: any, columnKeys: any): boolean {
        // must have GROUP & APPLY
        if (transformBlock["GROUP"] === undefined || transformBlock["APPLY"] === undefined) {
            return false;
        }
        // what is inside group must be array of keys
        if (!Array.isArray(transformBlock["GROUP"])) {
            return false;
        } else {
            // cannot be empty
            if (transformBlock["GROUP"].length === 0) {
                return false;
            }
            for (const elem of transformBlock["GROUP"]) {
                // everything in GROUP must be a valid key
                if (!(this.validatorUtils.checkValidStringKey(elem, this.kind, this.idLocal) ||
                    this.validatorUtils.checkValidNumericKey(elem, this.kind, this.idLocal))) {
                    return false;
                }
            }
            // 1:1 relationship between the KEYS in GROUP, and the KEYS in COLUMN
            const allGROUPinCOLS: boolean = this.validatorUtils.colAndGroupKeys(columnKeys, transformBlock["GROUP"]);
            if (allGROUPinCOLS === false) {
                return false;
            }
        }
        return this.validateAPPLY(transformBlock["APPLY"]);
    }

    private validateAPPLY(applyBlock: any): boolean {
        if (!Array.isArray(applyBlock)) {
            return false;
        }
        // Apply can be empty! We do not end up grouping if it is?
        if (applyBlock.length === 0) {
            return true; // changed from false
        }
        // List of objects, keys must be valid
        const keyArray: string[] = [];
        for (const elem of applyBlock) {
            keyArray.push(Object.keys(elem)[0]); // push applyKeys to keyArray
            const applyRULE: any = Object.values(elem)[0]; // get applyToken:key
            // check if applyToken:key is valid
            if (!this.validatorUtils.validateAPPLYRULE(applyRULE, this.kind, this.idLocal)) {
                return false;
            }
        }
        // If an applyKey exists in COLUMNS, then it must exist in applyBlock (keyArray)
        if (this.applyKeys.length !== 0) {
            return (this.validatorUtils.checkApplyKeys(this.applyKeys, keyArray)
                && this.validatorUtils.isUnique(keyArray));
        } else {
            return this.validatorUtils.isUnique(keyArray); // all applyKey must be unique
        }
    }

    private checkidString(idString: string): boolean {
        // reject if only whitespace
        if (idString.trim().length === 0) {
            return false;
        }
        // Replace if empty
        if (this.idLocal === "") {
            this.idLocal = idString;
            return true;
        }
        // if not empty, must be equal (else have duplicate query)
        return this.idLocal === idString;
    }

    private check_mField(mField: string): boolean {
        if (this.kind === "") {
            if (courseNumericFields.includes(mField)) {
                this.kind = "courses";
                return true;
            }
            if (roomNumericFields.includes(mField)) {
                this.kind = "rooms";
                return true;
            }
        }
        if (this.kind === "courses") {
            return courseNumericFields.includes(mField);
        }
        if (this.kind === "rooms") {
            return roomNumericFields.includes(mField);
        }
        return false;
    }

    private check_sField(sField: string): boolean {
        if (this.kind === "") {
            if (courseStringFields.includes(sField)) {
                this.kind = "courses";
                return true;
            }
            if (roomStringFields.includes(sField)) {
                this.kind = "rooms";
                return true;
            }
        }
        if (this.kind === "courses") {
            return courseStringFields.includes(sField);
        }
        if (this.kind === "rooms") {
            return roomStringFields.includes(sField);
        }
        return false;
    }
}
