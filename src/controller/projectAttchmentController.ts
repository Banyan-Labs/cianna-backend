import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import ProjectAttachments from "../model/ProjectAttachments";

const addAttachmentSection = async( req: Request, res: Response) =>{
    const {projId, images, rfp} = req.body

    const projectAttchments = new ProjectAttachments({
        projectId: projId,
        images: images.length ? images : [],
        rfp: rfp.length ? rfp : []
    });
    return await projectAttchments.save()
            .then((attachments)=>{
                if (attachments){
                    return res.status(201).json({
                        attachments
                    })
                }

            }).catch((error)=>{
                return res.status(500).json({
                    message: error.message
                })
            })
    
}
const getData = async (req: Request, res: Response) => {
    const { projId, images, pdf, edit } = req.body;
    await ProjectAttachments
      .findOne({ projId })
      .exec()
      .then(async(proj)=>{
        if(proj){
            if (edit.length){
            if(edit === 'add'){
                if(images.length){
                    proj.images = [...images, ...proj.images];
                }
                if(pdf.length){
                    proj.pdf = [...pdf, ...proj.pdf]
                }
            }else if(edit === 'replace'){
                if(images.length){
                    proj.images = [...images];
                }
                if(pdf.length){
                    proj.pdf = [...pdf]
                } 
            }
            await proj.save();
            }
            return res.status(200).json({
                proj
            })

        }
      }).catch((error)=>{
        return res.status(500).json({
            message: error.message
        })
      })
      
  };
  
  const deleteData = async (req: Request, res: Response) => {
    const { projId } = req.body;
  
    await ProjectAttachments
      .findOneAndDelete({ projId})
      .then((data) => {
        return res.status(200).json({
          message: `Successfully deleted ${data?.projectId}`,
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: error.message,
          error,
        });
      });
  };
  
  export default { addAttachmentSection, getData, deleteData };
  