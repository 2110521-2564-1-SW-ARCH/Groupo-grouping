import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/../../.env' });

import express from "express";
import cors from "cors";
import routes from "./routes";

// init logger
import {logger, registerApplicationLogger} from "groupo-shared-service/logging/logger";
import {handler} from "groupo-shared-service/apiutils/errors";
registerApplicationLogger("user-service");

const app = express();

// request pipeline
app.use(cors());
app.use(express.json());
app.use(routes);
app.use(handler);

// start server
const port = process.env.APP_PORT || "8080";
app.listen(port, () => {
    logger.info("start groupo-grouping successfully");
    logger.field("application-port", port).info("groupo-grouping is running");
});
