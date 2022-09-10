import * as fs from "fs";
import Log from "../Util";
import SectionValidator from "./SectionValidator";
import {InsightDataset, InsightDatasetKind, SectionDataset} from "./IInsightFacade";

/**
 * A class that holds accessory methods which interact with our internal data structures
 * This one specifically interacts with our sectionDatasets
 */
export default class SectionUtils {

    constructor() {
        // Log.trace("Created SectionUtils.");
    }

    // Adds course sections to our data structures
    public addSections(id: string, sectionInfo: object[], metaRef: any, sectionRef: any): any {
        // let validatedSections: CourseSection[] = new CourseSection[];
        for (const obj of sectionInfo) {
            let secInfo: any = obj;
            let validator: SectionValidator = new SectionValidator();
            if (validator.validate(id, secInfo)) {
                // create new course section
                let currSection: SectionDataset = {
                    id: secInfo[(id + "_id")],
                    dept: secInfo[(id + "_dept")], // take a look at this
                    avg: secInfo[(id + "_avg")],
                    instructor: secInfo[(id + "_instructor")], // may need to look at this
                    title: secInfo[(id + "_title")],
                    pass: secInfo[(id + "_pass")],
                    fail: secInfo[(id + "_fail")],
                    audit: secInfo[(id + "_audit")],
                    uuid: secInfo[(id + "_uuid")], // want to parse this into string
                    year: secInfo[(id + "_year")] // want to parse this as a numeric
                };
                // Update the key-value names
                this.updateSection(id, currSection);

                if (id in sectionRef) {
                    sectionRef[id].push(currSection);
                } else {
                    sectionRef[id] = [currSection];
                }

                // Update metaData
                if (id in metaRef) {
                    metaRef[id].numRows += 1;
                } else {
                    let newMeta: InsightDataset = {
                        id: id,
                        kind: InsightDatasetKind.Courses,
                        numRows: 1
                    };
                    metaRef[id] = newMeta;
                }
            }
        }
    }

    // updates our section with appropriate key-value pairs
    public updateSection(id: string, sectionData: any): void {
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

    // saves JSON file to disk for Courses
    public savetoJSONCourses(id: string, sectionDatasets: any, metaData: any): void {
        // Create the obj that we will end up saving to disk
        let obj = {
            result: sectionDatasets[id],
            numSections: metaData[id].numRows,
            name: id,
            kind: "courses"
        };
        let objStringify = JSON.stringify(obj); // Need to convert into JSON string
        let name: string = __dirname + "/../../data/" + id + ".json";
        fs.writeFileSync(name, objStringify, "utf-8");
    }
}
