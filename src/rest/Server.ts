/**
 * Created by rtholmes on 2016-06-19.
 */

import fs = require("fs");
import restify = require("restify");
import Log from "../Util";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {

    private port: number;
    private rest: restify.Server;
    private static facade: InsightFacade = new InsightFacade();

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info("Server::close()");
        const that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a pruuuuuuuuuuuomise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        const that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info("Server::start() - start");

                that.rest = restify.createServer({
                    name: "insightUBC",
                });
                that.rest.use(restify.bodyParser({mapFiles: true, mapParams: true}));
                that.rest.use(
                    function crossOrigin(req, res, next) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        return next();
                    });

                // This is an example endpoint that you can invoke by accessing this URL in your browser:
                // http://localhost:4321/echo/hello
                that.rest.get("/echo/:msg", Server.echo);

                // NOTE: your endpoints should go here

                // PUT /dataset/:id/:kind
                that.rest.put("/dataset/:id/:kind", Server.putDataset);

                // DELETE /dataset/:id
                // that.rest.del("/dataset/:id", Server.deleteDataset);

                // POST /query
                that.rest.post("/query", Server.queryDataset);

                // GET /datasets
                that.rest.get("/datasets", Server.getDatasets);

                // This must be the last endpoint!
                that.rest.get("/.*", Server.getStatic);

                that.rest.listen(that.port, function () {
                    Log.info("Server::start() - restify listening: " + that.rest.url);
                    fulfill(true);
                });

                that.rest.on("error", function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal
                    // node not using normal exceptions here
                    Log.info("Server::start() - restify ERROR: " + err);
                    reject(err);
                });

            } catch (err) {
                Log.error("Server::start() - ERROR: " + err);
                reject(err);
            }
        });
    }

    private static getDatasets(req: restify.Request, res: restify.Response, next: restify.Next) {
        // call the listDatasets
        Server.facade.listDatasets().then((r) => {
            res.json(200, {result: r});
            return next();
        }).catch((error) => {
            // We are not expecting this!
        });
    }

    private static queryDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::echo(..) - params: " + JSON.stringify(req.body));
        // call performQuery
        Server.facade.performQuery(req.body).then((r) => {
            // successful query performed
            res.json(200, {result: r});
            return next();
        }).catch((error) => {
            // error
            res.json(400, {error: "error"});
            return next();
        });
    }

    private static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        // Log.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        // Grab id
        const id: string = req.params["id"];
        // perform removal
        Server.facade.removeDataset(id).then((r) => {
            // success case
            res.json(200, {result: r});
            return next();
        }).catch((error) => {
            // error handling
            if (error instanceof InsightError) {
                res.json(400, {error: "error"});
            }
            if (error instanceof NotFoundError) {
                res.json(404, {error: "error"});
            }
            return next();
        });
    }

    private static putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        // Log.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        // Handling for body being undefined (potential error case)
        if (req.body === undefined) {
            // Log.error("Server::put(..) - responding " + 400);
            res.json(400, {error: "error"});
        }
        // Grab id, kind, and content
        const id: string = req.params["id"];
        let kind: any = req.params["kind"];
        const content: string = (req.body).toString("base64");
        // handle the kind
        if (kind === "courses") {
            kind = InsightDatasetKind.Courses;
        } else {
            kind = InsightDatasetKind.Rooms;
        }
        // Call addDataset on server object
        Server.facade.addDataset(id, content, kind).then((r) => {
            // Log.info("Server::put(..) - responding " + 200);
            res.json(200, {result: r});
            return next();
        }).catch((err: any) => {
            // Log.error("Server::put(..) - responding " + 400);
            res.json(400, {error: "error"});
            return next();
        });
    }

    // The next two methods handle the echo service.
    // These are almost certainly not the best place to put these, but are here for your reference.
    // By updating the Server.echo function pointer above, these methods can be easily moved.
    private static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        try {
            const response = Server.performEcho(req.params.msg);
            Log.info("Server::echo(..) - responding " + 200);
            res.json(200, {result: response});
        } catch (err) {
            Log.error("Server::echo(..) - responding 400");
            res.json(400, {error: err});
        }
        return next();
    }

    private static performEcho(msg: string): string {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        } else {
            return "Message not provided";
        }
    }

    private static getStatic(req: restify.Request, res: restify.Response, next: restify.Next) {
        const publicDir = "frontend/public/";
        Log.trace("RoutHandler::getStatic::" + req.url);
        let path = publicDir + "index.html";
        if (req.url !== "/") {
            path = publicDir + req.url.split("/").pop();
        }
        fs.readFile(path, function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

}
