import * as dotenv from "dotenv";

dotenv.config({path: __dirname + '/../.env'});

import express from "express";
import cors from "cors";

// shared service
import {handler as errorHandler} from "groupo-shared-service/apiutils/errors";

// init datasource
import {initMySQLConnection} from "groupo-shared-service/datasource/mysql";
initMySQLConnection(__dirname + "/models/*.ts");

// init logger
import {logger, registerApplicationLogger, handler as grpcHandler} from "groupo-shared-service/services/logger";
import routes from "./routers";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {httpLogger, prepareHttpLogger} from "groupo-shared-service/apiutils/middleware";

registerApplicationLogger("grouping-service");

const app = express();

// request pipeline
app.use(cors());
app.use(prepareHttpLogger);
app.use(express.json());
app.use(routes);
app.use(httpLogger);
app.use(errorHandler);

// create custom server
import http from "http";

const server = http.createServer(app);

import {Server} from "socket.io";

const io = new Server(server);

io.on("connection", () => {
    console.log("connect");
});

// start server
const port = process.env.APP_PORT || "8081";
server.listen(port, () => {
    LoggingGrpcClient.Info(logger.message("start groupo-grouping successfully").proto(), grpcHandler);
    LoggingGrpcClient.Info(logger.set("APP_PORT", port).message("groupo-grouping is running").proto(), grpcHandler);
});
