"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const SectionValidator_1 = require("./SectionValidator");
const IInsightFacade_1 = require("./IInsightFacade");
class SectionUtils {
    constructor() {
    }
    addSections(id, sectionInfo, metaRef, sectionRef) {
        for (const obj of sectionInfo) {
            let secInfo = obj;
            let validator = new SectionValidator_1.default();
            if (validator.validate(id, secInfo)) {
                let currSection = {
                    id: secInfo[(id + "_id")],
                    dept: secInfo[(id + "_dept")],
                    avg: secInfo[(id + "_avg")],
                    instructor: secInfo[(id + "_instructor")],
                    title: secInfo[(id + "_title")],
                    pass: secInfo[(id + "_pass")],
                    fail: secInfo[(id + "_fail")],
                    audit: secInfo[(id + "_audit")],
                    uuid: secInfo[(id + "_uuid")],
                    year: secInfo[(id + "_year")]
                };
                this.updateSection(id, currSection);
                if (id in sectionRef) {
                    sectionRef[id].push(currSection);
                }
                else {
                    sectionRef[id] = [currSection];
                }
                if (id in metaRef) {
                    metaRef[id].numRows += 1;
                }
                else {
                    let newMeta = {
                        id: id,
                        kind: IInsightFacade_1.InsightDatasetKind.Courses,
                        numRows: 1
                    };
                    metaRef[id] = newMeta;
                }
            }
        }
    }
    updateSection(id, sectionData) {
        sectionData[(id + "_id")] = sectionData["id"];
        sectionData[(id + "_dept")] = sectionData["dept"];
        sectionData[(id + "_avg")] = sectionData["avg"];
        sectionData[(id + "_instructor")] = sectionData["instructor"];
        sectionData[(id + "_title")] = sectionData["title"];
        sectionData[(id + "_pass")] = sectionData["pass"];
        sectionData[(id + "_fail")] = sectionData["fail"];
        sectionData[(id + "_audit")] = sectionData["audit"];
        sectionData[(id + "_uuid")] = sectionData["uuid"];
        sectionData[(id + "_year")] = sectionData["year"];
        delete sectionData["id"];
        delete sectionData["dept"];
        delete sectionData["avg"];
        delete sectionData["instructor"];
        delete sectionData["title"];
        delete sectionData["pass"];
        delete sectionData["fail"];
        delete sectionData["audit"];
        delete sectionData["uuid"];
        delete sectionData["year"];
    }
    savetoJSONCourses(id, sectionDatasets, metaData) {
        let obj = {
            result: sectionDatasets[id],
            numSections: metaData[id].numRows,
            name: id,
            kind: "courses"
        };
        let objStringify = JSON.stringify(obj);
        let name = __dirname + "/../../data/" + id + ".json";
        fs.writeFileSync(name, objStringify, "utf-8");
    }
}
exports.default = SectionUtils;
//# sourceMappingURL=SectionUtils.js.map