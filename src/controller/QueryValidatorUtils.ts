import Log from "../Util";
import apply = Reflect.apply;

const courseNumericFields: string[] = ["avg", "pass", "fail", "audit", "year"];
const roomNumericFields: string[] = ["lat", "lon", "seats"];
const courseStringFields: string[] = ["dept", "id", "uuid", "instructor", "title"];
const roomStringFields: string[] = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
const numericTokens: string[] = ["MAX", "MIN", "AVG", "SUM"];
const anyTokens: string[] = ["COUNT"];

export default class QueryValidatorUtils {
    private courseNumericFields: string[];
    private roomNumericFields: string[];
    private courseStringFields: string[];
    private roomStringFields: string[];
    private numericTokens: string[];
    private anyTokens: string[];

    constructor() {
        // Log.trace("Created QueryValidatorUtils.");
        this.courseNumericFields = ["avg", "pass", "fail", "audit", "year"];
        this.roomNumericFields = ["lat", "lon", "seats"];
        this.courseStringFields = ["dept", "id", "uuid", "instructor", "title"];
        this.roomStringFields = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
        this.numericTokens = ["MAX", "MIN", "AVG", "SUM"];
        this.anyTokens = ["COUNT"];
    }

    public checkValidNumericKey(numericKey: string, kind: string, idLocal: string): boolean {
        // Case 1: "courses"
        if (kind === "courses") {
            // id + one of (numericCourses) == numericKey
            for (const elem of this.courseNumericFields) {
                if (numericKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
        // Case 2: "rooms"
        if (kind === "rooms") {
            // id + one of (numericRooms) == numericKey
            for (const elem of this.roomNumericFields) {
                if (numericKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
    }

    public checkValidStringKey(stringKey: string, kind: string, idLocal: string): boolean {
        // Case 1: "courses"
        if (kind === "courses") {
            // id + one of (numericCourses) == numericKey
            for (const elem of this.courseStringFields) {
                if (stringKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
        // Case 2: "rooms"
        if (kind === "rooms") {
            // id + one of (numericRooms) == numericKey
            for (const elem of this.roomStringFields) {
                if (stringKey === (idLocal + "_" + elem)) {
                    return true;
                }
            }
            return false;
        }
    }

    public checkApplyKey(applyKey: string): boolean {
        return (!applyKey.includes("_") && applyKey !== "");
    }

    public populateApplyKeys(columnKeys: string[], applyKeys: string[], kind: string, idLocal: string): void {
        // for each elem inside, if applyKey, then push to field
        for (const elem of columnKeys) {
            if (this.checkApplyKey(elem)) {
                applyKeys.push(elem);
            }
        }
    }

    public resolveArray(boolArray: boolean[]): boolean {
        for (const elem of boolArray) {
            if (elem === false) {
                return false;
            }
        }
        return true;
    }

    public isEqual(Array1: string[], Array2: string[]): boolean {
        // Array 1 is subset of Array 2
        for (const elem of Array1) {
            if (!Array2.includes(elem)) {
                return false;
            }
        }
        // Array 2 is subset of Array 1
        for (const elem of Array2) {
            if (!Array1.includes(elem)) {
                return false;
            }
        }
        return true;
    }

    public isUnique(applyKeys: string[]): boolean {
        let seenKeys: string[] = [];
        for (const elem of applyKeys) {
            if (!seenKeys.includes(elem)) {
                seenKeys.push(elem);
            } else {
                return false;
            }
        }
        return true;
    }

    public validateAPPLYRULE(applyRule: any, kind: string, idLocal: string): boolean {
        const applyTOKEN: any = Object.keys(applyRule)[0];
        const tokenKEY: any = Object.values(applyRule)[0];
        if (this.numericTokens.includes(applyTOKEN)) {
            // handle numeric case
            if (this.checkValidNumericKey(tokenKEY, kind, idLocal)) {
                return true;
            }
        }
        if (this.anyTokens.includes(applyTOKEN)) {
            // handle any case
            if (this.checkValidNumericKey(tokenKEY, kind, idLocal) ||
                this.checkValidStringKey(tokenKEY, kind, idLocal)) {
                return true;
            }
        }
        return false; // incorrect token/any other case
    }

    public validateCOLUMNKeys(colKeys: any): any {
        let ourKind: string = "";
        let ourID: string = "";

        for (const column of colKeys) {
            const index: number = column.indexOf("_");

            // We have an applykey -> can skip this check!
            if (index === -1) {
                // Do nothing
            }

            if (ourID === "" && index !== -1) {
                ourID = column.substr(0, index);
                ourKind = this.getKindofField(column.substr(index + 1, column.length));
                if (typeof ourKind === "boolean") {
                    return ourKind; // false case
                }
            } else if (index !== -1) {
                let nextID = column.substr(0, index);
                let nextKind = this.getKindofField(column.substr(index + 1, column.length));
                if (ourID !== nextID) {
                    return false;
                }
                if (typeof nextKind === "boolean") {
                    return ourKind; // false case
                }
                if (nextKind !== ourKind) {
                    return false;
                }
            }
        }
        return [ourID, ourKind];
    }

    public getKindofField(field: string): any {
        if (this.courseNumericFields.includes(field) || this.courseStringFields.includes(field)) {
            return "courses";
        } else if (this.roomNumericFields.includes(field) || this.roomStringFields.includes(field)) {
            return "rooms";
        } else {
            return false; // its just something else
        }
    }

    public colAndGroupKeys(colKeys: any, groupKeys: any): boolean {
        // return true if all groupKeys are in colKeys
        let colOnlyKeys: string[] = []; // "rooms_shortname", "rooms_lat"
        // groupKeys = "rooms_shortname", "rooms_lat", "rooms_lon"

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

    public checkApplyKeys(applyKeysInCol: string[], applyKeysInGroup: string[]): boolean {
        // applyKeysInCol = ["overallAVG"], applyKeysInGroup = ["overallAVG", "overallSUM"]
        for (const elem of applyKeysInCol) {
            if (!applyKeysInGroup.includes(elem)) {
                return false;
            }
        }
        return true;
    }


}
