import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import ProjectAttachments from "../model/ProjectAttachments";

const addAttachmentSection = async( req: Request, res: Response) =>{
    console.log(req.body)
    const {projId, images, pdf} = req.body
    console.log(projId, images)

    await ProjectAttachments.findOne({projId}).then(async(existing)=>{
        if(existing){
            return res.status(400).json({
                message: `Attachment file exists with id of ${existing._id}.`
            })
        }else{
    const projectAttchments = new ProjectAttachments({
        projectId: projId,
        images: images ? images : [],
        pdf: pdf ? pdf : []
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
        }).catch((error)=>{
            return res.status(500).json({
                message: error.message
            })
        })
    
}
const getData = async (req: Request, res: Response) => {
    console.log(req.body)
    const { projId, images, pdf, edit } = req.body;
    console.log(projId, images, edit)
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
                if(images ){            
                    proj.images = [...images];
                }
                if(pdf ){
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
  