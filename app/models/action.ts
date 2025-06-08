// Define interfaces for DTOs based on provided definitions
export interface ActionDTO {
    desc: string;
  }
  
 export  interface FormattedAction {
    description: string;
    date: string; // Using string since API typically returns ISO date strings
  }