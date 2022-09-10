// Ref: https://stackoverflow.com/questions/9882284/looping-through-array-and-removing-items-without-breaking-for-loop
import {
    IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError, ResultTooLargeError, SectionDataset
} from "./IInsightFacade";

export default class QueryPerformerOld {

    constructor() {
        // Nothing for now
    }

    public performQueryMAIN(query: any, courseSections: any[]): any {
        // split up the query
        let whereBlock = query["WHERE"];
        let optionsBlock = query["OPTIONS"];

        let filteredData: any[] = this.performWHERE(whereBlock, courseSections); // first call
        if (filteredData.length > 5000) {
            return Promise.reject(new ResultTooLargeError());
        }
        return this.performOPTIONS(optionsBlock, filteredData); // second call
    }

    // For each case, iterate over each section, pass into checker with section, remove if conditions not met
    // This needs to return an array of courseSections!
    public performWHERE(whereBlock: any, courseSections: any[]): any[] {
        // Simple cases
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
        // Complex cases -> worry about later
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

    // For each case, iterate over each section, pass into checker with section, remove if conditions not met
    // You want each of these functions to return the array!
    private removalNOT(courseSections: any[], whereBlock: any) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            // Pass the section into checkNOT, along with the query, should we remove it?
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1); // If condition not met, remove the section!
            }
        }
        return courseSections;
    }

    private removalOR(courseSections: any[], whereBlock: any) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1); // If condition not met, remove the section!
            }
        }
        return courseSections;
    }

    private removalAND(courseSections: any[], whereBlock: any) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1); // If condition not met, remove the section!
            }
        }
        return courseSections;
    }

    private removalIS(courseSections: any[], whereBlock: any) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1); // If condition not met, remove the section!
            }
        }
        return courseSections;
    }

    private removalLT(courseSections: any[], whereBlock: any) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1); // If condition not met, remove the section!
            }
        }
        return courseSections;
    }

    private removalEQ(courseSections: any[], whereBlock: any) {
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1); // If condition not met, remove the section!
            }
        }
        return courseSections;
    }

    private removalGT(courseSections: any[], whereBlock: any) {
        // local variable
        for (let i = courseSections.length - 1; i >= 0; i--) {
            if (!this.checker(whereBlock, courseSections[i])) {
                courseSections.splice(i, 1); // If condition not met, remove the section!
            }
        }
        return courseSections;
    }

