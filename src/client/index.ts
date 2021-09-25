import * as dotenv from "dotenv";
dotenv.config({ path: __dirname+'/../../.env' });

import express from "express";
import cors from "cors";
import routes from "./routes";
// import {errorHandler} from "./error";

const app = express();

app.use(cors())
app.use(express.json());

app.use(routes);

// app.use(errorHandler);

const port = process.env.APP_PORT || "8080";
app.listen(port, () => {
    console.log("Started groupo-grouping successfully");
    console.log(`groupo-grouping (GRPC Client) is running on port ${port}`);
});
