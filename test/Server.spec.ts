import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import * as fs from "fs-extra";
import Log from "../src/Util";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;
    const SERVER_URL: string = "http://localhost:4321";

    chai.use(chaiHttp);

    const datasetsToLoad: { [id: string]: string } = {
        onecourse: "./test/data/onecourse.zip",
        courses: "./test/data/courses.zip",
        courses1: "./test/data/courses1.zip",
        empty: "./test/data/courses_empty.zip",
        wrong: "./test/data/not_a_zip.txt",
        emptyjson: "./test/data/empty_json.zip",
        nojson: "./test/data/no_json.zip",
        norank: "./test/data/no_rank.zip",
        noresult: "./test/data/no_result.zip",
        wrongboth: "./test/data/wrong_both.zip",
        wrong_rank: "./test/data/wrong_rank.zip",
        wrong_result: "./test/data/wrong_result.zip",
        rooms: "./test/data/rooms.zip"
        // folder: "./test/data/only_folder"
    };
    const cacheDir = __dirname + "/../data";
    let datasets: { [id: string]: Buffer } = {};

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
        server.start();

        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]);
        }
    });

    after(function () {
        // TODO: stop server here once!
        server.stop();
        Log.test(`After: ${this.test.parent.title}`);
        // try {
        //     fs.removeSync(cacheDir);
        //     fs.mkdirSync(cacheDir);
        // } catch (err) {
        //     Log.error(err);
        // }
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        // Here we need to load our respective datasets into our insightFacade
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        // Here we need to clear the cache
    });

    // it("GET test, basic implementation that is given", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .get("/echo/:msg")
    //             .then(function (res: Response) {
    //                 expect(res.status).to.be.equal(200);
    //             })
    //             .catch(function (err) {
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // Don't need anything here for now
    //     }
    // });
    //
    // // Sample on how to format PUT requests
    // it("PUT test for courses dataset", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/courses/courses")
    //             .send(datasets["courses"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect(res.status).to.be.equal(200);
    //                 const expected: string = JSON.stringify(["courses"]);
    //                 const actual: string = JSON.stringify(res.body["result"]);
    //                 expect(actual).to.be.equal(expected);
    //             })
    //             .catch(function (err) {
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("PUT test for courses dataset, duplicate error", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/courses/courses")
    //             .send(datasets["courses"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect.fail();
    //             })
    //             .catch(function (err) {
    //                 expect(err.status).to.be.equal(400);
    //                 // expect(err.body["error"]).to.be.equal("error");
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("PUT test for rooms dataset", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/rooms/rooms")
    //             .send(datasets["rooms"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect(res.status).to.be.equal(200);
    //                 const expected: string = JSON.stringify(["courses", "rooms"]);
    //                 const actual: string = JSON.stringify(res.body["result"]);
    //                 expect(actual).to.be.equal(expected);
    //             })
    //             .catch(function (err) {
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("PUT test, invalid string I", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/rooms_/rooms")
    //             .send(datasets["rooms_"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect.fail();
    //             })
    //             .catch(function (err) {
    //                 expect(err.status).to.be.equal(400);
    //                 // expect(err.body["error"]).to.be.equal("error");
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("PUT test, invalid string II", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/courses_/courses")
    //             .send(datasets["courses"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect.fail();
    //             })
    //             .catch(function (err) {
    //                 expect(err.status).to.be.equal(400);
    //                 // expect(err.body["error"]).to.be.equal("error");
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("PUT test, invalid kind", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/courses/courss")
    //             .send(datasets["courses"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect.fail();
    //             })
    //             .catch(function (err) {
    //                 expect(err.status).to.be.equal(400);
    //                 // expect(err.body["error"]).to.be.equal("error");
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it("DELETE test, removing rooms dataset", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .del("/dataset/rooms")
    //             .then(function (res: Response) {
    //                 // expected success
    //                 expect(res.status).to.be.equal(200);
    //                 expect(res.body["result"]).to.be.equal("rooms");
    //             }).catch(function (err) {
    //                 // expected error
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // add some more logging here!
    //     }
    // });
    //
    // it("DELETE test, invalid id removal", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .del("/dataset/courses_")
    //             .then(function (res: Response) {
    //                 // expected error
    //                 expect.fail();
    //             }).catch(function (err) {
    //                 // expected success
    //                 expect(err.status).to.be.equal(400);
    //                 // expect(err.body["error"]).to.be.equal("error");
    //             });
    //     } catch (err) {
    //         // add some more logging here!
    //     }
    // });
    //
    // it("DELETE test, removing courses dataset", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .del("/dataset/courses")
    //             .then(function (res: Response) {
    //                 // expected success
    //                 expect(res.status).to.be.equal(200);
    //                 expect(res.body["result"]).to.be.equal("courses");
    //             }).catch(function (err) {
    //                 // expected error
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // add some more logging here!
    //     }
    // });
    //
    // it("DELETE test, removing a dataset that does not exist", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .del("/dataset/room")
    //             .then(function (res: Response) {
    //                 // expected success
    //                 expect.fail();
    //             }).catch(function (err) {
    //                 // expected error
    //                 expect(err.status).to.be.equal(404);
    //                 // expect(err.body["error"]).to.be.equal("room");
    //             });
    //     } catch (err) {
    //         // add some more logging here!
    //     }
    // });
    //
    // it("PUT test, need to add courses again for POST tests", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/courses/courses")
    //             .send(datasets["courses"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect(res.status).to.be.equal(200);
    //                 const expected: string = JSON.stringify(["courses"]);
    //                 const actual: string = JSON.stringify(res.body["result"]);
    //                 expect(actual).to.be.equal(expected);
    //             })
    //             .catch(function (err) {
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // it( "GET test, check if listDatasets is working, expect courses", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .get("/datasets")
    //             .then(function (res: Response) {
    //                 // success case
    //                 expect(res.status).to.be.equal(200);
    //                 expect(res.body["result"][0]["id"]).to.be.equal("courses");
    //             }).catch(function (err) {
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // add some more logging here!
    //     }
    // });
    //
    // it("PUT test, need to add rooms again for POST tests", function () {
    //     try {
    //         return chai.request(SERVER_URL)
    //             .put("/dataset/rooms/rooms")
    //             .send(datasets["rooms"])
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 expect(res.status).to.be.equal(200);
    //                 const expected: string = JSON.stringify(["courses", "rooms"]);
    //                 const actual: string = JSON.stringify(res.body["result"]);
    //                 expect(actual).to.be.equal(expected);
    //             })
    //             .catch(function (err) {
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });
    //
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
