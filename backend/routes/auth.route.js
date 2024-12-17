import { Router } from "express"
import { activateUser, getUser, loginUser, logoutUser, registerUser } from "../controllers/auth.controller.js";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getMatch } from "../controllers/admin.controller.js";

const authRouter = new Router();
authRouter.post('/signup', registerUser);
authRouter.post('/activate', activateUser);
authRouter.post('/login', loginUser);
authRouter.get('/logout', isAuthenticated , logoutUser);
authRouter.get('/me', isAuthenticated , getUser);
authRouter.get('/getMatch', isAuthenticated, getMatch)

export default authRouter;