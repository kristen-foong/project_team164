"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const QueryValidatorUtils_1 = require("./QueryValidatorUtils");
const courseNumericFields = ["avg", "pass", "fail", "audit", "year"];
const roomNumericFields = ["lat", "lon", "seats"];
const courseStringFields = ["dept", "id", "uuid", "instructor", "title"];
const roomStringFields = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
class QueryValidatorC2 {
    constructor() {
        this.idLocal = "";
        this.transf = false;
        this.kind = "";
        this.applyKeys = [];
        this.validatorUtils = new QueryValidatorUtils_1.default();
    }
    queryValidator(query) {
        if (!("WHERE" in query)) {
            return [0, 0, false];
        }
        if (!("OPTIONS" in query)) {
            return [0, 0, false];
        }
        if (Object.keys(query["OPTIONS"]).length === 0) {
            return [0, 0, false];
        }
        if ("TRANSFORMATIONS" in query) {
            this.transf = true;
        }
        if (query["OPTIONS"]["COLUMNS"] === undefined) {
            return [0, 0, false];
        }
        let checkWhere;
        if (Object.keys(query["WHERE"]).length !== 0) {
            checkWhere = this.validateWHERE(query["WHERE"]);
        }
        let checkOptions = this.validateOPTIONS(query["OPTIONS"]);
        if (this.transf) {
            this.validatorUtils.populateApplyKeys((query["OPTIONS"]["COLUMNS"]), this.applyKeys, this.kind, this.idLocal);
            let checkTransformations = this.validateTRANSFORMATIONS(query["TRANSFORMATIONS"], (query["OPTIONS"]["COLUMNS"]));
            if (Object.keys(query["WHERE"]).length !== 0) {
                return [this.idLocal, this.kind, (checkWhere && checkOptions && checkTransformations)];
            }
            else {
                return [this.idLocal, this.kind, (checkOptions && checkTransformations)];
            }
        }
        else {
            if (Object.keys(query["WHERE"]).length !== 0) {
                return [this.idLocal, this.kind, (checkWhere && checkOptions)];
            }
            else {
                return [this.idLocal, this.kind, (checkOptions)];
            }
        }
    }
    validateWHERE(block) {
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
            let boolArray = [];
            block["AND"].forEach((element) => {
                boolArray.push(this.validateWHERE(element));
            });
            return this.validatorUtils.resolveArray(boolArray);
        }
        if ("OR" in block) {
            if (!Array.isArray(block["OR"])) {
                return false;
            }
            let boolArray = [];
            block["OR"].forEach((element) => {
                boolArray.push(this.validateWHERE(element));
            });
            return this.validatorUtils.resolveArray(boolArray);
        }
        return false;
    }
    mCOMP(block) {
        if (Object.keys(block).length !== 1) {
            return false;
        }
        let mKeyVal = Object.values(block)[0];
        if (typeof mKeyVal !== "number") {
            return false;
        }
        let mKey = Object.keys(block)[0];
        let index = mKey.indexOf("_");
        let idString = mKey.substr(0, index);
        let mField = mKey.substr(index + 1, mKey.length);
        return (this.checkidString(idString) && this.check_mField(mField));
    }
    sCOMP(block) {
        if (Object.keys(block).length !== 1) {
            return false;
        }
        let sKeyVal = Object.values(block)[0];
        if (typeof sKeyVal !== "string") {
            return false;
        }
        if (sKeyVal.slice(1, sKeyVal.length - 1).includes("*")) {
            return false;
        }
        let sKey = Object.keys(block)[0];
        let index = sKey.indexOf("_");
        let idString = sKey.substr(0, index);
        let sField = sKey.substr(index + 1, sKey.length);
        return (this.checkidString(idString) && this.check_sField(sField));
    }
    validateOPTIONS(optionsBlock) {
        if (Object.keys(optionsBlock["COLUMNS"]).length === 0) {
            return false;
        }
        const columnKeys = optionsBlock["COLUMNS"];
        const valCOLS = this.validatorUtils.validateCOLUMNKeys(columnKeys);
        if (valCOLS === false) {
            return false;
        }
        else {
            this.idLocal = valCOLS[0];
            this.kind = valCOLS[1];
        }
        if (optionsBlock["ORDER"] === undefined) {
            return true;
        }
        else {
            return this.validateORDER(optionsBlock["ORDER"], columnKeys);
        }
    }
    validateORDER(orderBlock, columnKeys) {
        if (typeof orderBlock === "string") {
            return columnKeys.includes(orderBlock);
        }
        const objKeys = Object.keys(orderBlock);
        if (!(objKeys.length === 2 && objKeys.includes("dir") && objKeys.includes("keys"))) {
            return false;
        }
        if (!(orderBlock["dir"] === "UP" || orderBlock["dir"] === "DOWN")) {
            return false;
        }
        if (!Array.isArray(orderBlock["keys"])) {
            return (columnKeys.includes(orderBlock["keys"]));
        }
        else {
            if (orderBlock["keys"].length === 0) {
                return false;
            }
            for (const elem of orderBlock["keys"]) {
                if (!columnKeys.includes(elem)) {
                    return false;
                }
            }
        }
        return true;
    }
    validateTRANSFORMATIONS(transformBlock, columnKeys) {
        if (transformBlock["GROUP"] === undefined || transformBlock["APPLY"] === undefined) {
            return false;
        }
        if (!Array.isArray(transformBlock["GROUP"])) {
            return false;
        }
        else {
            if (transformBlock["GROUP"].length === 0) {
                return false;
            }
            for (const elem of transformBlock["GROUP"]) {
                if (!(this.validatorUtils.checkValidStringKey(elem, this.kind, this.idLocal) ||
                    this.validatorUtils.checkValidNumericKey(elem, this.kind, this.idLocal))) {
                    return false;
                }
            }
            const allGROUPinCOLS = this.validatorUtils.colAndGroupKeys(columnKeys, transformBlock["GROUP"]);
            if (allGROUPinCOLS === false) {
                return false;
            }
        }
        return this.validateAPPLY(transformBlock["APPLY"]);
    }
    validateAPPLY(applyBlock) {
        if (!Array.isArray(applyBlock)) {
            return false;
        }
        if (applyBlock.length === 0) {
            return true;
        }
        const keyArray = [];
        for (const elem of applyBlock) {
            keyArray.push(Object.keys(elem)[0]);
            const applyRULE = Object.values(elem)[0];
            if (!this.validatorUtils.validateAPPLYRULE(applyRULE, this.kind, this.idLocal)) {
                return false;
            }
        }
        if (this.applyKeys.length !== 0) {
            return (this.validatorUtils.checkApplyKeys(this.applyKeys, keyArray)
                && this.validatorUtils.isUnique(keyArray));
        }
        else {
            return this.validatorUtils.isUnique(keyArray);
        }
    }
    checkidString(idString) {
        if (idString.trim().length === 0) {
            return false;
        }
        if (this.idLocal === "") {
            this.idLocal = idString;
            return true;
        }
        return this.idLocal === idString;
    }
    check_mField(mField) {
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
    check_sField(sField) {
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
exports.default = QueryValidatorC2;
//# sourceMappingURL=QueryValidatorC2.js.map