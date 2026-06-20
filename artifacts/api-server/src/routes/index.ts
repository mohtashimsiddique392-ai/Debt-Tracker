import { Router, type IRouter } from "express";
import healthRouter from "./health";
import debtsRouter from "./debts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(debtsRouter);

export default router;
