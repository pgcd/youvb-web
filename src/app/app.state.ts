import { Treatment } from './treatments/treatment.model';
import { Exposure } from "./treatments/treatment-history.model";

export interface AppState {
    treatments: Treatment[];
    treatmentHistory: Exposure[];
}
