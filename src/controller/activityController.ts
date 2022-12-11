import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Activity from "../model/ActivityLog";

const curDate = new Date().toISOString().split("T")[0].split("-");

const createActivityLog = async (req: Request, res: Response, next: NextFunction) => {
  const { name, userId, ipAddress, role } = req.body;
console.log(req.body)
  const UpdateIpAddress = await Activity.findOne({ ipAddress:ipAddress })
    .exec()
    .then((log) => {
      if (log) {
        console.log(log, 'got it')
        log.ipAddress = ipAddress;
        console.log(log.ipAddress)
        log.save()
          .then((updatedLog) => {
            console.log(updatedLog, 'shit')
             res.status(201).json({
              updatedLog,
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: error.message,
              error,
            });
          });
      } else {

        const activityLog = new Activity({
          _id: new mongoose.Types.ObjectId(),
          name,
          userId,
          ipAddress,
          role,
        });

        activityLog
        .save()
        .then((result) => {
          console.log(result)
          res.status(201).json({
            log: {
              _id: result.id,
              name: result.name,
              ipAddress: result.ipAddress,
              role: result.role,
            },
          });
        })
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
}


const getAllLogs = (req: Request, res: Response) => {
  console.log("getallLogs");
  Activity.find()
    .exec()
    .then((results) => {
      return res.status(200).json({
        logs: results,
        count: results.length,
      });
    });
};



export default { createActivityLog, getAllLogs };