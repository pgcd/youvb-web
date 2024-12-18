import { TreatmentsReducer } from './treatment.reducer';
import { TreatmentActions } from './treatment.actions';


describe('TreatmentList functionality', () => {
  it('should pick the correct treatment id when adding a new one', () => {
    let treatment = {
      area: 'knee', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10
    };
    const state = [
      { id: 5, area: 'nose', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10 },
      { id: 8, area: 'beard', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10 },
    ];
    const action = {
      type: TreatmentActions.ADD_TREATMENT,
      payload: treatment
    }
    let result = TreatmentsReducer(state, action);
    let added = result.find(x => x.area == 'knee');
    expect(added.id).toEqual(9);
  });

})