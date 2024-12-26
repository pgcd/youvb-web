import {createTreatment, TreatmentsReducer} from './treatment.reducer';
import {addTreatment} from './treatment.actions';

describe('TreatmentList functionality', () => {
  it('should pick the correct treatment id when adding a new one', () => {
    let treatment = createTreatment({
      area: 'knee', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10
    });
    const state = [
      createTreatment({ id: 5, area: 'nose', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10 }),
      createTreatment({ id: 8, area: 'beard', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10 }),
    ];
    let result = TreatmentsReducer(state, addTreatment({treatment}));
    let added = result.find(x => x.area == 'knee')!;
    expect(added.id).toEqual(9);
  });

})
