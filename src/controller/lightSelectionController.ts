import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { Finish, ProposalTableRow } from "../interfaces/rfpDocInterface";
import LightSelection from "../model/LIghtSelection";
import RFP from "../model/RFP";
import Room from "../model/Room";

const lightSelected = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    item_ID,
    exteriorFinish,
    interiorFinish,
    lensMaterial,
    glassOptions,
    acrylicOptions,
    environment,
    safetyCert,
    projectVoltage,
    socketType,
    mounting,
    crystalType,
    crystalPinType,
    crystalPinColor,
    roomName,
    roomId,
    projectId,
    clientId,
    quantity,
  } = req.body.light;

  const light = new LightSelection({
    _id: new mongoose.Types.ObjectId(),
    item_ID,
    exteriorFinish,
    interiorFinish,
    lensMaterial,
    glassOptions,
    acrylicOptions,
    environment,
    safetyCert,
    projectVoltage,
    socketType,
    mounting,
    crystalType,
    crystalPinType,
    crystalPinColor,
    roomName,
    roomId,
    projectId,
    clientId,
    quantity,
  });
  const lightAndRoom = await Room.findByIdAndUpdate({ _id: roomId })
    .exec()
    .then((room) => {
      if (room) {
        room.lights = [...room.lights, light._id];
        room.save();
        const roomSuccess = `added light to room: ${roomId}`;
        return light
          .save()
          .then(async (light) => {
            if (light) {
              const updated = await rfpUpdater(req.body.light);
              if (updated) {
                return res.status(201).json({
                  light,
                  message: roomSuccess,
                });
              }
            }
          })
          .catch((error) => {
            return res.status(500).json({
              message: error.message,
              error,
            });
          });
      } else {
        next();
      }
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });

  return lightAndRoom;
};
const rfpUpdater = async (body: any) => {
  const {
    item_ID,
    exteriorFinish,
    interiorFinish,
    lensMaterial,
    glassOptions,
    acrylicOptions,
    roomName,
    projectId,
    quantity,
    description,
    lampType,
    lampColor,
    wattsPer,
    totalWatts,
    numberOfLamps,
    totalLumens,
  } = body;
  return await RFP.findOne({ projectId: projectId })
    .exec()
    .then(async (rfpFound) => {
      if (rfpFound) {
        const tableRow = rfpFound.tableRow.length > 0;
        console.log("TABLE ROW pre item find: ", rfpFound.tableRow);
        const rowItem = rfpFound.tableRow
          .slice()
          .find((item) => item.itemID == item_ID);
        console.log("#########tablerow: ", tableRow);

        const finishes: any = {
          exteriorFinish: exteriorFinish,
          interiorFinish: interiorFinish,
          lensMaterial: lensMaterial,
          glassOptions: glassOptions,
          acrylicOptions: acrylicOptions,
        };

        const projectRow = {
          itemID: item_ID,
          rooms: [{ name: roomName, roomLights: quantity }], //??
          lightQuantity: quantity,
          finishes: finishes,
          description: description, //need
          lampType: lampType, 
          lampColor: lampColor, 
          wattsPer: wattsPer, 
          totalWatts: totalWatts * quantity, 
          numberOfLamps: numberOfLamps,
          totalLumens: totalLumens * quantity,
          subTableRow: [],
        };

        if (tableRow && rowItem) {
          let runCheck = [];
          let rowFinishes: any = rowItem.finishes;
          for (let key in rowFinishes) {
            console.log("key in rowFinishes: ", key);
            runCheck.push(rowFinishes[key] == finishes[key]);
          }
          if (runCheck.some((item) => item == false)) {
            const subs = rowItem.subTableRow;
            if (subs) {
              rowItem.subTableRow = [projectRow, ...subs];
            }
          }
          const newQuantity = rowItem.lightQuantity + quantity;
          const newWattage = totalWatts * newQuantity;
          const newTotalLumens = totalLumens * newQuantity;
          const rooms = rowItem.rooms;
          rowItem.lightQuantity = newQuantity;
          rowItem.totalWatts = newWattage;
          rowItem.totalLumens = newTotalLumens;
          rowItem.rooms = [{ name: roomName, roomLights: quantity }, ...rooms];
          const runArray = rfpFound.tableRow.map((item: ProposalTableRow) => {
            if (item.itemID === rowItem.itemID) return rowItem;
            else return item;
          });
          rfpFound.tableRow = runArray
            
          console.log("rfpTABLEROW: ", rfpFound.tableRow);
          try {
            const done = await rfpFound.save();
            console.log("======= rfpSuccess update: ", {
              rfpFound: rfpFound.tableRow,
              rowItem: rowItem,
              done: done
            });
            if (done) return done;
          } catch (error: any) {
            console.log("===--- Error in update: ", error);
          }
        } else {
          console.log("`````````````TableRow: ", rfpFound.tableRow);
          const updateRow: ProposalTableRow[] | [] = [
            projectRow,
            ...rfpFound.tableRow,
          ];
          console.log("UPDAAAAATTTTEEEE ROW: ", updateRow);
          rfpFound.tableRow = updateRow;
          console.log("~~~~~~~~~RFPFOUND Yo!: ", rfpFound);
          try {
            const done = await rfpFound.save();
            console.log("~~~rfpSuccess update ADD: ", {
              rfpFound: rfpFound,
              newRow: updateRow,
            });
            if (done) return done;
          } catch (error: any) {
            console.log("~~~error in rfpUpdateADD!: ", error);
          }
        }
      }
    });
};

