import {createTreatment, TreatmentsReducer} from './treatment.reducer';
import {
    addTreatment,
    completeTreatmentRun,
    startMaintenancePhase,
    TreatmentActions,
    updateTreatment
} from './treatment.actions';
import {
    Treatment,
    TREATMENT_PHASE_RAMPUP,
    TREATMENT_PHASE_TARGET,
    TREATMENT_PHASE_MAINTENANCE_1,
    TREATMENT_PHASE_MAINTENANCE_2,
    TREATMENT_PHASE_MAINTENANCE_3,
    updateTreatmentOnStart,
    getUpdatedTreatment
} from './treatment.model';
// Add the import the module from the package 
import moment from 'moment';

describe('Unit: treatment detail and timer handling', () => {
    it('endtimer should update the treatment last run and duration at the end', () => {
        const treatment = <Treatment>createTreatment({
            area: 'knee', lastDose: null, lastDoseDuration: null, nextDose: null, nextDoseDuration: 10
        });
        const state = [
            treatment,
            createTreatment({
                id: 2,
                area: 'nose',
                lastDose: null,
                lastDoseDuration: null,
                nextDose: null,
                nextDoseDuration: 10
            }),
        ];

        const result = TreatmentsReducer(state, completeTreatmentRun({treatment: treatment, image: null}));
        const changed = result.find((v) => v.id == 1)!;
        const unchanged = result.find((v) => v.id == 2)!;
        expect(changed.completedRuns).toEqual(1);
        expect(changed.lastDose).toBeTruthy();
        expect(changed.lastDoseDuration).toEqual(10);
        expect(unchanged.completedRuns).toBeFalsy();  // Sanity check
    });
    it('should set nextDoseDuration based on current treatment phase ', () => {
        /*
        What I must test:
        - 5% of target increase during ramp-up
        -
        - maintenance 1 and 2 last 4 treatments each
        - maintenance 3 is kept indefinitely
        */
        const treatment = createTreatment({
            id: 1,
            area: 'knee',
            lastDose: null,
            lastDoseDuration: null,
            nextDose: null,
            nextDoseDuration: 10,
            targetDoseDuration: 60,
        });
        const state = [
            treatment,
        ];

        const result = TreatmentsReducer(state, completeTreatmentRun({treatment: treatment, image: null}));
        const changed = result.find((v) => v.id == 1)!;
        expect(changed.nextDoseDuration).toBeGreaterThan(10);
        expect(changed.targetDoseDuration).toEqual(60);
        expect(+changed.nextDose).toBeGreaterThan(+changed.lastDose);
    });

    it('should set initial and target durations', () => {
        // Initial set, no runs and no target, so increase should be 20% of that (considering initial as 50% med and increment as 10% med) and target is 5x
        const base = {area: 'knee -init', targetDoseDuration: 50, completedRunsInPhase: 0, treatmentPhase: TREATMENT_PHASE_RAMPUP}
        const result = TreatmentsReducer(<Treatment[]>[],
            addTreatment({treatment: base}));
        expect(result[0]).toEqual(jasmine.objectContaining({nextDoseDuration: 10, initialDoseDuration: 10}));

    });

    it('should reach target phase based on duration', () => {
        /*
        What I must test:
        - ramp-up lasts until target duration is met
        - target lasts until manually changed
        - maintenance 1 and 2 last 4 treatments each
        - maintenance 3 is kept indefinitely
        */

        const treatment = createTreatment({
            id: 1,
            area: 'knee - target',
            lastDose: null,
            lastDoseDuration: null,
            nextDose: null,
            nextDoseDuration: 10,
            initialDoseDuration: 10,
            targetDoseDuration: 15
        });
        let state = [
            treatment,
        ];
        console.log('initial state', JSON.stringify(state))
        state = TreatmentsReducer(state, completeTreatmentRun({treatment: treatment}));
        console.log('changed state', JSON.stringify(state))

        let changed = state.find((v) => v.id == 1)!;
        expect(changed.completedRunsInPhase).toEqual(1);
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_RAMPUP);
        // Since it was the first run we're going to save this as initial dosage
        expect(changed.initialDoseDuration).toEqual(10);
        expect(changed.lastDoseDuration).toEqual(10);

        // A second treatment should not affect the initial and target run durations, nor the phase
        state = TreatmentsReducer(state, completeTreatmentRun({treatment: changed}));
        console.log('changed state (2)', JSON.stringify(state))
        changed = state.find((v) => v.id == 1)!;
        expect(changed.completedRunsInPhase).toEqual(2);
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_RAMPUP);
        expect(changed.initialDoseDuration).toEqual(10);
        expect(changed.targetDoseDuration).toEqual(treatment.targetDoseDuration);

        // With the third treatment, we get ready to reach target duration so something should change
        state = TreatmentsReducer(state, completeTreatmentRun({treatment: changed}));
        changed = state.find((v) => v.id == 1)!;
        expect(changed.completedRunsInPhase).toEqual(0);
        // The phase refers to *after* the treatment that was just run, so it should be "target"
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_TARGET);
        // The duration should not change during target phase
        expect(changed.nextDoseDuration).toEqual(changed.targetDoseDuration);

        // The fourth treatment is already in target phase, so:
        state = TreatmentsReducer(state, completeTreatmentRun({treatment: changed}));
        changed = state.find((v) => v.id == 1)!;
        expect(changed.completedRunsInPhase).toEqual(1);
        // The phase remains the same - target should only be changed manually
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_TARGET);
        // The duration should not change during target phase
        expect(changed.nextDoseDuration).toEqual(changed.targetDoseDuration);
    });

    it('should switch to maintenance mode when required', () => {
        const treatment = createTreatment({
            id: 1, area: 'knee', lastDose: null, nextDoseDuration: 10, targetDoseDuration: 60,
        });
        let state = [
            treatment,
        ];

        state = TreatmentsReducer(state, startMaintenancePhase({treatmentId: treatment.id}));
        const changed = state.find((v) => v.id == 1)!;
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_MAINTENANCE_1);
        expect(changed.completedRunsInPhase).toEqual(0);
        expect(moment(changed.nextDose).date()).toEqual(moment().add(7, 'days').date());
        expect(changed.nextDoseDuration).toEqual(changed.targetDoseDuration);

    });

    it('should keep maintenance phase based on number of runs', () => {
        /*
        What I must test:
        - maintenance 1 and 2 last 4 treatments each
        - maintenance 3 is kept indefinitely
        */

        const treatment = <Treatment>{
            id: 1,
            area: 'knee',
            nextDoseDuration: 10,
            treatmentPhase: TREATMENT_PHASE_MAINTENANCE_1,
            targetDoseDuration: 10,
        };
        let state = TreatmentsReducer([treatment], completeTreatmentRun({treatment}));
        let changed = state.find((v) => v.id == 1)!;
        expect(changed.nextDoseDuration).toEqual(10);
        expect(changed.completedRunsInPhase).toEqual(1);
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_MAINTENANCE_1);
        changed.completedRunsInPhase = 4;
        state = TreatmentsReducer([changed], completeTreatmentRun({treatment: changed}));  // 4th completed run, so the next one is going be in maint 2
        changed = state.find((v) => v.id == 1)!;
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_MAINTENANCE_2);
        expect(changed.lastDoseDuration).toEqual(10);
        expect(changed.nextDoseDuration).toEqual(7.5);
        expect(changed.completedRunsInPhase).toEqual(0);
        state = TreatmentsReducer([changed], completeTreatmentRun({treatment: changed}));
        changed = state.find((v) => v.id == 1)!;
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_MAINTENANCE_2);
        expect(changed.nextDoseDuration).toEqual(7.5);
        expect(changed.lastDoseDuration).toEqual(7.5);
        expect(changed.completedRunsInPhase).toEqual(1);
        changed.completedRunsInPhase = 4;
        state = TreatmentsReducer([changed], completeTreatmentRun({treatment: changed}));  // 4th completed run, so the next one is going be in maint 3
        changed = state.find((v) => v.id == 1)!;
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_MAINTENANCE_3);
        expect(changed.lastDoseDuration).toEqual(7.5);
        expect(changed.nextDoseDuration).toEqual(5);
        expect(changed.completedRunsInPhase).toEqual(0);
        changed.completedRunsInPhase = 10;
        state = TreatmentsReducer([changed], completeTreatmentRun({treatment: changed}));  // Maint 3 should persist forever
        changed = state.find((v) => v.id == 1)!;
        expect(changed.treatmentPhase).toEqual(TREATMENT_PHASE_MAINTENANCE_3);
        expect(changed.lastDoseDuration).toEqual(5);
        expect(changed.nextDoseDuration).toEqual(5);
        expect(changed.completedRunsInPhase).toEqual(11);
    });

    it('should keep same duration when missing runs in maintenance mode', () => {
        const treatment = createTreatment({
            id: 1,
            area: 'knee',
            nextDoseDuration: 10,
            treatmentPhase: TREATMENT_PHASE_MAINTENANCE_1,
            targetDoseDuration: 10,
            nextDose: moment().subtract(30, 'days')
        });
        // All maintenance should probably ignore the scheduled runs
        expect(updateTreatmentOnStart(treatment)).toEqual(jasmine.objectContaining({
            nextDoseDuration: 10,
            treatmentPhase: TREATMENT_PHASE_MAINTENANCE_1
        }));
        treatment.treatmentPhase = TREATMENT_PHASE_MAINTENANCE_2;
        expect(updateTreatmentOnStart(treatment)).toEqual(jasmine.objectContaining({
            nextDoseDuration: 10,
            treatmentPhase: TREATMENT_PHASE_MAINTENANCE_2
        }));
        treatment.treatmentPhase = TREATMENT_PHASE_MAINTENANCE_3;
        expect(updateTreatmentOnStart(treatment)).toEqual(jasmine.objectContaining({
            nextDoseDuration: 10,
            treatmentPhase: TREATMENT_PHASE_MAINTENANCE_3
        }));
    });

    it('should reduce duration when missing runs in rampup mode', () => {
        const treatment = createTreatment({
            id: 1,
            area: 'knee - reduce',
            nextDoseDuration: 30,
            treatmentPhase: TREATMENT_PHASE_RAMPUP,
            targetDoseDuration: 60,
            initialDoseDuration: 10,
            nextDose: moment().subtract(30, 'days')
        });
        let expected = {nextDoseDuration: 10, treatmentPhase: TREATMENT_PHASE_RAMPUP};
        expect(updateTreatmentOnStart(treatment)).toEqual(jasmine.objectContaining(expected));
        // Next run duration should have no effect in this case
        expect(updateTreatmentOnStart(Object.assign(treatment, {nextDoseDuration: 40}))).toEqual(jasmine.objectContaining(expected));
        // Less than three weeks late, and it should go back to 50% of last dose,
        expected = {nextDoseDuration: 20, treatmentPhase: TREATMENT_PHASE_RAMPUP};
        expect(updateTreatmentOnStart(Object.assign(treatment, {
            lastDoseDuration: 40,
            nextDose: moment().subtract(20, 'days')
        }))).toEqual(jasmine.objectContaining(expected));
        // or initial dose, if it's higher
        expected = {nextDoseDuration: 10, treatmentPhase: TREATMENT_PHASE_RAMPUP};
        expect(updateTreatmentOnStart(Object.assign(treatment, {
            lastDoseDuration: 15,
            nextDose: moment().subtract(20, 'days')
        }))).toEqual(jasmine.objectContaining(expected));
        // between one and two weeks, reduce by 25%
        expected = {nextDoseDuration: 30, treatmentPhase: TREATMENT_PHASE_RAMPUP};
        expect(updateTreatmentOnStart(Object.assign(treatment, {
            lastDoseDuration: 40,
            nextDose: moment().subtract(10, 'days')
        }))).toEqual(jasmine.objectContaining(expected));
    });

    it('should return to rampup when missing runs in target mode', () => {
        const treatment = createTreatment({
            id: 1,
            area: 'knee',
            lastDoseDuration: 60,
            treatmentPhase: TREATMENT_PHASE_TARGET,
            targetDoseDuration: 60,
            initialDose: 10,
            nextDose: moment().subtract(10, 'days')
        });
        const expected = {nextDoseDuration: 45, treatmentPhase: TREATMENT_PHASE_RAMPUP};
        expect(updateTreatmentOnStart(treatment)).toEqual(jasmine.objectContaining(expected));
    });

    it('should always use targetduration when starting in target phase', () => {
        const treatment = <Treatment>{
            id: 1,
            area: 'knee',
            treatmentPhase: TREATMENT_PHASE_TARGET,
            targetDoseDuration: 60
        };
        const result = TreatmentsReducer([], addTreatment({treatment}))[0]
        expect(result.nextDoseDuration).toEqual(treatment.targetDoseDuration);
    });

    it('should set nextDose depending on current treatmentPhase', () => {
        const treatment = createTreatment({
            id: 1,
            area: 'knee',
            lastDose: null,
            nextDoseDuration: 10,
            targetDoseDuration: 60,
            treatmentPhase: TREATMENT_PHASE_RAMPUP
        });
        let changed = getUpdatedTreatment(treatment);
        // We only care about days, of course
        const days = (a: Date | null, b: Date | null) => Math.round(moment.duration(moment(a).diff(moment(b))).asDays());
        expect(days(changed.nextDose, changed.lastDose)).toEqual(2);
        treatment.treatmentPhase = TREATMENT_PHASE_TARGET;  // Target should still be 2 days
        changed = getUpdatedTreatment(treatment);
        expect(days(changed.nextDose, changed.lastDose)).toEqual(2);
        treatment.treatmentPhase = TREATMENT_PHASE_MAINTENANCE_1;  // maintenance 1 is one week
        changed = getUpdatedTreatment(treatment);
        expect(days(changed.nextDose, changed.lastDose)).toEqual(7);
        treatment.treatmentPhase = TREATMENT_PHASE_MAINTENANCE_2;  // maintenance 1 is one week
        changed = getUpdatedTreatment(treatment);
        expect(days(changed.nextDose, changed.lastDose)).toEqual(14);
        treatment.treatmentPhase = TREATMENT_PHASE_MAINTENANCE_3;  // maintenance 1 is one week
        changed = getUpdatedTreatment(treatment);
        expect(days(changed.nextDose, changed.lastDose)).toEqual(28);
    });

    it('should reset nextDose date when editing', () => {
        // If I'm late with a treatment and I edit it, I'm probably going to want to have phase and exposure set to the values I am entering, regardless of previous exposures
        const treatment = createTreatment({
            id: 1,
            area: 'knee',
            treatmentPhase: TREATMENT_PHASE_TARGET,
            targetDoseDuration: 60,
            nextDose: moment().subtract(10, 'days')
        });
        const result = TreatmentsReducer([treatment], updateTreatment({treatment}))[0];
        expect(moment(result.nextDose).date()).toEqual(moment().date());
    });

});
