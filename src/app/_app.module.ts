import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {RouteReuseStrategy} from '@angular/router';
import {BrowserModule} from '@angular/platform-browser';
import {IonicStorageModule} from '@ionic/storage-angular';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
// import {StorageSyncEffects} from 'ngrx-store-ionic-storage';
import {MomentModule} from 'ngx-moment';
import 'moment/locale/en-gb';
// import { CustomIconsModule } from 'ionic2-custom-icons';
import {AppComponent} from './app.component';
import {AboutPage} from './about/about.page';
import {ContactPage} from './contact/contact.page';
// import { HomePage } from '../pages/home/home';
import {TabsPage} from './tabs/tabs';
import {TreatmentListComponent} from './treatments/treatment-list.component';
import {TreatmentDataMenuComponent, OpenFileModalComponent} from './treatments/treatment-data-menu.component';
import {TreatmentFormComponent} from './treatments/treatment-form.component';
import {TreatmentDetailComponent} from './treatments/treatment-detail.component';
import {TreatmentHistoryComponent, ExposureImageComponent} from './treatments/treatment-history.component';
import {reducer} from './app.reducer';
import {ErrorHandler} from '@angular/core';
// import { IonicErrorHandler } from '@ionic/angular';
// import { SplashScreen } from "@ionic-native/splash-screen";
// import { StatusBar } from "@ionic-native/status-bar";
// import { Clipboard } from '@ionic-native/clipboard';
// import { SocialSharing } from '@ionic-native/social-sharing';
// import { LocalNotifications } from '@ionic-native/local-notifications';
// import { AppVersion } from '@ionic-native/app-version';
import {TreatmentActions} from './treatments/treatment.actions';
import {CommonModule} from "@angular/common";

// import { File } from '@ionic-native/file';
// import { Camera } from '@ionic-native/camera';
// import { cameraFactory, fileFactory, localNotificationsFactory, appVersionFactory } from './app.providers';

// import { StoreDevtoolsModule } from '@ngrx/store-devtools';

@NgModule({
    imports: [
        IonicModule.forRoot(),
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        StoreModule.forRoot(reducer),
        MomentModule,
        // CustomIconsModule,
        BrowserModule,
        IonicStorageModule.forRoot(
            // {driverOrder: ['sqlite', 'websql', 'localstorage']}
        ),
        // EffectsModule.run(StorageSyncEffects),
        // StoreDevtoolsModule.instrumentOnlyWithExtension({
        //   maxAge: 5
        // }),
    ],
    entryComponents: [
        AppComponent,
        AboutPage,
        ContactPage,
        // HomePage,
        TabsPage,
        TreatmentListComponent,
        TreatmentFormComponent,
        TreatmentDetailComponent,
        TreatmentHistoryComponent,
        TreatmentDataMenuComponent,
        OpenFileModalComponent,
        ExposureImageComponent,
    ],
    providers: [
        // SplashScreen,
        // StatusBar,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: ErrorHandler, useClass: ErrorHandler},
        // TreatmentActions,
        // Clipboard,
        // Storage,
        // SocialSharing,
        // Mockables
        // { provide: File, useFactory: fileFactory },
        // { provide: Camera, useFactory: cameraFactory },
        // { provide: LocalNotifications, useFactory: localNotificationsFactory },
        // { provide: AppVersion, useFactory: appVersionFactory},
    ]
})
export class AppModule {
}
