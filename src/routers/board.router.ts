import { Router } from "express";
import * as BoardController from "../controllers/board.controller";

const boardRouter = Router();

boardRouter.get("/", BoardController.listBoard);
boardRouter.post("/", BoardController.createBoard);
boardRouter.get("/:boardID", BoardController.getBoard);
boardRouter.get("/:boardID/invitations", BoardController.getBoardInvitations);
boardRouter.get("/:boardID/members", BoardController.getBoardMembers);
boardRouter.get("/:boardID/members_joined", BoardController.getBoardMembersJoined);
boardRouter.post("/:boardID/invite", BoardController.addMember);
boardRouter.post("/:boardID/join", BoardController.acceptInvitation);

boardRouter.post("/:boardID/groups", BoardController.createGroup);
boardRouter.put("/:boardID/groups/:groupID", BoardController.updateGroup);
boardRouter.delete("/:boardID/groups/:groupID", BoardController.deleteGroup);
boardRouter.post("/:boardID/groups/assign", BoardController.assignToGroup);

export default boardRouter;
