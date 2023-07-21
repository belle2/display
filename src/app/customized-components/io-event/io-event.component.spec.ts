import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IOEventComponent } from './io-event.component';

describe('IoEventComponent', () => {
    let component: IOEventComponent;
    let fixture: ComponentFixture<IOEventComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IOEventComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IOEventComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
