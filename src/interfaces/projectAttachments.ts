import {Document} from 'mongoose'

export default interface ProjectAttachments {
    projectId: string;
    images: string[]; 
    pdf: string[];
}