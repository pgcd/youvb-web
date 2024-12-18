import { TreatmentHistoryReducer } from './treatment-history.reducer';
import { TreatmentActions } from './treatment.actions';
import { Treatment } from './treatment.model';


describe('Unit: treatment history handling', () => {

    it('should save the picture when present, after run completes', () => {
        let treatment = <Treatment>{
            id: 1, area: 'knee', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10, 
            targetDose: 15
        };
        let state = [
        ];

        const action = {
            type: TreatmentActions.TREATMENT_RUN_COMPLETE,
            payload: {treatment: treatment, image: 'image_url'}
        }
        state = TreatmentHistoryReducer(state, action);
        expect(state[0].image).toBe('image_url');
    })

    it('should initially load only last month of treatments', () => {
        expect(false).toBe(true);  // To be implemented
    });

});