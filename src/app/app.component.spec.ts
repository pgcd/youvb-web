import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {AppComponent} from './app.component';
import {importProvidersFrom} from "@angular/core";
import {IonicStorageModule} from "@ionic/storage-angular";
import {Drivers} from "@ionic/storage";

describe('AppComponent', () => {
    it('should create the app', async () => {
        await TestBed.configureTestingModule({
            imports: [
                AppComponent,
            ],
            providers: [provideRouter([]),
                importProvidersFrom(
                    IonicStorageModule.forRoot({
                        name: "youvb-test",
                        driverOrder: [Drivers.LocalStorage]
                    }),
                ),
            ]
        }).compileComponents();

        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
