"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const IInsightFacade_1 = require("./IInsightFacade");
const parse5 = require("parse5");
const http = require("http");
const RoomParseUtils_1 = require("./RoomParseUtils");
class RoomUtils {
    constructor() {
        this.idLocal = "";
        this.shortname = "";
        this.fullname = "";
        this.address = "";
        this.lat = 0;
        this.lon = 0;
        this.buildingArray = [];
        this.buildingMap = {};
        this.geoMap = {};
        this.roomParse = new RoomParseUtils_1.default();
    }
    parseHTML(id, indexHTML, metaRef, roomRef, result) {
        return new Promise((resolve, reject) => {
            this.idLocal = id;
            const chain = this.populateData(indexHTML, metaRef, roomRef, result).then((r) => {
                let b = this.buildingArray;
                let c = this.geoMap;
                let d = this.buildingMap;
                for (const elem of this.buildingArray) {
                    this.parseOneBuilding(elem, metaRef, roomRef);
                }
                return resolve("done");
            });
        });
    }
    populateData(indexHTML, metaRef, roomRef, result) {
        return new Promise((resolve, reject) => {
            return Promise.resolve(parse5.parse(indexHTML))
                .then((indexTree) => {
                this.parseAllBUILDINGS(indexTree);
                this.populateMap();
                this.processBuildingMap(result).then((r) => {
                    const x = this.buildingMap;
                    return resolve(this.processGeoMap());
                });
            });
        });
    }
    processGeoMap() {
        return new Promise((resolve, reject) => {
            let promiseArray = [];
            for (const elem of Object.values(this.geoMap)) {
                promiseArray.push(this.promiseToHttp(elem));
            }
            Promise.all(promiseArray)
                .then((r) => {
                let i = 0;
                for (const elem of Object.keys(this.geoMap)) {
                    this.geoMap[elem] = r[i];
                    i += 1;
                }
                return resolve("Done");
            });
        });
    }
    promiseToHttp(promiseReq) {
        return new Promise((resolve, reject) => {
            const x = http.get(promiseReq, (res) => {
                res.setEncoding("utf-8");
                res.on("data", function (body) {
                    resolve(JSON.parse(body));
                });
            });
        });
    }
    populateMap() {
        for (const elem of this.buildingArray) {
            const shortName = this.roomParse.findShortName(elem).trim();
            const address = this.roomParse.findAddress(elem).trim();
            const addressRequest = this.getAddressRequest(address.split(" ").join("%20"));
            this.buildingMap[shortName] = undefined;
            this.geoMap[shortName] = addressRequest;
        }
    }
    getAddressRequest(address) {
        const geoLoc = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team164/";
        const geoReq = geoLoc + address;
        return geoReq;
    }
    processBuildingMap(result) {
        return new Promise((resolve, reject) => {
            let promiseArray = [];
            let keyArray = [];
            for (const elem of Object.keys(this.buildingMap)) {
                let path = "rooms/campus/discover/buildings-and-classrooms/" + elem;
                result.folder("rooms").forEach((relativePath, file) => {
                    if (file.name === path) {
                        let promiseFileRead = file.async("string");
                        promiseArray.push(promiseFileRead);
                        keyArray.push(elem);
                    }
                });
            }
            Promise.all(promiseArray)
                .then((values) => {
                let i = 0;
                for (const elem of values) {
                    this.buildingMap[keyArray[i]] = elem;
                    i += 1;
                }
                return resolve(this.processIntoTreeObj());
            });
        });
    }
    processIntoTreeObj() {
        return new Promise((resolve, reject) => {
            const keyArray = Object.keys(this.buildingMap);
            const promiseArray = [];
            for (const elem of Object.values(this.buildingMap)) {
                promiseArray.push(parse5.parse(elem));
            }
            Promise.all(promiseArray)
                .then((values) => {
                let i = 0;
                for (const elem of values) {
                    this.buildingMap[keyArray[i]] = elem;
                    i += 1;
                }
                return resolve("blah");
            });
        });
    }
    parseAllBUILDINGS(indexResult) {
        if (indexResult.nodeName === "tbody") {
            for (const elem of indexResult.childNodes) {
                if (elem.nodeName === "tr") {
                    this.buildingArray.push(elem);
                }
            }
            return;
        }
        if (indexResult.childNodes && indexResult.childNodes.length > 0) {
            for (let child of indexResult.childNodes) {
                let possibleTable = this.parseAllBUILDINGS(child);
                if (possibleTable !== "no table") {
                    return possibleTable;
                }
            }
        }
        return "no table";
    }
    parseOneBuilding(oneBuilding, metaRef, roomRef) {
        this.shortname = this.roomParse.findShortName(oneBuilding).trim();
        this.fullname = this.roomParse.findFullName(oneBuilding).trim();
        this.address = this.roomParse.findAddress(oneBuilding).trim();
        this.lat = this.geoMap[this.shortname]["lat"];
        this.lon = this.geoMap[this.shortname]["lon"];
        let roomArray = [];
        const shortnameTreeObj = this.buildingMap[this.shortname];
        let foundTable = this.findBuildingTable(shortnameTreeObj, roomArray);
        if (foundTable !== "no table") {
            for (let elem of roomArray) {
                let currSection = this.parseOneRoom(elem);
                if (currSection !== "undefined") {
                    this.addRoom(currSection, metaRef, roomRef);
                }
            }
        }
    }
    parseOneRoom(elem) {
        let roomnum = elem.childNodes[1].childNodes[1].childNodes[0].value;
        let roomname = this.shortname + "_" + roomnum;
        let roomseats = parseInt(this.roomParse.findRoomSeats(elem).trim(), 10);
        let roomtype = this.roomParse.findRoomType(elem).trim();
        let roomfurniture = this.roomParse.findRoomFurniture(elem).trim();
        let roomhref = this.roomParse.findRoomHref(elem).trim();
        if (roomnum !== "-1" || roomname !== "-1" || roomseats !== -1 || roomtype !== "-1" ||
            roomfurniture !== "-1" || roomhref !== "-1") {
            let currSection = { fullname: this.fullname, shortname: this.shortname,
                number: roomnum, name: roomname, address: this.address, lat: this.lat, lon: this.lon,
                seats: roomseats, type: roomtype, furniture: roomfurniture, href: roomhref
            };
            this.updateRoom(this.idLocal, currSection);
            return currSection;
        }
        return "undefined";
    }
    updateRoom(id, roomData) {
        roomData[(id + "_fullname")] = roomData["fullname"];
        roomData[(id + "_shortname")] = roomData["shortname"];
        roomData[(id + "_number")] = roomData["number"];
        roomData[(id + "_name")] = roomData["name"];
        roomData[(id + "_address")] = roomData["address"];
        roomData[(id + "_lat")] = roomData["lat"];
        roomData[(id + "_lon")] = roomData["lon"];
        roomData[(id + "_seats")] = roomData["seats"];
        roomData[(id + "_type")] = roomData["type"];
        roomData[(id + "_furniture")] = roomData["furniture"];
        roomData[(id + "_href")] = roomData["href"];
        delete roomData["fullname"];
        delete roomData["shortname"];
        delete roomData["number"];
        delete roomData["name"];
        delete roomData["address"];
        delete roomData["lat"];
        delete roomData["lon"];
        delete roomData["seats"];
        delete roomData["type"];
        delete roomData["furniture"];
        delete roomData["href"];
    }
    addRoom(currSection, metaRef, roomRef) {
        let id = this.idLocal;
        if (id in roomRef) {
            roomRef[id].push(currSection);
        }
        else {
            roomRef[id] = [currSection];
        }
        if (id in metaRef) {
            metaRef[id].numRows += 1;
        }
        else {
            let newMeta = {
                id: id,
                kind: IInsightFacade_1.InsightDatasetKind.Rooms,
                numRows: 1
            };
            metaRef[id] = newMeta;
        }
    }
    findBuildingTable(oneBuilding, roomArray) {
        if (oneBuilding.nodeName === "tbody") {
            for (const elem of oneBuilding.childNodes) {
                if (elem.nodeName === "tr") {
                    roomArray.push(elem);
                }
            }
            return;
        }
        if (oneBuilding.childNodes && oneBuilding.childNodes.length > 0) {
            for (let child of oneBuilding.childNodes) {
                let possibleTable = this.findBuildingTable(child, roomArray);
                if (possibleTable !== "no table") {
                    return possibleTable;
                }
            }
        }
        return "no table";
    }
    savetoJSONRooms(id, roomDatasets, metaData) {
        let obj = { result: roomDatasets[id], numRooms: metaData[id].numRows, name: id, kind: "rooms" };
        let objStringify = JSON.stringify(obj);
        let name = __dirname + "/../../data/" + id + ".json";
        fs.writeFileSync(name, objStringify, "utf-8");
    }
}
exports.default = RoomUtils;
//# sourceMappingURL=RoomUtils.js.map