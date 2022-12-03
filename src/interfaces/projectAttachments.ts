import {Document} from 'mongoose'

interface RoomContainer {
    lightId: string;
    attachment:string;
}
export default interface ProjectAttachments {
    projectId: string;
    images: RoomContainer[]; 
    pdf: string[];
}