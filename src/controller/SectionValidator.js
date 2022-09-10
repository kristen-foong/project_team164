"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SectionValidator {
    constructor() {
    }
    validateId(id, sectionObj) {
        if ("Course" in sectionObj) {
            if (!(typeof sectionObj["Course"] === "string" || typeof sectionObj["Course"] === "number")) {
                return false;
            }
            if (typeof sectionObj["Course"] === "number") {
                sectionObj["Course"] = sectionObj["Course"].toString();
            }
            sectionObj[(id + "_id")] = sectionObj["Course"];
            delete sectionObj["Course"];
        }
        else {
            return false;
        }
        return true;
    }
    validateDept(id, sectionObj) {
        if ("Subject" in sectionObj) {
            if (!(typeof sectionObj["Subject"] === "string")) {
                return false;
            }
            sectionObj[(id + "_dept")] = sectionObj["Subject"];
            delete sectionObj["Subject"];
        }
        else {
            return false;
        }
        return true;
    }
    validateAvg(id, sectionObj) {
        if ("Avg" in sectionObj) {
            if (!(typeof sectionObj["Avg"] === "number")) {
                return false;
            }
            sectionObj[(id + "_avg")] = sectionObj["Avg"];
            delete sectionObj["Avg"];
        }
        else {
            return false;
        }
        return true;
    }
    validateInstructor(id, sectionObj) {
        if ("Instructor" in sectionObj) {
            if (!(typeof sectionObj["Instructor"] === "string")) {
                return false;
            }
            sectionObj[(id + "_instructor")] = sectionObj["Instructor"];
            delete sectionObj["Instructor"];
        }
        else if ("Teacher" in sectionObj) {
            if (!(typeof sectionObj["Teacher"] === "string")) {
                return false;
            }
            sectionObj[(id + "_instructor")] = sectionObj["Teacher"];
            delete sectionObj["Teacher"];
        }
        else if ("Professor" in sectionObj) {
            if (!(typeof sectionObj["Professor"] === "string")) {
                return false;
            }
            sectionObj[(id + "_instructor")] = sectionObj["Professor"];
            delete sectionObj["Professor"];
        }
        else {
            return false;
        }
        return true;
    }
    validateTitle(id, sectionObj) {
        if ("Title" in sectionObj) {
            if (!(typeof sectionObj["Title"] === "string")) {
                return false;
            }
            sectionObj[(id + "_title")] = sectionObj["Title"];
            delete sectionObj["Title"];
        }
        else {
            return false;
        }
        return true;
    }
    validatePass(id, sectionObj) {
        if ("Pass" in sectionObj) {
            if (!(typeof sectionObj["Pass"] === "number")) {
                return false;
            }
            sectionObj[(id + "_pass")] = sectionObj["Pass"];
            delete sectionObj["Pass"];
        }
        else {
            return false;
        }
        return true;
    }
    validateFail(id, sectionObj) {
        if ("Fail" in sectionObj) {
            if (!(typeof sectionObj["Fail"] === "number")) {
                return false;
            }
            sectionObj[(id + "_fail")] = sectionObj["Fail"];
            delete sectionObj["Fail"];
        }
        else {
            return false;
        }
        return true;
    }
    validateAudit(id, sectionObj) {
        if ("Audit" in sectionObj) {
            if (!(typeof sectionObj["Audit"] === "number")) {
                return false;
            }
            sectionObj[(id + "_audit")] = sectionObj["Audit"];
            delete sectionObj["Audit"];
        }
        else {
            return false;
        }
        return true;
    }
    validateUuid(id, sectionObj) {
        if ("id" in sectionObj) {
            if (!(typeof sectionObj["id"] === "string" || typeof sectionObj["id"] === "number")) {
                return false;
            }
            if (typeof sectionObj["id"] === "number") {
                sectionObj["id"] = sectionObj["id"].toString();
            }
            sectionObj[(id + "_uuid")] = sectionObj["id"];
            delete sectionObj["id"];
        }
        else {
            return false;
        }
        return true;
    }
    validateYear(id, sectionObj) {
        if ("Year" in sectionObj) {
            if (!(typeof sectionObj["Year"] === "number" || typeof sectionObj["Year"] === "string")) {
                return false;
            }
            if (typeof sectionObj["Year"] === "string") {
                sectionObj["Year"] = parseInt(sectionObj["Year"], 10);
                if (sectionObj["Section"] === "overall") {
                    sectionObj["Year"] = 1900;
                }
            }
            sectionObj[(id + "_year")] = sectionObj["Year"];
            delete sectionObj["Year"];
        }
        else {
            return false;
        }
        return true;
    }
    validate(id, sectionObj) {
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
exports.default = SectionValidator;
//# sourceMappingURL=SectionValidator.js.map