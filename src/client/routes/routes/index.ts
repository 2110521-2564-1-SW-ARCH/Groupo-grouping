import { Router } from "express";
import AuthRouter from "./auth.router";
import ProfileRouter from "./profile.router";

const routes = Router();

routes.use('/auth', AuthRouter);
routes.use('/profile', ProfileRouter);

export default routes;
