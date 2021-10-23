import { Router } from "express";
import * as GroupController from "../controllers/group.controller";

const groupRouter = Router();

groupRouter.post("/", GroupController.create);
groupRouter.put("/:groupID", GroupController.update);
groupRouter.delete("/:groupID", GroupController.remove);

export default groupRouter;
