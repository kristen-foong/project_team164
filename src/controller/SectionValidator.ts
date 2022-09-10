/**
 * This is a validation class
 * All our validation methods are encapsulated inside
 * If we want to call, we need to make an object of this class
 */
import Log from "../Util";

export default class SectionValidator {

    constructor() {
        // Log.trace("Created SectionValidator.");
    }

    // validate courses_id; string
    // accept string or number; change to string
    // change key of sectionObj to "courses_id", and value to string
    /**
     * Do we have "Course" key in our object? If no -> return false
     * Is our value a string or a number? If a string (do nothing), if a number (parse to string), else -> return false
     * Need to change our key to "courses_id"
     */
    public validateId(id: string, sectionObj: any): boolean {
        if ("Course" in sectionObj) {
            if (!(typeof sectionObj["Course"] === "string" || typeof sectionObj["Course"] === "number")) {
                return false;
            }
            // parse as string
            if (typeof sectionObj["Course"] === "number") {
                // parse as string
                sectionObj["Course"] = sectionObj["Course"].toString();
            }
            // change key to courses_id
            sectionObj[(id + "_id")] = sectionObj["Course"];
            delete sectionObj["Course"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_dept; string
    // only accept a number
    // change key of sectionObj to "courses_dept"
    /**
     * Do we have "Subject" in our object. If no -> return false
     * Is our value a string? If not -> return false
     * Need to change our key to "courses_dept"
     */
    public validateDept(id: string, sectionObj: any): boolean {
        if ("Subject" in sectionObj) {
            if (!(typeof sectionObj["Subject"] === "string")) {
                return false;
            }
            // change key to courses_dept
            sectionObj[(id + "_dept")] = sectionObj["Subject"];
            delete sectionObj["Subject"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_avg; number
    // only accept a number (may need to look again; missed string)
    // change key of sectionObj to "courses_avg"
    /**
     * Do we have a "Avg" key in our object? If no -> return false
     * Is our value a number? If no -> return false
     * Need to change our key to "courses_avag"
     */
    public validateAvg(id: string, sectionObj: any): boolean {
        if ("Avg" in sectionObj) {
            if (!(typeof sectionObj["Avg"] === "number")) {
                return false;
            }
            sectionObj[(id + "_avg")] = sectionObj["Avg"];
            delete sectionObj["Avg"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_instructor; string
    // only accept a string
    // change key of sectionObj to "courses_instructor"
    /**
     * Do we have an "Teacher", "Instructor", or "Professor" key in our object? If no -> return false
     * Is our value a string? If no -> return false
     * Need to change our key to "courses_instructor"
     */
    public validateInstructor(id: string, sectionObj: any): boolean {
        // check if Instructor
        if ("Instructor" in sectionObj) {
            if (!(typeof sectionObj["Instructor"] === "string")) {
                return false;
            }
            // set key as courses_instructor
            sectionObj[(id + "_instructor")] = sectionObj["Instructor"];
            delete sectionObj["Instructor"];
        } else if
            ("Teacher" in sectionObj) {
            if (!(typeof sectionObj["Teacher"] === "string")) {
                return false;
            }
            // set key as courses_instructor
            sectionObj[(id + "_instructor")] = sectionObj["Teacher"];
            delete sectionObj["Teacher"];
        } else if
        ("Professor" in sectionObj) {
            if (!(typeof sectionObj["Professor"] === "string")) {
                return false;
            }
            // set key as courses_instructor
            sectionObj[(id + "_instructor")] = sectionObj["Professor"];
            delete sectionObj["Professor"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_title; string'
    // only as string
    // change key of sectionObj to "courses_title"
    /**
     * Do we have a "Title" key in our object? If no -> return false
     * Is our value a string? If no -> return false
     * Need to change our key to "courses_title"
     */
    public validateTitle(id: string, sectionObj: any): boolean {
        if ("Title" in sectionObj) {
            if (!(typeof sectionObj["Title"] === "string")) {
                return false;
            }
            sectionObj[(id + "_title")] = sectionObj["Title"];
            delete sectionObj["Title"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_pass; number
    // only as number (may need to look again; missed string)
    // change key of sectionObj to "courses_pass"
    /**
     * Do we have a "Pass" key in our object? If no -> return false
     * Is our value a number? If no -> return false
     * Need to change our key to "courses_pass"
     */
    public validatePass(id: string, sectionObj: any): boolean {
        if ("Pass" in sectionObj) {
            if (!(typeof sectionObj["Pass"] === "number")) {
                return false;
            }
            sectionObj[(id + "_pass")] = sectionObj["Pass"];
            delete sectionObj["Pass"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_fail; number
    // only as number (may need to look again; missed string)
    // change key of setionObj to "courses_fail"
    /**
     * Do we have a "Fail" key in our object? If no -> return false
     * Is our value a number? If no -> return false
     * Need to change our key to "courses_fail"
     */
    public validateFail(id: string, sectionObj: any): boolean {
        if ("Fail" in sectionObj) {
            if (!(typeof sectionObj["Fail"] === "number")) {
                return false;
            }
            sectionObj[(id + "_fail")] = sectionObj["Fail"];
            delete sectionObj["Fail"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_audit; number
    // only as a number (may need to look again; missed string)
    // change key of sectionObj to "courses_audit"
    /**
     * Do we have an "Audit" key in our object? If no -> return false
     * Is our value a number? If no -> return false
     * Need to change our key to "courses_audit"
     */
    public validateAudit(id: string, sectionObj: any): boolean {
        if ("Audit" in sectionObj) {
            if (!(typeof sectionObj["Audit"] === "number")) {
                return false;
            }
            sectionObj[(id + "_audit")] = sectionObj["Audit"];
            delete sectionObj["Audit"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_uuid; string
    // only as a string (may need to look again; missed number)
    /**
     * Do we have a "id" key in our object? if no -> return false
     * Is our value a string? If no -> return false
     * Need to change our key to "courses_uuid"
     */
    public validateUuid(id: string, sectionObj: any): boolean {
        if ("id" in sectionObj) {
            if (!(typeof sectionObj["id"] === "string" || typeof sectionObj["id"] === "number")) {
                return false;
            }
            // parse as string
            if (typeof sectionObj["id"] === "number") {
                // parse as string
                sectionObj["id"] = sectionObj["id"].toString();
            }
            // change key to courses_id
            sectionObj[(id + "_uuid")] = sectionObj["id"];
            delete sectionObj["id"];
        } else {
            return false;
        }
        return true;
    }

    // validate courses_year; as a number
    // only as a number (but may be passed in as a string)
    /**
     * Do we have a "Year" key in our object? If no -> return false
     * Is our value a string or a number? If no -> return false
     * Need to change our key to "courses_year"
     */
    public validateYear(id: string, sectionObj: any): boolean {
        if ("Year" in sectionObj) {
            if (!(typeof sectionObj["Year"] === "number" || typeof sectionObj["Year"] === "string")) {
                return false;
            }
            // parse as numeric
            if (typeof sectionObj["Year"] === "string") {
                sectionObj["Year"] = parseInt(sectionObj["Year"], 10);
                if (sectionObj["Section"] === "overall") {
                    sectionObj["Year"] = 1900;
                }
            }
            sectionObj[(id + "_year")] = sectionObj["Year"];
            delete sectionObj["Year"];
        } else {
            return false;
        }
        return true;
    }

    public validate(id: string, sectionObj: any): boolean {
        if (this.validateId(id, sectionObj) && this.validateDept(id, sectionObj) && this.validateAvg(id, sectionObj) &&
            this.validateInstructor(id, sectionObj) && this.validateTitle(id, sectionObj) &&
            this.validatePass(id, sectionObj) && this.validateFail(id, sectionObj) &&
            this.validateAudit(id, sectionObj) && this.validateUuid(id, sectionObj) &&
            this.validateYear(id, sectionObj)) {
            return true;
        }
        return false;
    }
}
