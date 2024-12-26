import {createReducer, on} from '@ngrx/store';
import {
    addTreatment,
    completeTreatmentRun,
    deleteTreatment,
    loadTreatments,
    startMaintenancePhase,
    updateTreatment
} from './treatment.actions';
import {getUpdatedTreatment, Treatment, TREATMENT_PHASE_MAINTENANCE_1, TREATMENT_PHASE_TARGET} from './treatment.model';
import moment from 'moment';

export function createTreatment(baseData: any, id?: number): Treatment {
    console.log("Data received", JSON.stringify(baseData))
    let targetDoseDuration = baseData.targetDoseDuration;
    let calcDuration = Math.round((targetDoseDuration / 5) * 100 + Number.EPSILON) / 100;
    let nextDoseDuration = baseData.nextDoseDuration || (baseData.treatmentPhase == TREATMENT_PHASE_TARGET ? targetDoseDuration : calcDuration);
    console.log("computed duration", JSON.stringify(nextDoseDuration))
    return Object.assign({}, baseData, {
        id: id || baseData.id || 1,
        initialDoseDuration: baseData.initialDoseDuration || calcDuration,
        nextDoseDuration: nextDoseDuration
    });
}

const initialState: Treatment[] = []

export const TreatmentsReducer = createReducer(
    initialState,
    on(addTreatment, (state, {treatment}) => {
        let nextId = state.map(t => t.id).reduce((p, v) => {
            return p > v ? p : v
        }, 0) + 1;
        let newTreatment = createTreatment(treatment, nextId);
        return [...state, newTreatment];
    }),
    on(updateTreatment, (state, {treatment}) => {
        return state.map(t => {
            return t.id === treatment.id ? Object.assign({}, t, treatment, {
                nextDose: treatment.nextDose > moment() ? treatment.nextDose : moment()
            }) : t;
        });
    }),
    on(deleteTreatment, (state, {treatmentId}) => state.filter(t => t.id !== treatmentId)),
    on(loadTreatments, (state, {treatments}) => treatments),
    on(completeTreatmentRun, (state, {treatment}) => {
        return state.map(t => {
            return t.id === treatment.id ? Object.assign({}, t, getUpdatedTreatment(treatment)) : t;
        })
    }),
    on(startMaintenancePhase, (state, {treatmentId}) => {
        return state.map(treatment => {
            return treatment.id === treatmentId ? Object.assign({}, treatment, {
                treatmentPhase: TREATMENT_PHASE_MAINTENANCE_1,
                completedRunsInPhase: 0,
                nextDose: moment().add(7, 'days'),
                nextDoseDuration: treatment.targetDoseDuration,
            }) : treatment;
        });
    })
);
