import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { uploadFunc } from "../middleware/s3";
import ProjectAttachments from "../model/ProjectAttachments";

const addAttachmentSection = async( req: Request, res: Response) =>{
    const {projId} = req.body
    let {images, pdf} = req.body

    await ProjectAttachments.findOne({projectId: projId}).then(async(existing)=>{
        if(existing){
            return res.status(400).json({
                message: `Attachment file exists with id of ${existing._id}.`
            })
        }else{
            if(req.files){
                images = [];
                pdf = [];
            const documents = Object.values(req.files as any);
          
            const results = await uploadFunc(documents);
            if (results?.length) {
              for (let i = 0; i < results?.length; i++) {
                for (let j = 0; j < results[i].length; j++) {
                  const singleDoc = await results[i][j];
                  console.log(singleDoc)
          
                  if (singleDoc.field === "images") {
                    images.push(singleDoc.s3Upload.Location);
                  } else if (singleDoc.field === "pdf") {
                    pdf.push(singleDoc.s3Upload.Location);
                  }
                }
              }
              }
            } 


    const projectAttchments = new ProjectAttachments({
        projectId: projId,
        images: images ? images : [],
        pdf: pdf ? pdf : []
    });
    console.log(projectAttchments)
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
    const { projId, edit} = req.body;
    let {images, pdf}  = req.body //[]//s3
    
    await ProjectAttachments
      .findOne({projectId: projId})
      .exec()
      .then(async(proj)=>{
        if(!proj){
            return res.status(201).json({
                message: `No attachments for ${projId}.`
            })
        }
        else if (proj){
            if (edit.length){
            if(edit === 'add'){
                if(req.files){
                    images = [];
                    pdf = [];
                const documents = Object.values(req.files as any);
                const results = await uploadFunc(documents);
                if (results?.length) {
                  for (let i = 0; i < results?.length; i++) {
                    for (let j = 0; j < results[i].length; j++) {
                      const singleDoc = await results[i][j];
                      console.log(singleDoc, "singleDoc")
              
                      if (singleDoc.field === "images") {
                        images.push(singleDoc.s3Upload.Location);
                      } else if (singleDoc.field === "pdf") {
                        pdf.push(singleDoc.s3Upload.Location);
                      }
                    }
                  }
                  }
                } 
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
                if(pdf){
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
  
//   let {images, pdf} = req.body // []/s3
//   const documents = Object.values(req.files as any);

//   const results = await uploadFunc(documents);
//   images = [];
//   pdf = [];
//   if (results?.length) {
//     for (let i = 0; i < results?.length; i++) {
//       for (let j = 0; j < results[i].length; j++) {
//         const singleDoc = await results[i][j];

//         if (singleDoc.field === "images") {
//           images.push(singleDoc.s3Upload.Location);
//         } else if (singleDoc.field === "pdf") {
//           pdf.push(singleDoc.s3Upload.Location);
//         }
//       }
//     }
//   }