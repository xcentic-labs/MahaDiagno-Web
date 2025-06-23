import express from "express";
import { addWithdraw, deleteWithdraw, getAllWithdraws, getWithdrawByPartnerId } from "../Controller/withdrawController.js";


const withdrawRouter = express.Router();

withdrawRouter.post("/add", addWithdraw);
withdrawRouter.delete("/delete/:id", deleteWithdraw);
withdrawRouter.get("/get/:id", getWithdrawByPartnerId);


withdrawRouter.get("/all", (req, res) => {
    res.status(200).json({
        message: "Withdraw Fetched Sucessfully",
        withdraw: [
            {
                "id": 1,
                "amount": 15000,
                "status": "PENDING",
                "partnerId": 1,
                "paymentMethodId": 1,
                "createdAt": "2025-06-23T14:32:00.000Z",
                "updatedAt": "2025-06-23T14:32:00.000Z",
                "partner": {
                    "id": 1,
                    "hospitalName": "Mahadev Multispeciality Hospital",
                    "phoneNumber": "+91-9876543210",
                    "email": "contact@mahadevhospital.in"
                },
                "paymentMethod": {
                    "id": 1,
                    "bankName": "State Bank of India",
                    "accountNumber": "123456789012",
                    "ifscCode": "SBIN0001234",
                    "bankeeName": "Mahadev Hospital Admin"
                }
            },
            
        ]
    })
});
withdrawRouter.patch('/updatestatus', (req, res) => {

    res.status(200).json({
        message: "Withdraw Updated Sucessfully",
    })
})

export default withdrawRouter;
