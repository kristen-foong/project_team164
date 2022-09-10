import * as chai from "chai";
import {expect} from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {InsightDataset, InsightDatasetKind, InsightError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import {NotFoundError} from "../src/controller/IInsightFacade";

// This extends chai with assertions that natively support Promises
chai.use(chaiAsPromised);

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
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
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // // ROOMS TEST
    // it ("Test case for adding rooms", function () {
    //     const id: string = "rooms";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
    //     return expect(futureResult).to.be.eventually.deep.equal(expected);
    // });
    // ROOMS TEST
    // // // NEW3 --------------------> Additional revised tests
    // it ("Test case for a dataset folder being loaded", function () {
    //     // expect Insight Error
    //     const id: string = "folder";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    // InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // // Test for adding a dataset with a single JSON file
    // it ("Call once", function () {
    //     const id: string = "onecourse";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.eventually.deep.equal(expected);
    // });
    //
    // it ("id passed in is null", function () {
    //     const id: string = null;
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("kind passed in is null", function () {
    //     const id: string = "courses";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], null);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("datasets passed in null", function () {
    //     const id: string = "courses";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, null, InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("content invalid: json is empty", function () {
    //     const id: string = "emptyjson";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("Objects inside zip is not a JSON", function () {
    //     const id: string = "nojson";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("JSON file is missing rank K:V pair", function () {
    //     const id: string = "norank";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("JSON file is missing result K:V pair", function () {
    //     const id: string = "noresult";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("JSON file is has wrong value type for rank", function () {
    //     const id: string = "wrongrank";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("JSON file is has wrong value type for result", function () {
    //     const id: string = "wrongresult";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // it ("JSON file is has wrong value type for both", function () {
    //     const id: string = "wrongboth";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    // // NEW3 --------------------> End
    //
    // // NEW2 --------------------> Revised tests for add/remove (extras)
    // it ("Remove chain, should throw IE everytime, perhaps redundant", function () {
    //     // underscore error
    //     let id: string = "courses_";
    //     const futureResult1: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // whitespace only error
    //     id = "    ";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // whitespace & underscore error
    //     id = " courses__  ";
    //     const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // Invalid enum
    // it ("Adding an invalid DataSetKind, should throw fI", function () {
    //     // Adding invalid enum
    //     const id: string = "courses";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Rooms);
    //     return expect(futureResult).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // Adding with invalid datasets referenced
    //     const invalid: string = "";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, invalid,
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError);
    // });
    // });
    // // -------------------------> END
    //
    // // NEW ---------------------> Revised tests for add/remove
    // // fI (Insight Error), fN (NotFoundError)
    //
    // // failed add -> file is empty
    // it ("failed add, empty file", function () {
    //     const id: string = "empty";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // // failed add -> file is not a zip
    // it ("failed add, file is not a zip", function () {
    //     const id: string = "wrong";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // // successful add
    // it ("successful add", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.eventually.deep.equal(expected);
    // });
    //
    // // failed add
    // it ("failed add, throw fI", function () {
    //     const id: string = "___   ";
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // // successful double add
    // it ("successful double add", function () {
    //     // Add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // Add courses1
    //     id = "courses1";
    //     const expected2: string[] = ["courses", "courses1"];
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2);
    // });
    // });
    //
    // // successful add, follow by fail
    // it ("successful add, then failed add, throw fI", function () {
    //     // Add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed add
    //     id = "courses";
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError);
    // });
    // });
    //
    // // failed add, followed by successful add
    // it ("failed add, throw fI, then successful add", function () {
    //     // failed add
    //     let id: string = "_co_r_ses";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // Add courses
    //     id = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected1);
    // });
    // });
    //
    // // failed add, followed by failed add
    // it ("failed add, throw fI, then failed add, throw fI", function () {
    //     // failed add
    //     let id: string = "  _ ";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed add
    //     id = " courses_";
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError);
    // });
    // });
    //
    // // failed remove
    // it ("failed remove, throw fI", function () {
    //     // fI error
    //     let id: string = " courses _";
    //     const futureResult: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult).to.be.rejectedWith(InsightError);
    // });
    //
    // // failed remove
    // it ("failed remove, throw fN", function () {
    //     // fN error
    //     let id: string = "courses";
    //     const futureResult: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult).to.be.rejectedWith(NotFoundError);
    // });
    //
    // // successful remove (requires previous add!)
    // it ("successful add, then successful remove", function () {
    //     // successful add
    //     let id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // successful remove
    //     const expected2: string = id;
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2);
    // });
    // });
    //
    // // failed remove after successful add
    // it ("successful add, then failed remove, throw fI", function () {
    //     // successful add
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove, throw fI
    //     id = " ";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError);
    // });
    // });
    //
    // // failed remove after successful add
    // it ("successful add, then failed remove(fN)", function () {
    //     // successful add
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove, throw fN
    //     id = "courses1";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError);
    // });
    // });
    //
    // // failed add, then failed remove
    // it ("failed add(fI), then failed remove(fI)", function () {
    //     // failed add
    //     let id: string = "courses_";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     id = " ";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError);
    // });
    // });
    //
    // // failed add, then failed remove
    // it ("failed add(fI), then failed remove(fN)", function () {
    //     // failed add
    //     let id: string = " ";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     id = "courses";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError);
    // });
    // });
    //
    // // successful add, successful remove, successful add
    // it ("successful add, then successful remove, then successful add", function () {
    //     // add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // successful remove
    //     id = "courses";
    //     const expected2: string = id;
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then( () => {
    //     // successful add
    //     id = "courses1";
    //     const expected3: string[] = [id];
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3);
    // });
    // });
    // });
    //
    // // successful add, successful remove, failed add
    // it ("successful add, then successful remove, then failed add(fI)", function () {
    //     // add courses
    //     let id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // successful remove
    //     id = "courses1";
    //     const expected2: string = id;
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then( () => {
    //     // failed add
    //     id = "_courses";
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // successful add, failed remove, successful add
    // it ("successful add, then failed remove(fI), then successful add", function () {
    //     // add courses
    //     let id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = "courses_";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // successful add
    //     id = "courses";
    //     const expected3: string[] = ["courses1", "courses"];
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3);
    // });
    // });
    // });
    //
    // // successful add, failed remove, failed add
    // it ("successful add, then failed remove(fI), then failed add(fI)", function () {
    //     // add courses
    //     let id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = "courses_";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed add
    //     id = "courses1";
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // successful add, failed remove, successful add
    // it ("successful add, then failed remove(fN), then successful add", function () {
    //     // add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = "courses2";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError)
    // .then( () => {
    //     // successful add
    //     id = "courses1";
    //     const expected3: string[] = ["courses", "courses1"];
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3);
    // });
    // });
    // });
    //
    // // successful add, failed remove, failed add
    // it ("successful add, then failed remove(fN), then failed add(fI)", function () {
    //     // add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = "courses2";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError)
    // .then( () => {
    //     // failed add
    //     id = "courses";
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // successful add, successful remove, failed remove
    // it ("successful add, then successful remove, then failed remove(fI)", function () {
    //     // add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // successful remove
    //     id = "courses";
    //     const expected2: string = id;
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then( () => {
    //     // failed remove
    //     id = "courses_";
    //     const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // successful add, successful remove, failed remove
    // it ("successful add, then successful remove, then failed remove(fN)", function () {
    //     // add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // successful remove
    //     id = "courses";
    //     const expected2: string = id;
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then( () => {
    //     // failed remove
    //     id = "courses";
    //     const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult3).to.be.rejectedWith(NotFoundError);
    // });
    // });
    // });
    //
    // // successful add, failed remove, failed remove
    // it ("successful add, then failed remove(fI), then failed remove(fI)", function () {
    //     // add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = "courses_";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     id = " ";
    //     const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // successful add, failed remove, failed remove
    // it ("successful add, then failed remove(fI), then failed remove(fN)", function () {
    //     // add courses
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = " ";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     id = "courses1";
    //     const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult3).to.be.rejectedWith(NotFoundError);
    // });
    // });
    // });
    //
    // // successful add, failed remove, failed remove
    // it ("successful add, then failed remove(fN), then failed remove(fI)", function () {
    //     // add courses
    //     let id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = "courses";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError)
    // .then( () => {
    //     // failed remove
    //     id = " ";
    //     const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // successful add, failed remove, failed remove
    // it ("successful add, then failed remove(fN), then failed remove(fN)", function () {
    //     // add courses
    //     let id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // failed remove
    //     id = "courses";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError)
    // .then( () => {
    //     // failed remove
    //     id = "courses2";
    //     const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult3).to.be.rejectedWith(NotFoundError);
    // });
    // });
    // });
    //
    // // failed add, failed remove, successful add
    // it ("Failed add(fI), then failed remove(fI), then successful add", function () {
    //     // failed add
    //     let id: string = "_courses";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // successful add
    //     id = "courses";
    //     const expected3: string[] = [id];
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3);
    // });
    // });
    // });
    //
    // // failed add, failed remove, failed add
    // it ("Failed add(fI), then failed remove(fI), then failed add(fI)", function () {
    //     // failed add
    //     let id: string = " ";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed add
    //     id = "courses_";
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // failed add, failed remove, successful add
    // it ("Failed add(fI), then failed remove(fN), then successful add", function () {
    //     // failed add
    //     let id: string = "_courses";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     id = "courses";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError)
    // .then( () => {
    //     // successful add
    //     id = "courses";
    //     const expected3: string[] = [id];
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3);
    // });
    // });
    // });
    //
    // // failed add, failed remove, failed add
    // it ("Failed add(fI), then failed remove(fN), then failed add(fI)", function () {
    //     // failed add
    //     let id: string = " ";
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.rejectedWith(InsightError)
    // .then( () => {
    //     // failed remove
    //     id = "courses1";
    //     const futureResult2: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult2).to.be.rejectedWith(NotFoundError)
    // .then( () => {
    //     // failed add
    //     id = "courses_";
    //     const futureResult3: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult3).to.be.rejectedWith(InsightError);
    // });
    // });
    // });
    //
    // // Empty dataset list test
    // it("Should return an empty set", function () {
    //     // Empty, should equal empty set
    //     const expected: InsightDataset[] = [];
    //     const futureResult: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult).to.be.eventually.deep.equal(expected);
    // });
    //
    // // Single addition check for listDatasets
    // it ("Single addition made", function () {
    //     // Single addition of "courses" and  check
    //     const id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    //     .then( () => {
    //         // Lists should be equal
    //         const myData: InsightDataset = {id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612};
    //         const expected2: InsightDataset[] = [myData];
    //         const futureResult2: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //         return expect(futureResult2).to.be.eventually.deep.equal(expected2);
    //     });
    // });
    //
    // // Single addition, followed by removal
    // it ("Single addition, check, followed by removal and check", function () {
    //     // Single addition of "courses1"
    //     const id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    //     .then( () => {
    //         // Perform check
    //         const myData: InsightDataset = {id: "courses1", kind: InsightDatasetKind.Courses, numRows: 64612};
    //         const expected2: InsightDataset[] = [myData];
    //         const futureResult2: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //         return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    //     .then( () => {
    //         // Perform removal of "courses1"
    //         const expected3: string = "courses1";
    //         const futureResult3: Promise<string> = insightFacade.removeDataset(id);
    //         return expect(futureResult3).to.be.eventually.deep.equal(expected3)
    //     .then( () => {
    //         // Perform check
    //         const expected4: InsightDataset[] = [];
    //         const futureResult4: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //         return expect(futureResult4).to.be.eventually.deep.equal(expected4);
    //     });
    // });
    // });
    // });
    //
    // // Two additions and a check
    // it ("Two additions, check", function () {
    //     // Single addition of "courses"
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then(() => {
    //     // Single addition of "courses1"
    //     id = "courses1";
    //     const expected2: string[] = ["courses", "courses1"];
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then(() => {
    //     // Check listdatasets
    //     const Data1: InsightDataset = {id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const Data2: InsightDataset = {id: "courses1", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const expected3: InsightDataset[] = [Data1, Data2];
    //     const futureResult3: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3);
    //     });
    // });
    // });
    //
    // // Two additions, followed by single removal
    // it ("Two additions, check, followed by removal and check", function () {
    //     // Single addition of "courses"
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // Single addition of "courses1"
    //     id = "courses1";
    //     const expected2: string[] = ["courses", "courses1"];
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then ( () => {
    //     // Check listdatasets
    //     const Data1: InsightDataset = {id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const Data2: InsightDataset = {id: "courses1", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const expected3: InsightDataset[] = [Data1, Data2];
    //     const futureResult3: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3)
    // .then ( () => {
    //     // Perform removal of "courses1"
    //     const expected4: string = id;
    //     const futureResult4: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult4).to.be.eventually.deep.equal(expected4)
    // .then( () => {
    //     // Check listdatasets
    //     const expected5: InsightDataset[] = [Data1];
    //     const futureResult5: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult5).to.be.eventually.deep.equal(expected5);
    // });
    // });
    // });
    // });
    // });
    //
    // // Two additions, followed by single removal, mirror case
    // it ("Two additions, check, followed by removal and check, mirror", function () {
    //     // Single addition of "courses"
    //     let id: string = "courses";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // Single addition of "courses1"
    //     id = "courses1";
    //     const expected2: string[] = ["courses", "courses1"];
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then ( () => {
    //     // Check listdatasets
    //     const Data1: InsightDataset = {id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const Data2: InsightDataset = {id: "courses1", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const expected3: InsightDataset[] = [Data1, Data2];
    //     const futureResult3: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3)
    // .then ( () => {
    //     // Perform removal of "courses"
    //     id = "courses";
    //     const expected4: string = id;
    //     const futureResult4: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult4).to.be.eventually.deep.equal(expected4)
    // .then( () => {
    //     // Check listdatasets
    //     const expected5: InsightDataset[] = [Data2];
    //     const futureResult5: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult5).to.be.eventually.deep.equal(expected5);
    // });
    // });
    // });
    // });
    // });
    //
    // // Two additions, two removals
    // it ("Double addition, check, double removal, check", function () {
    //     // Add courses1
    //     let id: string = "courses1";
    //     const expected1: string[] = [id];
    //     const futureResult1: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult1).to.be.eventually.deep.equal(expected1)
    // .then( () => {
    //     // Add courses
    //     id = "courses";
    //     const expected2: string[] = ["courses1", "courses"];
    //     const futureResult2: Promise<string[]> = insightFacade.addDataset(id, datasets[id],
    //     InsightDatasetKind.Courses);
    //     return expect(futureResult2).to.be.eventually.deep.equal(expected2)
    // .then( () => {
    //     // Check listdatasets
    //     const Data1: InsightDataset = {id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const Data2: InsightDataset = {id: "courses1", kind: InsightDatasetKind.Courses, numRows: 64612};
    //     const expected3: InsightDataset[] = [Data2, Data1];
    //     const futureResult3: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult3).to.be.eventually.deep.equal(expected3)
    // .then( () => {
    //     // Perform removal of "courses1"
    //     id = "courses1";
    //     const expected4: string = id;
    //     const futureResult4: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult4).to.be.eventually.deep.equal(expected4)
    // .then( () => {
    //     // Perform removal of "courses"
    //     id = "courses";
    //     const expected5: string = id;
    //     const futureResult5: Promise<string> = insightFacade.removeDataset(id);
    //     return expect(futureResult5).to.be.eventually.deep.equal(expected5)
    // .then( () => {
    //     // Check listdatasets
    //     const expected6: InsightDataset[] = [];
    //     const futureResult6: Promise<InsightDataset[]> = insightFacade.listDatasets();
    //     return expect(futureResult6).to.be.eventually.deep.equal(expected6);
    // });
    // });
    // });
    // });
    // });
    // });
 });

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: {path: string, kind: InsightDatasetKind} } = {
        courses: {path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
        rooms: {path: "./test/data/rooms.zip", kind: InsightDatasetKind.Rooms}
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises);
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<any[]> = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
