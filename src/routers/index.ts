import { Router } from "express";
import BoardRouter from "./board.router";

const routes = Router();

routes.use('/board', BoardRouter);

export default routes;
