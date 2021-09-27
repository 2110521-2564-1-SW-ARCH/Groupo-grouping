import { Router } from "express";
import * as BoardController from "../controllers/board.controller";

const boardRouter = Router();

boardRouter.get("/", BoardController.listBoard);
boardRouter.post("/", BoardController.createBoard);
boardRouter.get("/:boardID", BoardController.getBoard);
boardRouter.post("/:boardID/invite", BoardController.addMember);

export default boardRouter;
