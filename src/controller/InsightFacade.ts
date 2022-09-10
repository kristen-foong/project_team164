import * as JSZip from "jszip";
import * as fs from "fs";
import Log from "../Util";
import {
    IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError, RoomDataset, SectionDataset
} from "./IInsightFacade";
import QueryPerformerOld from "./QueryPerformerOld";
import SectionUtils from "./SectionUtils";
import QueryValidatorC2 from "./QueryValidatorC2";
import QueryPerformer from "./QueryPerformer";
import RoomUtils from "./RoomUtils";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    private metaData: {[id: string]: InsightDataset};
    private sectionDatasets: {[id: string]: SectionDataset[]};
    private roomDatasets: {[id: string]: RoomDataset[]};
    private SectionUtils: SectionUtils;
    private RoomUtils: RoomUtils;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.metaData = {};
        this.sectionDatasets = {};
        this.roomDatasets = {};
        this.SectionUtils = new SectionUtils();
        this.RoomUtils = new RoomUtils();
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        // check if valid, reject on invalid
        if (!this.checkvalidID(id, true)) {
            return Promise.reject(new InsightError("Invalid id!"));
        }
        // adding courses || rooms
        if (kind === "courses") {
            return this.addDatasetSections(id, content);
        }
        if (kind === "rooms") {
            return this.addDatasetRooms(id, content);
        }
        return Promise.reject(new InsightError("Invalid query string!"));
    }

    // Handles adding sections to our data structures
    public addDatasetSections(id: string, content: string): Promise<string[]> {
        let zip = new JSZip();
        return new Promise<string[]> ((resolve, reject) => {
            zip.loadAsync(content, {base64: true})
                // On our load, our result is a JSZip object
                .then((result) => {
                    let promiseArray: Array<Promise<string>> = []; // Array to hold Promises
                    // For each JSON file in folder
                    result.folder("courses").forEach((relativePath, file) => {
                        let promiseFileRead: Promise<any> = file.async("string");
                        promiseArray.push(promiseFileRead); // push Promise into promiseArray
                        // How do we handle cases where the file is corrupted?
                    });
                    // Once completed adding promises to array of promises
                    Promise.all(promiseArray)
                        .then((values) => {
                            for (const elem of values) {
                                // Conditional check? Only add if it is a JSON string!
                                try {
                                    const jsonData = JSON.parse(elem); // parse as JSON
                                    this.SectionUtils.addSections(id, jsonData.result,
                                        this.metaData, this.sectionDatasets); // pass in array of obj
                                } catch {
                                    // Does not add course sections (cannot be parsed)
                                }
                            }
                            // Conditional check
                            if (this.metaData[id] === undefined) {
                                return reject(new InsightError("Invalid files in zip"));
                            }
                            this.SectionUtils.savetoJSONCourses(id, this.sectionDatasets, this.metaData);
                            return resolve(Object.keys(this.metaData));
                        });
                }).catch((error: any) => {
                return reject(new InsightError("Invalid zip"));
            });
        });
    }

    // TODO: Major issue, this needs to be made synchronous! Must wait for this.parseHTML to finish before return
    // TODO: Redo this function, in parts, in order to force synchronous execution
    public addDatasetRooms(id: string, content: string): Promise<string[]> {
        let zip = new JSZip();
        return new Promise<string[]>((resolve, reject) => {
            zip.loadAsync(content, {base64: true})
                .then((result) => {
                    let promiseArray: Array<Promise<string>> = [];
                    result.folder("rooms").forEach((relativePath, file) => {
                        if (file.name === "rooms/index.htm") {
                            let promiseFileRead: Promise<any> = file.async("string");
                            promiseArray.push(promiseFileRead);
                        }
                    });
                    const final1 = this.PromiseHelper(promiseArray, id, this.metaData, this.roomDatasets, result)
                        .then((r) => {
                            // Conditional check
                            if (this.metaData[id] === undefined) {
                                return reject(new InsightError("Invalid files in zip!"));
                            }
                            this.RoomUtils.savetoJSONRooms(id, this.roomDatasets, this.metaData);
                            return resolve(Object.keys(this.metaData));
                        }).catch((error: any) => {
                            return reject(new InsightError("Error in parsing"));
                        });
                }).catch((error: any) => {
                    return reject(new InsightError("Invalid zip!"));
            });
        });
    }

    public PromiseHelper(promiseArray: any, id: string, metaRef: any, roomRef: any, result: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.PromiseHelperArray(promiseArray)
                .then((r) => {
                    return resolve(this.RoomUtils.parseHTML(id, r, this.metaData, this.roomDatasets, result));
                }).catch((error: any) => {
                    return reject(new InsightError("Issue"));
            });
        });
    }

    public PromiseHelperArray(promiseArray: any): Promise<string> {
        return new Promise<any>((resolve, reject) => {
            Promise.all(promiseArray)
                .then((values) => {
                    return resolve(values[0]);
            }).catch((error: any) => {
                return reject(new InsightError("Issue"));
            });
        });
    }

    public checkvalidID(id: string, add: boolean): boolean {
        // check if not a string
        if (typeof id !== "string") {
            return false;
        }
        // check if all whitespace
        const stripped = id.replace(/\s+/g, "");
        if (stripped.length === 0) {
            return false;
        }
        // check if underscore
        if (id.includes("_")) {
            return false;
        }
        // duplicate add case
        if (add) {
            if (this.metaData[id] !== undefined) {
                return false;
            }
        }
        return true; // successful validation
    }

    // TODO: modify the logic of this so it can remove rooms as well
    public removeDataset(id: string): Promise<string> {
        // validID check
        if (!this.checkvalidID(id, false)) {
            return Promise.reject(new InsightError("Invalid id!"));
        }
        // Got rid of NotFoundError, from not finding in local data strucutre
        // -> reasoning is that it could still exist in the disk!
        // -> hence the only time we get NotFoundError is below

        const fse = require("fs-extra");
        // create a Promise object, resolve and reject case
        return new Promise<string>((resolve, reject) => {
            // First check member field -> If contained remove
            if (this.metaData[id] !== undefined) {
                // Remove metaData and modify sectionDatasets/roomDatasets
                delete this.metaData[id];
                delete this.sectionDatasets[id];
                delete this.roomDatasets[id]; // temp fix -> may need to rework logic here?
                // check data directory
                let path: string = __dirname + "/../../data/" + id + ".json";
                fse.remove(path).then(() => {
                    return resolve(id);
                });
            } else {
                // check data directory (if still not found, return error
                let path: string = __dirname + "/../../data/" + id + ".json";
                if (!fs.existsSync(path)) {
                    return reject(new NotFoundError("file not found!"));
                }
                fse.remove(path).then(() => {
                    return resolve(id);
                });
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return new Promise<InsightDataset[]> ((resolve, reject) => {
            return resolve(Object.values(this.metaData));
        });
    }

    public performQuery(query: any): Promise<any[]> {
        return new Promise<any[]> ((resolve, reject) => {
            const QueryHelper: QueryValidatorC2 = new QueryValidatorC2(); // validator
            const queryPerformer: QueryPerformer = new QueryPerformer(); // performer
            const valArray: any = QueryHelper.queryValidator(query); // i0 is iD, i1 is kind, i2 is valid
            if (valArray[2] === true) {
                // our query is valid
                const queryID: string = valArray[0]; // The id we wish to query
                const queryKind: string = valArray[1];
                if (this.metaData[queryID] === undefined) { // If id does not exist, perform load
                    this.loadDataset(queryID)
                        .then((r) => {
                            let dataToQuery: any;
                            if (queryKind === "courses") {
                                dataToQuery = JSON.parse(JSON.stringify(this.sectionDatasets[queryID]));
                            } else {
                                dataToQuery = JSON.parse(JSON.stringify(this.roomDatasets[queryID]));
                            }
                            let queryResult: any[] = queryPerformer.QueryPerformer(query, dataToQuery);
                            return resolve(queryResult);
                        }).catch((err) => {
                            return reject(new InsightError("file does not exist with that id, please add!"));
                    });
                } else {
                    let dataToQuery: any;
                    if (queryKind === "courses") {
                        dataToQuery = JSON.parse(JSON.stringify(this.sectionDatasets[queryID]));
                    } else {
                        dataToQuery = JSON.parse(JSON.stringify(this.roomDatasets[queryID]));
                    }
                    let queryResult: any[] = queryPerformer.QueryPerformer(query, dataToQuery);
                    return resolve(queryResult);
                }
            } else {
                return reject(new InsightError("Invalid Query!"));
            }
        });
    }


    // Called if the id being queried on does not exist in the local object -> need to look in directory!
    public loadDataset(id: string): Promise<any> {
        return new Promise<any> ((resolve, reject) => {
            const directoryPath: string = __dirname + "/../../data/";
            const fileName: string = id + ".json";
            const filePath: string = directoryPath + fileName;
            this.readFile(filePath).then((result) => {
                const JSONData: any = JSON.parse(result); // parse our data
                // update local data structures
                if (JSONData["kind"] === InsightDatasetKind.Courses) {
                    // update sections
                    this.sectionDatasets[id] = JSONData["result"];
                } else {
                    // update rooms
                    this.roomDatasets[id] = JSONData["result"];
                }
                let newMeta: InsightDataset = {
                    id: id,
                    kind: JSONData["kind"],
                    numRows: JSONData["numRooms"]
                };
                this.metaData[id] = newMeta; // modify metaData
                return resolve("Completed load");
            }).catch((error: any) => {
                return reject(new InsightError("file does not exist with that id, please addDataset"));
            });
        });
    }

    public readFile(path: string): Promise<any> {
        return new Promise<any> ((resolve, reject) => {
            fs.readFile(path, "utf-8", (err, data) => {
                return resolve(data);
            });
        });
    }
}
