import { ActionReducer } from '@ngrx/store';
import { TreatmentActions } from './treatment.actions';
import { Treatment, getUpdatedTreatment, TREATMENT_PHASE_MAINTENANCE_1, TREATMENT_PHASE_TARGET } from './treatment.model';
import moment from 'moment';
import {ActionWithPayload} from "../action-with.payload";


export const TreatmentsReducer: ActionReducer<Treatment[]> = (state: Treatment[] = [], action: ActionWithPayload) => {
    switch (action.type) {
        case TreatmentActions.ADD_TREATMENT:
            let nextId = state.map(t => t.id).reduce((p, v) => {return p > v ? p : v}, 0) + 1;
            let calcDuration = (action.payload.targetDose / 5).toFixed(2);
            let nextDoseDuration = action.payload.treatmentPhase == TREATMENT_PHASE_TARGET ? action.payload.targetDose : calcDuration;
            return [...state, Object.assign({}, action.payload, { id: nextId, initialDose: calcDuration, nextDoseDuration: nextDoseDuration })];
        case TreatmentActions.UPDATE_TREATMENT:
            return state.map(Treatment => {
                return Treatment.id === action.payload.id ? Object.assign({}, Treatment, action.payload, {
                    nextDose: action.payload.nextDose > moment()?action.payload.nextDose:moment()
                }) : Treatment;
            });
        case TreatmentActions.DELETE_TREATMENT:
            return state.filter(Treatment => Treatment.id !== action.payload);
        case TreatmentActions.LOAD_TREATMENTS:
            return action.payload;
        case TreatmentActions.TREATMENT_RUN_COMPLETE:
            return state.map(treatment => {
                return treatment.id === action.payload.treatment.id ? Object.assign({}, treatment, getUpdatedTreatment(treatment)) : treatment;
            });
        case TreatmentActions.TREATMENT_SET_MAINTENANCE:
            return state.map(treatment => {
                return treatment.id === action.payload ? Object.assign({}, treatment, {
                    treatmentPhase: TREATMENT_PHASE_MAINTENANCE_1,
                    completedRunsInPhase: 0,
                    nextDose: moment().add(7, 'days'),
                    nextDoseDuration: treatment.targetDose,
                }) : treatment;
            });

        default:
            return state;
    }
}
