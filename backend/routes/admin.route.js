import { Router } from "express"

import isAuthenticated from "../middleware/isAuthenticated.js";
import isAdmin from "../middleware/isAdmin.js";
import { addNewBatsman, completeInning, getMatch, inningsInit, matchInit, startNewOver, updateScore } from "../controllers/admin.controller.js";

const adminRouter = new Router();
adminRouter.post('/matchInit', isAuthenticated, isAdmin, matchInit)
adminRouter.post('/inningsInit', isAuthenticated, isAdmin, inningsInit)
adminRouter.post('/updateScore', isAuthenticated, isAdmin, updateScore)
adminRouter.post('/startNewOver', isAuthenticated, isAdmin, startNewOver)
adminRouter.post('/completeInning', isAuthenticated, isAdmin, completeInning)
adminRouter.post('/addNewBatsman', isAuthenticated, isAdmin, addNewBatsman)
adminRouter.get('/getMatch', isAuthenticated, getMatch)

export default adminRouter;