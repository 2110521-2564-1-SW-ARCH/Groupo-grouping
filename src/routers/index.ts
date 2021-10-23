import { Router } from "express";
import BoardRouter from "./board.router";
import GroupRouter from "./group.router";

const routes = Router();

routes.use('/board', BoardRouter);
routes.use('/group', GroupRouter);

export default routes;
