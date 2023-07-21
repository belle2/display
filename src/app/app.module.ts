import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { PhoenixUIModule } from 'phoenix-ui-components';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DetectorComponent } from './detector/detector.component';
import { EventDisplayComponent } from './event-display/event-display.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingComponent } from './customized-components/loading/loading.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

import { CustomizedEventSelectorComponent } from './customized-components/customized-event-selector/customized-event-selector.component';
import { IOEventComponent } from './customized-components/io-event/io-event.component';
import { IODialogComponent } from './customized-components/io-event/io-dialog/io-dialog.component';
import { HomeComponent } from './home/home.component';
import { ObjectSelectorComponent } from './customized-components/object-selector/object-selector.component';
import { ObjectSelectorOverlayComponent } from './customized-components/object-selector/object-selector-overlay/object-selector-overlay.component';

@NgModule({
    declarations: [
        AppComponent,
        DetectorComponent,
        EventDisplayComponent,
        LoadingComponent,
        CustomizedEventSelectorComponent,
        IOEventComponent,
        IODialogComponent,
        HomeComponent,
        ObjectSelectorComponent,
        ObjectSelectorOverlayComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        PhoenixUIModule,
        BrowserAnimationsModule,
        MatTooltipModule,
        MatDialogModule,
        MatButtonModule,
        HttpClientModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
