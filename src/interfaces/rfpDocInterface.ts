import { Document } from "mongoose";

export interface Finish {
  exteriorFinish: string;
  interiorFinish: string;
  lensMaterial: string;
  glassOptions: string;
  acrylicOptions: string;
}

export interface Room {
    name: string;
    roomLights: number;
}


export interface ProposalTableRow {
  itemID: string; // changes on first insertion 
  rooms: Room[]; // updates each time a room is added, and updates lightQuantity
  lightQuantity: number; // increases on each room
  description: string; // updates on first light insertion
  finishes: Finish; // changes on first light insertion
  lampType: string; // changes on first light insertion
  lampColor: string; // changes first light insertion
  wattsPer: string; // changes on first light insertion
  totalWatts: number; // increases with each "power in watts" coming in
  numberOfLamps: number // increases with each "number of lights"
  totalLumens: number; // increases with each light insertion
  subTableRow: ProposalTableRow[] | []; // fills in if secondary customization of light added with new copy
}

export default interface rfpDocInterface extends Document {
  header: string; // project name && creates rfp
  projectId: string; //projectId
  clientId: string;
  clientName: string; 
  tableRow: ProposalTableRow[] | []
}
