import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/../.env' });

import express from "express";
import cors from "cors";

// shared service
import {handler as errorHandler} from "groupo-shared-service/apiutils/errors";

// init datasource
import {initMySQLConnection} from "groupo-shared-service/datasource/mysql";
// init logger
import {logger, registerApplicationLogger, handler as grpcHandler} from "groupo-shared-service/services/logger";
import routes from "./routers";
import {LoggingGrpcClient} from "groupo-shared-service/grpc/client";
import {httpLogger, prepareHttpLogger} from "groupo-shared-service/apiutils/middleware";

initMySQLConnection(__dirname + "/models/*.ts");

registerApplicationLogger("grouping-service");

const app = express();

// request pipeline
app.use(cors());
app.use(prepareHttpLogger);
app.use(express.json());
app.use(routes);
app.use(httpLogger);
app.use(errorHandler);

// start server
const port = process.env.APP_PORT || "8081";
app.listen(port, () => {
    LoggingGrpcClient.Info(logger.message("start groupo-grouping successfully").proto(), grpcHandler);
    LoggingGrpcClient.Info(logger.set("APP_PORT", port).message("groupo-grouping is running").proto(), grpcHandler);
});
