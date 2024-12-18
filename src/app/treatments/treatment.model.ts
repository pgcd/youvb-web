import moment from 'moment';
import {Injectable} from "@angular/core";
import {Store, createSelector} from "@ngrx/store";
import {AppState} from "../app.state";

export const TREATMENT_PHASE_RAMPUP = 'ramp-up';
export const TREATMENT_PHASE_TARGET = 'target';
export const TREATMENT_PHASE_MAINTENANCE_1 = 'maintenance1';
export const TREATMENT_PHASE_MAINTENANCE_2 = 'maintenance2';
export const TREATMENT_PHASE_MAINTENANCE_3 = 'maintenance3';

export const TreatmentPhases = [
    {'key': TREATMENT_PHASE_RAMPUP, 'verbose': 'Ramp-up to full duration', intervalDays: 2},
    {'key': TREATMENT_PHASE_TARGET, 'verbose': 'Full duration reached', intervalDays: 2},
    {'key': TREATMENT_PHASE_MAINTENANCE_1, 'verbose': 'maintenance - first month', intervalDays: 7},
    {'key': TREATMENT_PHASE_MAINTENANCE_2, 'verbose': 'maintenance - second month', intervalDays: 14},
    {'key': TREATMENT_PHASE_MAINTENANCE_3, 'verbose': 'maintenance - until remission', intervalDays: 28},
];

function getTreatmentPhase(phase_key?: string) {
    const phase = TreatmentPhases.find(x => x.key === phase_key);
    if (!phase) {
        throw new Error('Unexpected phase key: ' + phase_key)
    }
    return phase;
}

export const getVerboseTreatmentPhase = (phase_key: string) => {
    const phase = getTreatmentPhase(phase_key);
    return phase.verbose
}

export interface Treatment {
    /*
    Planner data should include:
    - area
    - last timer run (default: never)
    - last timer duration (default: 0)
    - number of completed treatments (TN)
    - number of treatments in current phase
    - target duration: 250% MED
    - treatment phase: [initial, ramp-up, maintenance (1, 2 or 3)]
    - next treatment duration
        - initial: 50% MED or as entered
        - ramp-up: last duration + initial/5
        - target: target duration
        - maintenance 1: target duration
        - maintenance 2: target duration * 0.75
        - maintenance 3: target duration * 0.50
    - next treatment planning
        - ramp-up: today + 2 days
        - maintenance 1: today + 7 days
        - maintenance 2: today + 14 days
        - maintenance 3: today + 28 days
    - treatment phase duration
        - ramp-up: 20 treatments
        - target: until clearance >= 95%
        - maintenance 1: 4 treatments
        - maintenance 2: 4 treatments
        - maintenance 3: as needed
    - missed treatment before maintenance
        - up to 7 days: same
        - up to 14 days: next duration = last duration * 0.75
        - up to 21 days: next duration = last duration * 0.5
        - more than 21 days: initial duration

    * ref: https://solarcsystems.com/en/information/faq/?v=920f83e594a1
    * ref: https://www.aad.org/practice-tools/quality-care/clinical-guidelines/psoriasis/phototherapy-and-photochemotherapy/uvb-therapy
    * Dermalight 80: 3.5mW/cm2 ->
    * by skin type:
        I	130	15  2000  -> initial 40 sec, increase by 4, max 571
        II	220	25	2000  -> initial 62 sec, increase by 7, max 571
        III	260	40	3000  -> initial 74, increase by 11, max 857
        IV	330	45	3000  -> initial 94, increase by 13, max 857
        V	350	60	5000  -> initial 100, increase by 17, max 1428
        VI	400	65	5000  -> initial 114, increase by 19, max 1428

    * ref: http://www.icid.salisbury.nhs.uk/CLINICALMANAGEMENT/DERMATOLOGY/Pages/TL-01NarrowbandUVBPhototherapyStandardsandProtocols.aspx#psoriasis
    Type    Start Dose  2nd Dose    3rd Dose    4th Dose    Subsequent Increments
    I	    100mJ/cm2	140mJ/cm2	180mJ/cm2	220mJ/cm2	20% of previous dose
    II	    120mJ/cm2	170mJ/cm2	220mJ/cm2	270mJ/cm2	20% of previous dose
    III	    150mJ/cm2	210mJ/cm2	270mJ/cm2	330mJ/cm2	20% of previous dose
    IV	    200mJ/cm2	280mJ/cm2	360mJ/cm2	440mJ/cm2	20% of previous dose
    V	    300mJ/cm2	420mJ/cm2	540mJ/cm2	600mJ/cm2	20% of previous dose
    VI	    500mJ/cm2	700mJ/cm2	900mJ/cm2	1100mJ/cm2	20% of previous dose
    */

    id: number,
    area: string,
    lastDose: Date,  // actually date or datetime
    nextDose: Date,  // actually date or datetime, computed
    lastDoseDuration: number,
    nextDoseDuration: number,  // actually computed 230 * 1.05,
    completedRuns: number,
    completedRunsInPhase: number,
    runsInPhase: number,
    targetDose: number,
    initialDose: number,
    treatmentPhase: string,  // Validate with TreatmentPhases,
}


