"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryPerformerUtil {
    constructor() {
    }
    performWHERE(whereBlock, courseSections) {
        if ("GT" in whereBlock) {
            return this.removalGT(courseSections, whereBlock);
        }
        if ("LT" in whereBlock) {
            return this.removalLT(courseSections, whereBlock);
        }
        if ("EQ" in whereBlock) {
            return this.removalEQ(courseSections, whereBlock);
        }
        if ("IS" in whereBlock) {
            return this.removalIS(courseSections, whereBlock);
        }
        if ("AND" in whereBlock) {
            return this.removalAND(courseSections, whereBlock);
        }
        if ("OR" in whereBlock) {
            return this.removalOR(courseSections, whereBlock);
        }
        if ("NOT" in whereBlock) {
            return this.removalNOT(courseSections, whereBlock);
        }
    }
    removalNOT(courseSections, whereBlock) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1);
            }
        }
        return courseSections;
    }
    removalOR(courseSections, whereBlock) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1);
            }
        }
        return courseSections;
    }
    removalAND(courseSections, whereBlock) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1);
            }
        }
        return courseSections;
    }
    removalIS(courseSections, whereBlock) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1);
            }
        }
        return courseSections;
    }
    removalLT(courseSections, whereBlock) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1);
            }
        }
        return courseSections;
    }
    removalEQ(courseSections, whereBlock) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1);
            }
        }
        return courseSections;
    }
    removalGT(courseSections, whereBlock) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1);
            }
        }
        return courseSections;
    }
    checker(anyBlock, section) {
        if ("GT" in anyBlock) {
            return this.checkGT(anyBlock["GT"], section);
        }
        if ("LT" in anyBlock) {
            return this.checkLT(anyBlock["LT"], section);
        }
        if ("EQ" in anyBlock) {
            return this.checkEQ(anyBlock["EQ"], section);
        }
        if ("IS" in anyBlock) {
            return this.checkIS(anyBlock["IS"], section);
        }
        if ("AND" in anyBlock) {
            let boolArray = [];
            anyBlock["AND"].forEach((element) => {
                boolArray.push(this.checker(element, section));
            });
            return this.resolveAND(boolArray);
        }
        if ("OR" in anyBlock) {
            let boolArray = [];
            anyBlock["OR"].forEach((element) => {
                boolArray.push(this.checker(element, section));
            });
            return this.resolveOR(boolArray);
        }
        if ("NOT" in anyBlock) {
            return (!this.checker(anyBlock["NOT"], section));
        }
    }
    checkGT(GTblock, section) {
        let Key = Object.keys(GTblock)[0];
        let Value = Object.values(GTblock)[0];
        let compareValue = section[Key];
        return (compareValue > Value);
    }
    checkLT(LTblock, section) {
        let Key = Object.keys(LTblock)[0];
        let Value = Object.values(LTblock)[0];
        let compareValue = section[Key];
        return (compareValue < Value);
    }
    checkEQ(EQblock, section) {
        let Key = Object.keys(EQblock)[0];
        let Value = Object.values(EQblock)[0];
        let compareValue = section[Key];
        return (compareValue === Value);
    }
    checkIS(ISblock, section) {
        let sKey = Object.keys(ISblock)[0];
        let value = Object.values(ISblock)[0];
        let compareValue = section[sKey];
        if (value.includes("*")) {
            if (value === "*" || value === "**") {
                return true;
            }
            if ((value[0] === "*") && (value[value.length - 1] === "*")) {
                let comp = value.slice(1, value.length - 1);
                if (compareValue.includes(comp)) {
                    return true;
                }
                else {
                    return false;
                }
            }
            if (value[0] === "*") {
                let comp = value.slice(1, value.length);
                let secCompLen = compareValue.length;
                let compLen = comp.length;
                if (compareValue.slice(secCompLen - compLen, secCompLen) !== comp) {
                    return false;
                }
                else {
                    return true;
                }
            }
            if (value[value.length - 1] === "*") {
                let comp = value.slice(0, value.length - 1);
                let compLen = comp.length;
                if (compareValue.slice(0, compLen) !== comp) {
                    return false;
                }
                else {
                    return true;
                }
            }
        }
        return (compareValue === value);
    }
    resolveAND(boolArray) {
        for (let val of boolArray) {
            if (val === false) {
                return false;
            }
        }
        return true;
    }
    resolveOR(boolArray) {
        for (let val of boolArray) {
            if (val === true) {
                return true;
            }
        }
        return false;
    }
}
exports.default = QueryPerformerUtil;
//# sourceMappingURL=QueryPerformerUtil.js.map