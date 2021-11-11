import { Router } from "express";
import BoardRouter from "./board.router";

const routes = Router();

routes.get('/', (req, res) => {
    res.status(200).json({});
});
routes.use('/board', BoardRouter);

export default routes;
