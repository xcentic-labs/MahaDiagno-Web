import express from "express";
import { addWithdraw, deleteWithdraw, getAllWithdraws, getWithdrawByPartnerId, updateWithdrawStatus } from "../Controller/withdrawController.js";


const withdrawRouter = express.Router();

withdrawRouter.post("/add", addWithdraw);
withdrawRouter.delete("/delete/:id", deleteWithdraw);
withdrawRouter.get("/get/:id", getWithdrawByPartnerId);


withdrawRouter.get("/all", getAllWithdraws);
withdrawRouter.patch('/updatestatus/:id', updateWithdrawStatus)

export default withdrawRouter;
