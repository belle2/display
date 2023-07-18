import { Component, AfterViewInit } from '@angular/core';
import { EventDisplayService } from 'phoenix-ui-components';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

    constructor(private eventDisplay: EventDisplayService) {
        this.eventDisplay.getThreeManager().stopAnimationLoop();
        this.eventDisplay.getUIManager().setDarkTheme(true)
    }

    ngAfterViewInit() {
        this.eventDisplay.getUIManager().detectColorScheme();
    }
}
