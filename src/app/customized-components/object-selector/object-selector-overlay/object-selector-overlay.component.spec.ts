import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectSelectorOverlayComponent } from './object-selector-overlay.component';

describe('ObjectSelectorOverlayComponent', () => {
    let component: ObjectSelectorOverlayComponent;
    let fixture: ComponentFixture<ObjectSelectorOverlayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ObjectSelectorOverlayComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ObjectSelectorOverlayComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