// Handles recursive calls for complex cases
    public checker(anyBlock: any, section: any): boolean {
        // GT case
        if ("GT" in anyBlock) {
            return this.checkGT(anyBlock["GT"], section);
        }
        // LT case
        if ("LT" in anyBlock) {
            return this.checkLT(anyBlock["LT"], section);
        }
        // EQ case
        if ("EQ" in anyBlock) {
            return this.checkEQ(anyBlock["EQ"], section);
        }
        // IS case
        if ("IS" in anyBlock) {
            return this.checkIS(anyBlock["IS"], section);
        }
        // Complex cases -> recursive calls to checker for each obj inside! Create an 'any' array
        // AND case
        if ("AND" in anyBlock) {
            // We push each call into the array, passing in the anyBlock["AND"] along with the section
            // Return a function that passes the array in as an argument and returns true if all are true
            let boolArray: boolean[] = [];
            anyBlock["AND"].forEach((element: any) => {
                boolArray.push(this.checker(element, section));
            });
            return this.resolveAND(boolArray);
        }
        // OR case
        if ("OR" in anyBlock) {
            // We push each call into the array, passing in the anyBlock["OR"] along with the section
            // Return a function that passes the array in as an argument and returns true if at least one is true
            let boolArray: boolean[] = [];
            anyBlock["OR"].forEach((element: any) => {
                boolArray.push(this.checker(element, section));
            });
            return this.resolveOR(boolArray);
        }
        // NOT case
        if ("NOT" in anyBlock) {
            // tentative...unsure if correct
            return (!this.checker(anyBlock["NOT"], section));
        }
    }

    public checkGT(GTblock: any, section: any): boolean {
        // returns true if condition met, false otherwise
        // can check course_avg, course_pass, course_fail, course_audit, course_year
        // Grab the key and value of the object in GTblock (always the first one, only have one)
        let Key: any = Object.keys(GTblock)[0];
        let Value: any = Object.values(GTblock)[0];
        // Grab the value in section at that key!
        let compareValue: any = section[Key];
        // Compare the values
        return (compareValue > Value); // return true if exclusively greater!
    }

    public checkLT(LTblock: any, section: any): boolean {
        // returns true if condition met, false otherwise
        // can check course_avg, course_pass, course_fail, course_audit, course_year
        // Grab the key and value of the object in LTblock (always the first one, only have one)
        let Key: any = Object.keys(LTblock)[0];
        let Value: any = Object.values(LTblock)[0];
        // Grab the value in section at that key!
        let compareValue: any = section[Key];
        // Compare the values
        return (compareValue < Value); // return true if exclusively less than!
    }

    public checkEQ(EQblock: any, section: any): boolean {
        // returns true if condition met, false otherwise
        // can check course_avg, course_pass, course_fail, course_audit, course_year
        // Grab the key and value of the object in EQblock (always the first one, only have one)
        let Key: any = Object.keys(EQblock)[0];
        let Value: any = Object.values(EQblock)[0];
        // Grab the value in section at that key!
        let compareValue: any = section[Key];
        // Compare the values
        return (compareValue === Value); // return true if exclusively less than!
    }

    public checkIS(ISblock: any, section: any): boolean {
        // Grab sKey, value, and comparator
        let sKey: any = Object.keys(ISblock)[0];
        let value: any = Object.values(ISblock)[0];
        let compareValue: any = section[sKey];

        // check asterisks
        if (value.includes("*")) {
            if (value === "*" || value === "**") {
                return true;
            }
            if ((value[0] === "*") && (value[value.length - 1] === "*")) {
                let comp: string = value.slice(1, value.length - 1);
                if (compareValue.includes(comp)) {
                    return true;
                } else {
                    return false;
                }
            }
            if (value[0] === "*") {
                // get everything behind asterisk
                let comp: string = value.slice(1, value.length);
                // check if end of section key contains same string
                let secCompLen: number = compareValue.length;
                let compLen: number = comp.length;
                if (compareValue.slice(secCompLen - compLen, secCompLen) !== comp) {
                    return false;
                } else {
                    return true;
                }
            }
            if (value[value.length - 1] === "*") {
                // get everything before asterisk
                let comp: string = value.slice(0, value.length - 1);
                // check if end of section key contains same string
                let compLen: number = comp.length;
                if (compareValue.slice(0, compLen) !== comp) {
                    return false;
                } else {
                    return true;
                }
            }
        }
        return (compareValue === value);
    }
    // do not need checkAND/checkOR, but do we need checkNOT?

    public resolveAND(boolArray: boolean[]) {
        for (let val of boolArray) {
            if (val === false) {
                return false;
            }
        }
        return true;
    }

    public resolveOR(boolArray: boolean[]) {
        for (let val of boolArray) {
            if (val === true) {
                return true;
            }
        }
        return false;
    }

    // perform options
    public performOPTIONS(optionsBlock: any, courseSections: any[]): any[] {
        let columns: string[] = optionsBlock["COLUMNS"];
        let order: string;
        // For each course section
        for (let section of courseSections) {
            // Check every string in the columns
            // Get the keys of our section
            let sectionKeys: string[] = Object.keys(section);
            for (let secKey of sectionKeys) {
                if (!columns.includes(secKey)) {
                    delete section[secKey];
                }
            }
        }

        // sort section data according to order
        if ("ORDER" in optionsBlock) {
            order = optionsBlock["ORDER"];
            courseSections.sort(function (a: any, b: any) {
                let aOrder: any = a[order];
                let bOrder: any = b[order];
                return a[order] - b[order];
            });
        }

        // by here, courseSections should contain the sorted & filtered data
        return courseSections;
    }

}
