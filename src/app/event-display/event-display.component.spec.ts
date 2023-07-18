import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDisplayComponent } from './event-display.component';

describe('EventDisplayComponent', () => {
    let component: EventDisplayComponent;
    let fixture: ComponentFixture<EventDisplayComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EventDisplayComponent]
        });
        fixture = TestBed.createComponent(EventDisplayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
