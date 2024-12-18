import { Injectable } from '@angular/core';

import { Treatment } from './treatment.model';
import { Exposure } from './treatment-history.model';
import {ActionWithPayload} from '../action-with.payload';

@Injectable()
export class TreatmentActions {
    static LOAD_TREATMENTS = 'LOAD_TREATMENTS';
    loadTreatments(treatments: Treatment[]): ActionWithPayload {
        return {
            type: TreatmentActions.LOAD_TREATMENTS,
            payload: treatments
        }
    }

    static LOAD_HISTORY = 'LOAD_HISTORY';
    loadHistory(history: Exposure[]): ActionWithPayload {
        return {
            type: TreatmentActions.LOAD_HISTORY,
            payload: history
        }
    }

    static LOAD_RECENT_HISTORY = 'LOAD_RECENT_HISTORY';
    loadRecentHistory(): ActionWithPayload {
        return {
            type: TreatmentActions.LOAD_RECENT_HISTORY,
            payload: history
        }
    }

    static TREATMENTS_SAVED = 'TREATMENTS_SAVED';
    treatmentsSaved(): ActionWithPayload {
        return {
            type: TreatmentActions.TREATMENTS_SAVED,
            payload: {}
        }
    }

    static ADD_TREATMENT = 'ADD_TREATMENT';
    addTreatment(treatment: Treatment): ActionWithPayload {
        return {
            type: TreatmentActions.ADD_TREATMENT,
            payload: treatment
        }
    }

    static UPDATE_TREATMENT = 'UPDATE_TREATMENT';
    updateTreatment(treatment: Treatment): ActionWithPayload {
        return {
            type: TreatmentActions.UPDATE_TREATMENT,
            payload: treatment
        }
    }

    static DELETE_TREATMENT = 'DELETE_TREATMENT';
    deleteTreatment(treatment: Treatment): ActionWithPayload {
        return {
            type: TreatmentActions.DELETE_TREATMENT,
            payload: treatment.id
        }
    }

    static TREATMENT_RUN_COMPLETE = 'TREATMENT_RUN_COMPLETE';
    completeTreatmentRun(payload: {treatment: Treatment, image: any}): ActionWithPayload {
        return {
            type: TreatmentActions.TREATMENT_RUN_COMPLETE,
            payload: payload
        }
    }

    static TREATMENT_SET_MAINTENANCE = 'TREATMENT_SET_MAINTENANCE';
    startMaintenancePhase(treatment: Treatment): ActionWithPayload {
        return {
            type: TreatmentActions.TREATMENT_SET_MAINTENANCE,
            payload: treatment.id
        }
    }

}
