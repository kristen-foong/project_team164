import * as fs from "fs";
import Log from "../Util";
import {InsightDataset, InsightDatasetKind, InsightError, RoomDataset} from "./IInsightFacade";
import * as parse5 from "parse5";
import * as http from "http";
import {JSZipObject} from "jszip";
import * as JSZip from "jszip";

export default class RoomParseUtils {

    constructor() {
        // nothing
    }

    public findShortName(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-building-code") {
            return elem.childNodes[0].value.trim();
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findShortName(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }

    // assumes link is always elem.childNodes[1]
    public findFullName(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-title") {
            let checkChild = elem.childNodes[1];
            if (checkChild.nodeName === "a" && checkChild.attrs[0].value.
            startsWith("./campus/discover/buildings-and-classrooms/")) {
                return checkChild.childNodes[0].value;
            }
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findFullName(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }

    public findAddress(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-building-address") {
            return elem.childNodes[0].value;
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findAddress(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }

    // assumes link is in childNode[1]
    public findRoomNumber(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-room-number") {
            let checkLink = elem.childNodes[1];
            if (checkLink.nodeName === "a" && checkLink.attrs[0].value.
            startsWith("http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/")) {
                return checkLink.childNodes[0].value.trim();
            }
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findRoomNumber(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }

    public findRoomSeats(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-room-capacity") {
            return elem.childNodes[0].value;
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findRoomSeats(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }

    public findRoomType(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-room-type") {
            return elem.childNodes[0].value;
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findRoomType(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }

    public findRoomFurniture(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-room-furniture") {
            // get the childNode[0] (#text) value
            return elem.childNodes[0].value;
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findRoomFurniture(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }

    // assumes link is in elem.childNodes[1]
    public findRoomHref(elem: any): string {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-room-number") {
            let checkLink = elem.childNodes[1];
            if (checkLink.nodeName === "a" && checkLink.attrs[0].value.
            startsWith("http://students.ubc.ca/campus/discover/buildings-and-classrooms/room/")) {
                return checkLink.attrs[0].value.trim();
            }
        }
        if (elem.childNodes && elem.childNodes.length > 0) {
            for (let child of elem.childNodes) {
                let possibleRoom = this.findRoomHref(child);
                if (possibleRoom !== "-1") {
                    return possibleRoom;
                }
            }
        }
        return "-1";
    }
}
