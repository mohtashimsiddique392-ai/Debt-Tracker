import { Router, type IRouter } from "express";
import debtsRouter from "./debts";

const router: IRouter = Router();

router.use(debtsRouter);

export default router;