export function getUpdatedTreatment(treatment: Treatment) {
    /*
    Updates all values in treatment after successful run; temporary location until i figure out how to add this to the reducer or whatever
    */
    let nextDuration;
    let nextPhase;
    let completedRuns = Number((treatment.completedRuns || 0)) + 1;
    let completedRunsInPhase = Number((treatment.completedRunsInPhase || 0)) + 1;
    let updatedValues = {
        initialDose: Number(treatment.initialDose || treatment.nextDoseDuration),
        nextDose: null,
        lastDose: new Date(),
        targetDose: 0
    };
    updatedValues['targetDose'] = Number(treatment.targetDose || (updatedValues.initialDose * 5))  // this assumes 50% MED as initial and twenty 10% MED increase treatments
    // Either way, the increase should be a fifth of the initialDose
    const increment = updatedValues.initialDose / 5;
    switch (treatment.treatmentPhase) {
        // @ts-expect-error: Fallthrough
        case TREATMENT_PHASE_MAINTENANCE_1:
            if (completedRunsInPhase < 4) {
                nextPhase = TREATMENT_PHASE_MAINTENANCE_1;
                nextDuration = treatment.targetDose;
                break;
            } else {
                completedRunsInPhase = 0;  // Reset counter and continue to 2
            }
        // @ts-expect-error: Fallthrough
        case TREATMENT_PHASE_MAINTENANCE_2:
            if (completedRunsInPhase < 4) {
                nextPhase = TREATMENT_PHASE_MAINTENANCE_2;
                nextDuration = treatment.targetDose * 0.75;
                break;
            } else {
                completedRunsInPhase = 0;   // Reset counter and continue to 3
            }
        // eslint-disable-next-line no-fallthrough
        case TREATMENT_PHASE_MAINTENANCE_3:
            nextPhase = TREATMENT_PHASE_MAINTENANCE_3;
            nextDuration = treatment.targetDose * 0.5;
            break;
        case TREATMENT_PHASE_TARGET:
            nextDuration = treatment.nextDoseDuration;
            nextPhase = TREATMENT_PHASE_TARGET;
            break;
        case TREATMENT_PHASE_RAMPUP:
        case undefined:
            nextDuration = Number(treatment.nextDoseDuration) + Number(increment);  // TODO: Move to function
            nextPhase = TREATMENT_PHASE_RAMPUP;
            if (nextDuration >= treatment.targetDose) {
                nextDuration = treatment.targetDose;
                nextPhase = TREATMENT_PHASE_TARGET;
                completedRunsInPhase = 0;
            }
            break;
    }

    const nextDose = moment().add(getTreatmentPhase(nextPhase).intervalDays, 'days');

    updatedValues = Object.assign({}, updatedValues, {
        completedRuns: completedRuns,
        completedRunsInPhase: completedRunsInPhase,
        lastDoseDuration: treatment.nextDoseDuration,
        nextDose: nextDose,
        nextDoseDuration: nextDuration ? nextDuration.toFixed(2) : nextDuration,
        treatmentPhase: nextPhase,
    });
    return updatedValues;
}


export function updateTreatmentOnStart(treatment: Treatment) {
    console.log('Updating treatment: ', JSON.stringify(treatment))
    // Should update the run duration and the phase, if needed, depending on time since last treatment
    let daysLate = moment.duration(moment().diff(moment(treatment.nextDose))).asDays();
    if ((treatment.treatmentPhase != TREATMENT_PHASE_RAMPUP && treatment.treatmentPhase != TREATMENT_PHASE_TARGET) || daysLate < 7) {
        return treatment;
    }

    if (daysLate >= 7) {
        treatment.nextDoseDuration = treatment.lastDoseDuration * 0.75;
    }
    if (daysLate > 14) {
        treatment.nextDoseDuration = treatment.lastDoseDuration * 0.5;
    }
    if (daysLate > 21) {
        treatment.nextDoseDuration = treatment.initialDose;
    }
    // In any case, it should never go below initialDose
    treatment.nextDoseDuration = Math.max(treatment.nextDoseDuration, treatment.initialDose);
    // And, in any case, we should return to ramp-up phase, so we can return to the target dose
    treatment.treatmentPhase = TREATMENT_PHASE_RAMPUP;
    console.log('Treatment updated: ', JSON.stringify(treatment))
    return treatment;
}


export const allTreatments = (state: AppState) => state.treatments;

export const listTreatments = createSelector(
    allTreatments,
    (treatments: Treatment[]) => {
        treatments.toSorted((a, b) => {
            return +(moment(a.nextDose) || moment().add(1, 'd')) - +(moment(b.nextDose) || moment().add(1, 'd'));
        })
    }
)


export const getTreatment = (id: number) => createSelector(allTreatments, (allItems: Treatment[]) => {
    return allItems.find((item: Treatment) => {
        return item.id === id;
    });
});
