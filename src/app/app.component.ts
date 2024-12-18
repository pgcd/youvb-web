import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
// import { SplashScreen } from "@ionic-native/splash-screen";
// import { StatusBar } from "@ionic-native/status-bar";
import {IonicStorageModule, Storage} from "@ionic/storage-angular";
import {Store} from '@ngrx/store';
import {AppState} from './app.state';
import {TreatmentActions} from './treatments/treatment.actions';

import './rxjs-operators';
import {IonApp, IonRouterOutlet} from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import {
    logoGithub,
    bug,
    add,
    ellipsisVertical,
    calendarNumberOutline,
    statsChart,
    mailOutline,
    mail,
    trash,
    save,
    logoEuro,
} from "ionicons/icons";
import {StorageService} from "./storage.service";
import {HeaderComponent} from "./header/header.component";


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IonApp,
        IonRouterOutlet,
        IonicStorageModule,
        HeaderComponent,
    ],
    standalone: true,
})
export class AppComponent implements OnInit {
    constructor(platform: Platform,
                // statusBar: StatusBar,
                // splashScreen: SplashScreen,
                private storageService: StorageService,
                private storage: Storage,
                private store: Store<AppState>,
                treatmentActions: TreatmentActions) {
        addIcons({
            add, bug, calendarNumberOutline, ellipsisVertical, logoGithub, mailOutline, statsChart, trash, save, logoEuro, mail
        });
        platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.

            // statusBar.styleDefault();
            // splashScreen.hide();

            let oldTreatments = window.localStorage.getItem('treatments');
            storage.get('NSIS_APP_STATE').then((currentState) => {
                if (oldTreatments && !currentState) {
                    const oldHistory = JSON.parse(window.localStorage.getItem('treatmentHistory') || '');
                    this.store.dispatch(treatmentActions.loadTreatments(JSON.parse(oldTreatments)));
                    this.store.dispatch(treatmentActions.loadHistory(oldHistory));
                }
            });
        });
    }

    async ngOnInit() {
        await this.storage.create();
    }
}