const getAllSelectedLights = (req: Request, res: Response) => {
  const { roomId } = req.body;
  if (roomId && roomId.length) {
    LightSelection.find({ roomId })
      .then((lights) => {
        return res.status(200).json({
          lights,
        });
      })
      .catch((error) => {
        return res.status(500).json({ message: error.message, error });
      });
  } else {
    LightSelection.find()
      .then((lights) => {
        return res.status(200).json({
          lights,
        });
      })
      .catch((error) => {
        return res.status(500).json({ message: error.message, error });
      });
  }
};
const getSelectedLight = async (req: Request, res: Response) => {
  const keys = Object.keys(req.body).filter((key: string) => key != "_id");
  const parameters = Object.fromEntries(
    keys.map((key: string) => [key, req.body[key.toString()]])
  );
  console.log(parameters, "params object");
  return await LightSelection.findOne({ _id: req.body._id })
    .exec()
    .then((light: any) => {
      if (light && keys.length) {
        keys.map((keyName: string) => {
          light[keyName] = parameters[keyName];
        });
        light.save();
      }
      console.log(`light_selected:${light?.item_ID}`);
      return res.status(200).json({
        light,
      });
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message, error });
    });
};

const deleteSelectedLight = async (req: Request, res: Response) => {
  // console.log(req.body, 'hello', req.body.roomId)
  return await Room.findByIdAndUpdate({ _id: req.body.roomId })
    .exec()
    .then(async (room) => {
      if (room) {
        room.lights = room.lights.filter((id: string) => {
          return String(id) !== req.body._id ? id : "";
        });
        room.save();
        const lightRemoved = "light removed successfully from room";
        return await LightSelection.findByIdAndDelete({ _id: req.body._id })
          .then((lightSelection) => {
            return !lightSelection
              ? res.status(200).json({
                  lightSelection,
                })
              : res.status(404).json({
                  message:
                    "The light selection you are looking for no longer exists",
                  lightRemoved,
                });
          })
          .catch((error) => {
            res.status(500).json(error);
          });
      } else {
        return "failed to delete light from room";
      }
    });
};

export default {
  lightSelected,
  getAllSelectedLights,
  deleteSelectedLight,
  getSelectedLight,
};
