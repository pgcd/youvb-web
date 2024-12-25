import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {
    IonContent,
    IonHeader,
    IonIcon,
    IonItem, IonLabel,
    IonList,
    IonText,
    IonTitle,
    IonToolbar
} from '@ionic/angular/standalone';
import {HeaderComponent} from "../header/header.component";
import {HowTo} from "./howTo";

@Component({
    selector: 'app-about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
    standalone: true,
    imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonList, IonItem, HeaderComponent, IonIcon, IonText, IonLabel],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AboutPage implements OnInit {
    version: any;
    active: any;
    data: Array<{ title: string, details: string, showDetails: boolean }> = [
        {
            title: 'Using YouVB',
            details: HowTo,
            showDetails: false,
        },
        {
            title: 'Why?',
            details: `<p>
                    I found that using my phone's default timer & an Excel sheet to track my progress with UVB wasn't really working, so I decided
                    to write this small app. <br/> Finding definitive data proved pretty hard, so I tried
                    to mediate between a few different sources when deciding the differen treatment phases etc. If you're
                    interested, let me know and I will send you the links.
                </p>
                <p>
                    I plan on adding some functionality in the future, depending on my own condition and on how useful it is to other people,
                    so if you're using YouVB please get in touch and let me know.
                </p>`,
            showDetails: false,
        },
        {
            title: 'Future plans',
            details: `<ul>
                    <li class="done">Setup treatment plans with target exposure in seconds specific for areas
                    </li>
                    <li class="done">Keep history of exposures (date and duration)
                    </li>
                    <li class="done">Exposure duration increase and decrease depending on treatment phase and days since last exposure
                    </li>
                    <li>Export treatment log as CSV/Excel
                    </li>
                    <li>Photo journal attached to treatment log (take a picture before the start so you can follow the progress)
                    </li>
                    <li>Set calendar reminder for future exposures
                    </li>
                    <li>Help scheduling future exposures (budget time needed for exposure vs. time since last exposure)
                    </li>
                    <li>Target exposure suggestion based on Fitzpatrick skin type and lamp power (mW/cm2)
                    </li>
                    <li>Improved treatment log, with total Joules/total exposure for area etc.
                    </li>
                    <li>Import treatment plan from CSV (either with full schedule or just area, initial exposure, increase function)
                    </li>
                    <li>Integrate Fitzpatrick skin type questionnaire
                    </li>
                </ul>`,
            showDetails: false,
        },
    ];

    constructor() {
        this.version = '0.999';
    }

    ngOnInit() {
        this.data[0].showDetails = true;
        this.active = this.data[0];
    }

    toggleDetails(data: { title: string, details: string, showDetails: boolean }) {
        if (data.showDetails) {
            data.showDetails = false;
        } else {
            this.active.showDetails = false;
            data.showDetails = true;
            this.active = data;
        }
    }

}
