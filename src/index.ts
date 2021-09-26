import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";

// shared service
import {handler} from "groupo-shared-service/apiutils/errors";

// init datasource
import {initMySQLConnection} from "groupo-shared-service/datasource/mysql";
// init logger
import {logger, registerApplicationLogger} from "groupo-shared-service/logging/logger";
import routes from "./routers";

dotenv.config({ path: __dirname+'/../.env' });

initMySQLConnection(__dirname + "/models/*.ts");

registerApplicationLogger("grouping-service");

const app = express();

// request pipeline
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(handler);

// start server
const port = process.env.APP_PORT || "8081";
app.listen(port, () => {
    logger.info("start groupo-grouping successfully");
    logger.field("application-port", port).info("groupo-grouping is running");
});
