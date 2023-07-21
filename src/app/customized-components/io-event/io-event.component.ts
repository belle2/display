import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EventDataFormat, EventDataImportOption } from 'phoenix-ui-components';
import { IODialogComponent } from './io-dialog/io-dialog.component';

@Component({
    selector: 'app-io-event',
    templateUrl: './io-event.component.html',
    styleUrls: ['./io-event.component.scss']
})
export class IOEventComponent {
    @Input()
    eventDataImportOptions: EventDataImportOption[] =
        Object.values(EventDataFormat);

    constructor(private dialog: MatDialog) {}

    openIODialog() {
        const dialogRef = this.dialog.open(IODialogComponent, {
            panelClass: 'dialog'
        });
        dialogRef.componentInstance.eventDataImportOptions =
            this.eventDataImportOptions;
    }
}
