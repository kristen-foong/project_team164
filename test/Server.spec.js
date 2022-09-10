"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server_1 = require("../src/rest/Server");
const InsightFacade_1 = require("../src/controller/InsightFacade");
const chai = require("chai");
const chaiHttp = require("chai-http");
const fs = require("fs-extra");
const Util_1 = require("../src/Util");
describe("Facade D3", function () {
    let facade = null;
    let server = null;
    const SERVER_URL = "http://localhost:4321";
    chai.use(chaiHttp);
    const datasetsToLoad = {
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
    };
    const cacheDir = __dirname + "/../data";
    let datasets = {};
    before(function () {
        facade = new InsightFacade_1.default();
        server = new Server_1.default(4321);
        server.start();
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]);
        }
    });
    after(function () {
        server.stop();
        Util_1.default.test(`After: ${this.test.parent.title}`);
    });
    beforeEach(function () {
        Util_1.default.test(`BeforeTest: ${this.currentTest.title}`);
    });
    afterEach(function () {
    });
});
//# sourceMappingURL=Server.spec.js.map