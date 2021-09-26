import { Router } from "express";
import * as UserController from "../controllers/auth.controller";

const userRouter = Router();

userRouter.post("/login", UserController.login);
userRouter.post("/refresh", UserController.refreshAccessToken);

export default userRouter;
