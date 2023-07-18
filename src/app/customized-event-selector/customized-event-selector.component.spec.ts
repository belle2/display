import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomizedEventSelectorComponent } from './customized-event-selector.component';

describe('CustomizedEventSelectorComponent', () => {
    let component: CustomizedEventSelectorComponent;
    let fixture: ComponentFixture<CustomizedEventSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CustomizedEventSelectorComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(CustomizedEventSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
