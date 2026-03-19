import {Router} from "express";
import { registerUser } from "../controllers/user.controller.js";
const router=Router()
router.route("/register").post(registerUser)
// we can make other method also like /login
export default router;