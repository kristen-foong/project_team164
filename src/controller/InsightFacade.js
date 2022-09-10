"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JSZip = require("jszip");
const fs = require("fs");
const Util_1 = require("../Util");
const IInsightFacade_1 = require("./IInsightFacade");
const SectionUtils_1 = require("./SectionUtils");
const QueryValidatorC2_1 = require("./QueryValidatorC2");
const QueryPerformer_1 = require("./QueryPerformer");
const RoomUtils_1 = require("./RoomUtils");
class InsightFacade {
    constructor() {
        Util_1.default.trace("InsightFacadeImpl::init()");
        this.metaData = {};
        this.sectionDatasets = {};
        this.roomDatasets = {};
        this.SectionUtils = new SectionUtils_1.default();
        this.RoomUtils = new RoomUtils_1.default();
    }
    addDataset(id, content, kind) {
        if (!this.checkvalidID(id, true)) {
            return Promise.reject(new IInsightFacade_1.InsightError("Invalid id!"));
        }
        if (kind === "courses") {
            return this.addDatasetSections(id, content);
        }
        if (kind === "rooms") {
            return this.addDatasetRooms(id, content);
        }
        return Promise.reject(new IInsightFacade_1.InsightError("Invalid query string!"));
    }
    addDatasetSections(id, content) {
        let zip = new JSZip();
        return new Promise((resolve, reject) => {
            zip.loadAsync(content, { base64: true })
                .then((result) => {
                let promiseArray = [];
                result.folder("courses").forEach((relativePath, file) => {
                    let promiseFileRead = file.async("string");
                    promiseArray.push(promiseFileRead);
                });
                Promise.all(promiseArray)
                    .then((values) => {
                    for (const elem of values) {
                        try {
                            const jsonData = JSON.parse(elem);
                            this.SectionUtils.addSections(id, jsonData.result, this.metaData, this.sectionDatasets);
                        }
                        catch (_a) {
                        }
                    }
                    if (this.metaData[id] === undefined) {
                        return reject(new IInsightFacade_1.InsightError("Invalid files in zip"));
                    }
                    this.SectionUtils.savetoJSONCourses(id, this.sectionDatasets, this.metaData);
                    return resolve(Object.keys(this.metaData));
                });
            }).catch((error) => {
                return reject(new IInsightFacade_1.InsightError("Invalid zip"));
            });
        });
    }
    addDatasetRooms(id, content) {
        let zip = new JSZip();
        return new Promise((resolve, reject) => {
            zip.loadAsync(content, { base64: true })
                .then((result) => {
                let promiseArray = [];
                result.folder("rooms").forEach((relativePath, file) => {
                    if (file.name === "rooms/index.htm") {
                        let promiseFileRead = file.async("string");
                        promiseArray.push(promiseFileRead);
                    }
                });
                const final1 = this.PromiseHelper(promiseArray, id, this.metaData, this.roomDatasets, result)
                    .then((r) => {
                    if (this.metaData[id] === undefined) {
                        return reject(new IInsightFacade_1.InsightError("Invalid files in zip!"));
                    }
                    this.RoomUtils.savetoJSONRooms(id, this.roomDatasets, this.metaData);
                    return resolve(Object.keys(this.metaData));
                }).catch((error) => {
                    return reject(new IInsightFacade_1.InsightError("Error in parsing"));
                });
            }).catch((error) => {
                return reject(new IInsightFacade_1.InsightError("Invalid zip!"));
            });
        });
    }
    PromiseHelper(promiseArray, id, metaRef, roomRef, result) {
        return new Promise((resolve, reject) => {
            this.PromiseHelperArray(promiseArray)
                .then((r) => {
                return resolve(this.RoomUtils.parseHTML(id, r, this.metaData, this.roomDatasets, result));
            }).catch((error) => {
                return reject(new IInsightFacade_1.InsightError("Issue"));
            });
        });
    }
    PromiseHelperArray(promiseArray) {
        return new Promise((resolve, reject) => {
            Promise.all(promiseArray)
                .then((values) => {
                return resolve(values[0]);
            }).catch((error) => {
                return reject(new IInsightFacade_1.InsightError("Issue"));
            });
        });
    }
    checkvalidID(id, add) {
        if (typeof id !== "string") {
            return false;
        }
        const stripped = id.replace(/\s+/g, "");
        if (stripped.length === 0) {
            return false;
        }
        if (id.includes("_")) {
            return false;
        }
        if (add) {
            if (this.metaData[id] !== undefined) {
                return false;
            }
        }
        return true;
    }
    removeDataset(id) {
        if (!this.checkvalidID(id, false)) {
            return Promise.reject(new IInsightFacade_1.InsightError("Invalid id!"));
        }
        const fse = require("fs-extra");
        return new Promise((resolve, reject) => {
            if (this.metaData[id] !== undefined) {
                delete this.metaData[id];
                delete this.sectionDatasets[id];
                delete this.roomDatasets[id];
                let path = __dirname + "/../../data/" + id + ".json";
                fse.remove(path).then(() => {
                    return resolve(id);
                });
            }
            else {
                let path = __dirname + "/../../data/" + id + ".json";
                if (!fs.existsSync(path)) {
                    return reject(new IInsightFacade_1.NotFoundError("file not found!"));
                }
                fse.remove(path).then(() => {
                    return resolve(id);
                });
            }
        });
    }
    listDatasets() {
        return new Promise((resolve, reject) => {
            return resolve(Object.values(this.metaData));
        });
    }
    performQuery(query) {
        return new Promise((resolve, reject) => {
            const QueryHelper = new QueryValidatorC2_1.default();
            const queryPerformer = new QueryPerformer_1.default();
            const valArray = QueryHelper.queryValidator(query);
            if (valArray[2] === true) {
                const queryID = valArray[0];
                const queryKind = valArray[1];
                if (this.metaData[queryID] === undefined) {
                    this.loadDataset(queryID)
                        .then((r) => {
                        let dataToQuery;
                        if (queryKind === "courses") {
                            dataToQuery = JSON.parse(JSON.stringify(this.sectionDatasets[queryID]));
                        }
                        else {
                            dataToQuery = JSON.parse(JSON.stringify(this.roomDatasets[queryID]));
                        }
                        let queryResult = queryPerformer.QueryPerformer(query, dataToQuery);
                        return resolve(queryResult);
                    }).catch((err) => {
                        return reject(new IInsightFacade_1.InsightError("file does not exist with that id, please add!"));
                    });
                }
                else {
                    let dataToQuery;
                    if (queryKind === "courses") {
                        dataToQuery = JSON.parse(JSON.stringify(this.sectionDatasets[queryID]));
                    }
                    else {
                        dataToQuery = JSON.parse(JSON.stringify(this.roomDatasets[queryID]));
                    }
                    let queryResult = queryPerformer.QueryPerformer(query, dataToQuery);
                    return resolve(queryResult);
                }
            }
            else {
                return reject(new IInsightFacade_1.InsightError("Invalid Query!"));
            }
        });
    }
    loadDataset(id) {
        return new Promise((resolve, reject) => {
            const directoryPath = __dirname + "/../../data/";
            const fileName = id + ".json";
            const filePath = directoryPath + fileName;
            this.readFile(filePath).then((result) => {
                const JSONData = JSON.parse(result);
                if (JSONData["kind"] === IInsightFacade_1.InsightDatasetKind.Courses) {
                    this.sectionDatasets[id] = JSONData["result"];
                }
                else {
                    this.roomDatasets[id] = JSONData["result"];
                }
                let newMeta = {
                    id: id,
                    kind: JSONData["kind"],
                    numRows: JSONData["numRooms"]
                };
                this.metaData[id] = newMeta;
                return resolve("Completed load");
            }).catch((error) => {
                return reject(new IInsightFacade_1.InsightError("file does not exist with that id, please addDataset"));
            });
        });
    }
    readFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, "utf-8", (err, data) => {
                return resolve(data);
            });
        });
    }
}
exports.default = InsightFacade;
//# sourceMappingURL=InsightFacade.js.map