import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import ProjectAttachments from "../model/ProjectAttachments";

const addAttachmentSection = async( req: Request, res: Response) =>{
    const {projId, images, pdf} = req.body
    console.log("projectId in attachments: ",projId)
    console.log( "attchYO: ",req.body)
    await ProjectAttachments.findOne({projectId: projId}).then(async(existing:any)=>{
        if(existing){
            if(images && images.length){
                // const singleInstances = [...new Set(proj.images)]
                existing.images = [...images, ...existing.images]
            }
            if(pdf && pdf.length){
                const singleInstances = [...new Set(existing.pdf)]
                existing.pdf = [...new Set([...pdf, ...singleInstances])]
            }
            await existing.save()
            return res.status(200).json({
                attachments: {...existing._doc}
            });

            // return getData(req, res)
            // return res.status(400).json({
            //     message: `Attachment file exists with id of ${existing._id}.`
            // })
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
    const { projId, images, pdf, edit } = req.body;
    await ProjectAttachments
      .findOne({ projectId: projId })
      .exec()
      .then(async(proj)=>{
        if(proj){
            if (edit.length){
            if(edit === 'add'){
                if(images && images.length){
                    // const singleInstances = [...new Set(proj.images)]
                    proj.images = [...images, ...proj.images]
                }
                if(pdf && pdf.length){
                    const singleInstances = [...new Set(proj.pdf)]
                    proj.pdf = [...new Set([...pdf, ...singleInstances])]
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
 
  /**
   * 
   *    Can Be reFormatted to include possibility for images, but will be only for PDF currently
   */
  const deleteData = async (req: Request, res: Response) => {
    const { projId, item, images } = req.body;
    if(item && item.length || images && images.length) {
        await ProjectAttachments.findOne({projectId: projId}).then(async(projectAttach)=>{
            if(projectAttach){
                if(images && images.length ){
                    let copyOfImages = projectAttach.images.slice() 
                    console.log("COPYOFIMAGES!!!!!: ", copyOfImages.length, copyOfImages)
                    await images.map((containerId:any)=>{ 
                        const indexCheck = copyOfImages.map(v=> v.lightId).indexOf(containerId);
                        if(indexCheck > -1){
                            copyOfImages = copyOfImages.filter((item, index)=> index != indexCheck)
                        }
                         
                    });
                    /**
                     * USE THIS LOGIC IN CREATE IF EXISTS EASIEST WORK AROUND
                     */
                    console.log("COPYOFPost images`````!!!!!: ", copyOfImages.length, copyOfImages)
                    projectAttach.images = copyOfImages;
                    const imageVSpdf = copyOfImages.map((img)=> img.attachment);
                    const pdfVSimg = projectAttach.pdf.filter((pdf)=> imageVSpdf.indexOf(pdf) > -1);
                    console.log("IMGvspdf: ", imageVSpdf)
                    console.log("PDFvsimg: ", pdfVSimg)
                    if(pdfVSimg.length !== projectAttach.pdf.length){
                        projectAttach.pdf = pdfVSimg;
                    }
                }
                if(item && item.length){
                const filteredPDF =  projectAttach.pdf.filter((internal:string)=> internal !== item);
                const filteredImages = projectAttach.images.filter((internal)=> internal.attachment !== item)
                projectAttach.pdf = filteredPDF;
                projectAttach.images = filteredImages;
                }
                await projectAttach.save()
                return res.json({
                    message: `Deleted ${item ? item : "item"} from attachments with projectId of ${projId}.`,
                    projectAttach
                })
            }
        })
    }else{
  
    await ProjectAttachments
      .findOneAndDelete({projId})
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
    }
  };
  
  export default { addAttachmentSection, getData, deleteData };
  