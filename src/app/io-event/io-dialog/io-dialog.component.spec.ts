import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IODialogComponent } from './io-dialog.component';

describe('IoDialogComponent', () => {
    let component: IODialogComponent;
    let fixture: ComponentFixture<IODialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [IODialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(IODialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
