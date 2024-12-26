import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { NavController, } from '@ionic/angular/standalone';
import {Treatment, TreatmentPhases, TREATMENT_PHASE_RAMPUP, getTreatment} from './treatment.model';
import { FormGroup, FormBuilder, ReactiveFormsModule} from '@angular/forms';
import { Store } from '@ngrx/store';

import { AppState } from '../app.state';
import {addTreatment, deleteTreatment, TreatmentActions, updateTreatment} from './treatment.actions';
import {CommonModule} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput, IonItem, IonItemOption, IonLabel,
    IonSelect, IonSelectOption,
    IonTitle,
    IonToolbar
} from "@ionic/angular/standalone";
import {HeaderComponent} from "../header/header.component";


@Component({
    selector: 'app-treatment-form',
    templateUrl: './treatment-form.html',
    imports: [CommonModule, ReactiveFormsModule, IonInput, IonSelect, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonContent, IonItem, IonLabel, IonItemOption, IonButton, IonSelectOption, HeaderComponent],
    standalone: true,
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TreatmentFormComponent implements OnInit {
    phases = TreatmentPhases;
    public treatmentForm!: FormGroup; // our model driven form
    public submitted!: boolean; // keep track on whether form is submitted
    public events: any[] = []; // use later to display form changes
    public treatment: any = {};
    public isNew = true;
    public action = 'Add';

    constructor(public navCtrl: NavController,
                private activatedRoute: ActivatedRoute,
                private fb: FormBuilder,
                private store: Store<AppState>,
                private router: Router,
        private treatmentActions: TreatmentActions) {
    }
    ngOnInit() {
        this.treatmentForm = this.fb.group({
            area: [''],
            targetDoseDuration: [null],  // Select via MED or skin type
            completedRunsInPhase: [0],
            treatmentPhase: [TREATMENT_PHASE_RAMPUP],  // Validate with TreatmentPhases,
            nextDoseDuration: [this.treatment.nextDoseDuration],
        });
        this.subcribeToFormChanges();
    }

    save(model: Treatment, isValid: boolean, treatment: Treatment) {
        this.submitted = true; // set form submit to true
        if (isValid) {
            if (this.isNew) {
                this.store.dispatch(addTreatment({treatment: model}));
            }
            else {
                model.id = treatment.id;
                this.store.dispatch(updateTreatment({treatment: model}));
            }
            this.dismiss();
        } else {
            console.log('Error in form');
        }
        
    }

    dismiss() {
        this.router.navigate(['/treatments']);
    }

    ionViewWillEnter() {
        this.activatedRoute.params.subscribe((params) => {
            this.store.select(getTreatment(parseInt(params['id']))).subscribe(
                (current) => {
                    if (current) {
                        this.treatment = current;
                        this.isNew = false;
                        this.action = 'Edit';
                        this.treatmentForm.patchValue(current);
                    }
            });
        });
    }

    delete() {
        this.store.dispatch(deleteTreatment({treatmentId: this.treatment.id}));
        this.dismiss();
    }

    subcribeToFormChanges() {
        // initialize stream
        const myFormValueChanges$ = this.treatmentForm.valueChanges;

        // subscribe to the stream 
        myFormValueChanges$.subscribe(x => this.events
            .push({ event: "STATUS CHANGED", object: x }));
    }
}
