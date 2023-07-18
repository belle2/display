import { Component, OnInit } from '@angular/core';
import { EventDisplayService } from 'phoenix-ui-components';

@Component({
    selector: 'app-customized-event-selector',
    templateUrl: './customized-event-selector.component.html',
    styleUrls: ['./customized-event-selector.component.scss']
})
export class CustomizedEventSelectorComponent implements OnInit {
    // Array containing the keys of the multiple loaded events
    events: string[] = [];
    experimentNum: string = '';
    runNum: string = '';
    eventNum: string = '';
    time: string = '';
    currentIndex: number = 0;

    constructor(private eventDisplay: EventDisplayService) {}

    ngOnInit() {
        this.eventDisplay.listenToLoadedEventsChange(events => {
            const eventsInfo: any = this.eventDisplay;
            this.events = events;
            this.experimentNum =
                eventsInfo.eventsData[events[0]].experimentNumber;
            this.runNum = eventsInfo.eventsData[events[0]].runNumber;
            this.eventNum = eventsInfo.eventsData[events[0]].eventNumber;
            this.time = eventsInfo.eventsData[events[0]].time;
            return events;
        });
        console.log(this.events);
    }

    handleChange(value: string) {
        const eventsInfo: any = this.eventDisplay;
        this.experimentNum = eventsInfo.eventsData[value].experimentNumber;
        this.runNum = eventsInfo.eventsData[value].runNumber;
        this.eventNum = eventsInfo.eventsData[value].eventNumber;
        this.time = eventsInfo.eventsData[value].time;
    }

    changeEvent(selected: any) {
        const value = selected.target.value;
        this.eventDisplay.loadEvent(value);
        this.currentIndex = this.events.indexOf(value);
        this.handleChange(value);
    }

    nextEvent() {
        let newIndex: number = this.currentIndex + 1;
        if (newIndex === this.events.length) {
            newIndex = 0;
        }
        this.currentIndex = newIndex;
        this.eventDisplay.loadEvent(this.events[newIndex]);
        this.handleChange(this.events[newIndex]);
    }

    previousEvent() {
        let newIndex: number = this.currentIndex - 1;
        if (newIndex === -1) {
            newIndex = this.events.length - 1;
        }
        this.currentIndex = newIndex;
        this.eventDisplay.loadEvent(this.events[newIndex]);
        this.handleChange(this.events[newIndex]);
    }
}
