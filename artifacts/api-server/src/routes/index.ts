import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import chatRouter from "./chat.js";
import authRouter from "./auth.js";
import doctorsRouter from "./doctors.js";
import bookingsRouter from "./bookings.js";
import adminUsersRouter from "./adminUsersRoute.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(authRouter);
router.use(doctorsRouter);
router.use(bookingsRouter);
router.use(adminUsersRouter);

export default router;
