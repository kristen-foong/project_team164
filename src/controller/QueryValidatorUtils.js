"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const courseNumericFields = ["avg", "pass", "fail", "audit", "year"];
const roomNumericFields = ["lat", "lon", "seats"];
const courseStringFields = ["dept", "id", "uuid", "instructor", "title"];
const roomStringFields = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
const numericTokens = ["MAX", "MIN", "AVG", "SUM"];
const anyTokens = ["COUNT"];
class QueryValidatorUtils {
    constructor() {
        this.courseNumericFields = ["avg", "pass", "fail", "audit", "year"];
        this.roomNumericFields = ["lat", "lon", "seats"];
        this.courseStringFields = ["dept", "id", "uuid", "instructor", "title"];
        this.roomStringFields = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
        this.numericTokens = ["MAX", "MIN", "AVG", "SUM"];
        this.anyTokens = ["COUNT"];
    }
    checkValidNumericKey(numericKey, kind, idLocal) {
        if (kind === "courses") {
            for (const elem of this.courseNumericFields) {
                if (numericKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
        if (kind === "rooms") {
            for (const elem of this.roomNumericFields) {
                if (numericKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
    }
    checkValidStringKey(stringKey, kind, idLocal) {
        if (kind === "courses") {
            for (const elem of this.courseStringFields) {
                if (stringKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
        if (kind === "rooms") {
            for (const elem of this.roomStringFields) {
                if (stringKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
    }
    checkApplyKey(applyKey) {
        return (!applyKey.includes("_") && applyKey !== "");
    }
    populateApplyKeys(columnKeys, applyKeys, kind, idLocal) {
        for (const elem of columnKeys) {
            if (this.checkApplyKey(elem)) {
                applyKeys.push(elem);
            }
        }
    }
    resolveArray(boolArray) {
        for (const elem of boolArray) {
            if (elem === false) {
                return false;
            }
        }
        return true;
    }
    isEqual(Array1, Array2) {
        for (const elem of Array1) {
            if (!Array2.includes(elem)) {
                return false;
            }
        }
        for (const elem of Array2) {
            if (!Array1.includes(elem)) {
                return false;
            }
        }
        return true;
    }
    isUnique(applyKeys) {
        let seenKeys = [];
        for (const elem of applyKeys) {
            if (!seenKeys.includes(elem)) {
                seenKeys.push(elem);
            }
            else {
                return false;
            }
        }
        return true;
    }
    validateAPPLYRULE(applyRule, kind, idLocal) {
        const applyTOKEN = Object.keys(applyRule)[0];
        const tokenKEY = Object.values(applyRule)[0];
        if (this.numericTokens.includes(applyTOKEN)) {
            if (this.checkValidNumericKey(tokenKEY, kind, idLocal)) {
                return true;
            }
        }
        if (this.anyTokens.includes(applyTOKEN)) {
            if (this.checkValidNumericKey(tokenKEY, kind, idLocal) ||
                this.checkValidStringKey(tokenKEY, kind, idLocal)) {
                return true;
            }
        }
        return false;
    }
    validateCOLUMNKeys(colKeys) {
        let ourKind = "";
        let ourID = "";
        for (const column of colKeys) {
            const index = column.indexOf("_");
            if (index === -1) {
            }
            if (ourID === "" && index !== -1) {
                ourID = column.substr(0, index);
                ourKind = this.getKindofField(column.substr(index + 1, column.length));
                if (typeof ourKind === "boolean") {
                    return ourKind;
                }
            }
            else if (index !== -1) {
                let nextID = column.substr(0, index);
                let nextKind = this.getKindofField(column.substr(index + 1, column.length));
                if (ourID !== nextID) {
                    return false;
                }
                if (typeof nextKind === "boolean") {
                    return ourKind;
                }
                if (nextKind !== ourKind) {
                    return false;
                }
            }
        }
        return [ourID, ourKind];
    }
    getKindofField(field) {
        if (this.courseNumericFields.includes(field) || this.courseStringFields.includes(field)) {
            return "courses";
        }
        else if (this.roomNumericFields.includes(field) || this.roomStringFields.includes(field)) {
            return "rooms";
        }
        else {
            return false;
        }
    }
    colAndGroupKeys(colKeys, groupKeys) {
        let colOnlyKeys = [];
        for (const elem of colKeys) {
            if (elem.includes("_")) {
                colOnlyKeys.push(elem);
            }
        }
        for (const elem of colOnlyKeys) {
            if (!groupKeys.includes(elem)) {
                return false;
            }
        }
        return true;
    }
    checkApplyKeys(applyKeysInCol, applyKeysInGroup) {
        for (const elem of applyKeysInCol) {
            if (!applyKeysInGroup.includes(elem)) {
                return false;
            }
        }
        return true;
    }
}
exports.default = QueryValidatorUtils;
//# sourceMappingURL=QueryValidatorUtils.js.map