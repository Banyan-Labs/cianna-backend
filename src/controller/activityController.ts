import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Activity from "../model/ActivityLog";

const curDate = new Date().toISOString().split("T")[0].split("-");

const createActivityLog = async (req: Request, res: Response, next: NextFunction) => {
  const { name, userId, ipAddress, location, role } = req.body;
  

  await Activity.find({ userId })
  .then(async (userLog) => {
    if (userLog) {
      res
        .status(200)
        .json({ Log: userLog });
    } else {

      const activityLog = new Activity({
        _id: new mongoose.Types.ObjectId(),
        name,
        userId,
        ipAddress,
        location,
        role,
      });

      activityLog
        .save()
        .then((result) => {
          res.status(201).json({
            user: {
              _id: result.id,
              name: result.name,
              ipAddress: result.ipAddress,
              role: result.role,
              location: result.location
            },
          });
        })
        .catch((error) => {
          console.log(error);
          res.status(500).json({ message: error.message });
        });
    }
})
.catch((error) => {
  console.log(error);
  res.sendStatus(500);
});
};



export default { createActivityLog };