import { TreatmentHistoryReducer } from './treatment-history.reducer';
import {completeTreatmentRun, TreatmentActions} from './treatment.actions';
import {createTreatment} from "./treatment.reducer";
import {Exposure} from "./treatment-history.model";


describe('Unit: treatment history handling', () => {

    it('should save the picture when present, after run completes', () => {
        let treatment = createTreatment({
            id: 1, area: 'knee', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10, 
            targetDoseDuration: 15
        });
        let state: Exposure[] = [
        ];

        state = TreatmentHistoryReducer(state, completeTreatmentRun({treatment: treatment, image: 'image_url'}));
        expect(state[0].image).toBe('image_url');
    })

    // it('should initially load only last month of treatments', () => {
    //     expect(false).toBe(true);  // To be implemented
    // });

});
