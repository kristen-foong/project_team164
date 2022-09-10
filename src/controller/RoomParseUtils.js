"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoomParseUtils {
    constructor() {
    }
    findShortName(elem) {
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
    findFullName(elem) {
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
    findAddress(elem) {
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
    findRoomNumber(elem) {
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
    findRoomSeats(elem) {
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
    findRoomType(elem) {
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
    findRoomFurniture(elem) {
        if (elem.nodeName === "td" && elem.attrs[0].value === "views-field views-field-field-room-furniture") {
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
    findRoomHref(elem) {
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
exports.default = RoomParseUtils;
//# sourceMappingURL=RoomParseUtils.js.map