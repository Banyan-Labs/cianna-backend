import { Document } from "mongoose";

export interface Schedule {
  date: string;
  notes: string;
  timeFrame: string;
}

export interface Finish {
  exteriorFinish: string;
  interiorFinish: string;
  lensMaterial: string;
  glassOptions: string;
  acrylicOptions: string;
}

export interface ProposalTableRow {
  itemID: string;
  rooms: string[];
  description: string;
  finishes: Finish;
  subTableRow: ProposalTableRow[] | string[] | Contact[];
}

export default interface rfpDocInterface extends Document {
  header: string; // project name && creates rfp
  projectId: string; //projectId
  clientId: string;
  clientName: string; 
  tableRow: ProposalTableRow[]
}
