import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectSelectorComponent } from './object-selector.component';

describe('ObjectSelectorComponent', () => {
    let component: ObjectSelectorComponent;
    let fixture: ComponentFixture<ObjectSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ObjectSelectorComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ObjectSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
