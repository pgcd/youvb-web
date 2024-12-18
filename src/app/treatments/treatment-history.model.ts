import { Treatment } from './treatment.model';

export interface Exposure {
    treatmentData: Treatment,
    when: Date,
    runDuration: number,
    treatmentId: number,
    image?: string,
}
