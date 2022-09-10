import * as fs from "fs";
import Log from "../Util";
import {InsightDataset, InsightDatasetKind, InsightError, RoomDataset} from "./IInsightFacade";
import * as parse5 from "parse5";
import * as http from "http";
import RoomParseUtils from "./RoomParseUtils";

// A class that holds accessory methods for RoomDatasets which interact with our internal data structures
export default class RoomUtils {
    private idLocal: string;
    private shortname: string;
    private fullname: string;
    private address: string;
    private lat: number;
    private lon: number;
    private buildingArray: any[];                         // contains all building tables from index.html
    private buildingMap: {[shortname: string]: any};      // map of shortname to htmlString (from building file)
    private geoMap: {[shortname: string]: any};           // map of shortname to object storing geolocation
    private roomParse: RoomParseUtils;

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
        this.roomParse = new RoomParseUtils();
    }

    // Call to perform the parse. Populate a local buildingArray, that contains the "tr" block for each building
    public parseHTML(id: string, indexHTML: any, metaRef: any, roomRef: any, result: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.idLocal = id;
            const chain = this.populateData(indexHTML, metaRef, roomRef, result).then((r) => {
                let b: any = this.buildingArray;
                let c: any = this.geoMap;
                let d: any = this.buildingMap;
                for (const elem of this.buildingArray) {
                    this.parseOneBuilding(elem, metaRef, roomRef);
                }
                return resolve("done");
            });
        });
        // return Promise.reject(new InsightError("test"));
    }

    public populateData(indexHTML: string, metaRef: any, roomRef: any, result: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            return Promise.resolve(parse5.parse(indexHTML))
                .then((indexTree) => {
                    this.parseAllBUILDINGS(indexTree);
                    this.populateMap();
                    this.processBuildingMap(result).then((r) => {
                        const x: any = this.buildingMap;
                        return resolve(this.processGeoMap());
                    });
                });
        });
    }

    public processGeoMap(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let promiseArray: any = [];
            for (const elem of Object.values(this.geoMap)) {
                promiseArray.push(this.promiseToHttp(elem));
            }
            Promise.all(promiseArray)
                .then((r) => {
                    let i: number = 0;
                    for (const elem of Object.keys(this.geoMap)) {
                        this.geoMap[elem] = r[i];
                        i += 1;
                    }
                    return resolve("Done");
                });
        });
    }

    // Reference: https://stackoverflow.com/questions/19539391/how-to-get-data-out-of-a-node-js-http-get-request
    public promiseToHttp(promiseReq: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const x: any = http.get(promiseReq, (res) => {
                res.setEncoding("utf-8");
                res.on("data", function (body) {
                    resolve(JSON.parse(body));
                });
            });
        });
    }

    // takes a buildingArray and populates a local maps with trimmed shortnames and addressRequest string
    public populateMap(): void {
        for (const elem of this.buildingArray) {
            const shortName: any = this.roomParse.findShortName(elem).trim(); // contains our shortName
            const address: any = this.roomParse.findAddress(elem).trim(); // contains our address
            const addressRequest: any = this.getAddressRequest(address.split(" ").join("%20"));
            this.buildingMap[shortName] = undefined; // Name now exists in map, but value is currently undefined
            this.geoMap[shortName] = addressRequest;
        }
    }

    // Consumes an address, that is a string. Returns the https request that is placed into a map
    private getAddressRequest(address: string): string {
        const geoLoc: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team164/";
        const geoReq: string = geoLoc + address;
        return geoReq;
    }

    public processBuildingMap(result: any): Promise<any> {
        return new Promise<string> ((resolve, reject) => {
            let promiseArray: Array<Promise<string>> = [];
            let keyArray: string[] = [];
            for (const elem of Object.keys(this.buildingMap)) {
                let path = "rooms/campus/discover/buildings-and-classrooms/" + elem; // Get our pathName
                result.folder("rooms").forEach((relativePath: any, file: any) => {
                    // Look for the file that shares the name, and push into our promiseArray
                    if (file.name === path) {
                        let promiseFileRead: Promise<any> = file.async("string");
                        promiseArray.push(promiseFileRead);
                        keyArray.push(elem);
                    }
                });
            }
            Promise.all(promiseArray)
                .then((values) => {
                    let i = 0; // our index into the keyArray
                    for (const elem of values) {
                        this.buildingMap[keyArray[i]] = elem; // update Map
                        i += 1; // update index
                    }
                    return resolve(this.processIntoTreeObj()); // Helper function (should return a promise)
                    // return resolve("done");
                });
        });
    }

    // consumes array of html strings (this.buildingMap) and parses them, then populates an array of promises
    public processIntoTreeObj(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const keyArray: string[] = Object.keys(this.buildingMap);
            const promiseArray: any = [];
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

    // Fills the field buildingArray, with childNodes, where nodeName == "tr" with info on a building
    public parseAllBUILDINGS(indexResult: any): any {
        // Base Case (we have hit tbody)
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

    // takes a tr (building row) and parses for building-wide information, then if table found, parses rooms
    public parseOneBuilding(oneBuilding: any, metaRef: any, roomRef: any): any {
        this.shortname = this.roomParse.findShortName(oneBuilding).trim();
        this.fullname = this.roomParse.findFullName(oneBuilding).trim();
        this.address = this.roomParse.findAddress(oneBuilding).trim();
        this.lat = this.geoMap[this.shortname]["lat"];
        this.lon = this.geoMap[this.shortname]["lon"];
        let roomArray: any[] = [];
        const shortnameTreeObj: any = this.buildingMap[this.shortname];
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

    // takes a tr (room row) and parses for room-specific information
    public parseOneRoom(elem: any): any {
        let roomnum: string = elem.childNodes[1].childNodes[1].childNodes[0].value;
        let roomname: string = this.shortname + "_" + roomnum;
        let roomseats: number = parseInt(this.roomParse.findRoomSeats(elem).trim(), 10);
        let roomtype: string = this.roomParse.findRoomType(elem).trim();
        let roomfurniture: string = this.roomParse.findRoomFurniture(elem).trim();
        let roomhref: string = this.roomParse.findRoomHref(elem).trim();
        if (roomnum !== "-1" || roomname !== "-1" || roomseats !== -1 || roomtype !== "-1" ||
            roomfurniture !== "-1" || roomhref !== "-1") {
            let currSection: RoomDataset = {fullname: this.fullname, shortname: this.shortname,
                number: roomnum, name: roomname, address: this.address, lat: this.lat, lon: this.lon,
                seats: roomseats, type: roomtype, furniture: roomfurniture, href: roomhref
            };
            this.updateRoom(this.idLocal, currSection);
            return currSection;
        }
        return "undefined";
    }

    // updates our room with appropriate key-value pairs
    public updateRoom(id: string, roomData: any): void {
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

    public addRoom(currSection: any, metaRef: any, roomRef: any) {
        let id = this.idLocal;
        if (id in roomRef) {
            roomRef[id].push(currSection);
        } else {
            roomRef[id] = [currSection];
        }
        // Update metaData
        if (id in metaRef) {
            metaRef[id].numRows += 1;
        } else {
            let newMeta: InsightDataset = {
                id: id,
                kind: InsightDatasetKind.Rooms,
                numRows: 1
            };
            metaRef[id] = newMeta;
        }
    }

    public findBuildingTable(oneBuilding: any, roomArray: any[]) {
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
                let possibleTable: any = this.findBuildingTable(child, roomArray);
                if (possibleTable !== "no table") {
                    return possibleTable;
                }
            }
        }
        return "no table";
    }

    // saves JSON file to disk for Rooms
    public savetoJSONRooms(id: string, roomDatasets: any, metaData: any): void {
        // Create the obj that we will end up saving to disk
        let obj = {result: roomDatasets[id],  numRooms: metaData[id].numRows, name: id, kind: "rooms"};
        let objStringify = JSON.stringify(obj);
        let name: string = __dirname + "/../../data/" + id + ".json";
        fs.writeFileSync(name, objStringify, "utf-8");
    }
}
