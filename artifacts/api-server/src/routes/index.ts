import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import chatRouter from "./chat.js";
import authRouter from "./auth.js";
import doctorsRouter from "./doctors.js";
import bookingsRouter from "./bookings.js";
import adminUsersRouter from "./adminUsersRoute.js";
import accountsRouter from "./accounts.js";
import blogRouter from "./blog.js";
import contactRouter from "./contact.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(authRouter);
router.use(doctorsRouter);
router.use(bookingsRouter);
router.use(adminUsersRouter);
router.use(accountsRouter);
router.use(blogRouter);
router.use(contactRouter);

export default router;
