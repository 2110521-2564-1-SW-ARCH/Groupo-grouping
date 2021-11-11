import { Router } from "express";
import * as BoardController from "../controllers/board.controller";

const boardRouter = Router();

boardRouter.get("/", BoardController.listBoard);
boardRouter.post("/", BoardController.create);
boardRouter.get("/:boardID", BoardController.findBoard);
boardRouter.get("/:boardID/members", BoardController.listMember);
boardRouter.post("/:boardID/join", BoardController.join);
boardRouter.post("/:boardID/invite", BoardController.addMember);
boardRouter.put("/:boardID/member/tags", BoardController.updateMemberTags);

export default boardRouter;
