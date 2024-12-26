import {Injectable} from '@angular/core';

import {Treatment} from './treatment.model';
import {Exposure} from './treatment-history.model';
import {createAction, props} from "@ngrx/store";

@Injectable()
export class TreatmentActions {
    static LOAD_TREATMENTS = '[Treatments] load';

    static LOAD_HISTORY = '[Hostory] load';

    static LOAD_RECENT_HISTORY = '[History] load recent';

    static TREATMENTS_SAVED = '[Treatments] save';

    static ADD_TREATMENT = '[Treatments] create';

    static UPDATE_TREATMENT = '[Treatments] update';

    static DELETE_TREATMENT = '[Treatments] delete';

    static TREATMENT_RUN_COMPLETE = '[History] complete';

    static TREATMENT_SET_MAINTENANCE = '[Treatments] set maintenance';

}

export const loadTreatments = createAction(TreatmentActions.LOAD_TREATMENTS,
    props<{ treatments: Treatment[] }>())

export const loadRecentHistory = createAction(TreatmentActions.LOAD_RECENT_HISTORY,
    props<{ history: Exposure[] }>())

export const treatmentsSaved = createAction(TreatmentActions.TREATMENTS_SAVED);

export const addTreatment = createAction(TreatmentActions.ADD_TREATMENT,
    props<{ treatment: unknown }>())

export const loadHistory = createAction(TreatmentActions.LOAD_HISTORY,
    props<{ history: Exposure[] }>())

export const startMaintenancePhase = createAction(TreatmentActions.TREATMENT_SET_MAINTENANCE,
    props<{ treatmentId: number }>())

export const completeTreatmentRun = createAction(TreatmentActions.TREATMENT_RUN_COMPLETE,
    props<{ treatment: Treatment, image?: any }>())

export const deleteTreatment = createAction(TreatmentActions.DELETE_TREATMENT,
    props<{ treatmentId: number }>())

export const updateTreatment = createAction(TreatmentActions.UPDATE_TREATMENT,
    props<{ treatment: Treatment }>())
