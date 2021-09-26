import * as ProfileController from "../controllers/profile.controller";
import {Router} from "express";

const profileRouter = Router();

profileRouter.get("/", ProfileController.getProfile);
profileRouter.post("/", ProfileController.register);
profileRouter.patch("/", ProfileController.updateProfile);

export default profileRouter;