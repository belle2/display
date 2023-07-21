import { Component, OnInit, ComponentRef, OnDestroy } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ObjectSelectorOverlayComponent } from './object-selector-overlay/object-selector-overlay.component';
import { EventDisplayService } from 'phoenix-ui-components';

@Component({
    selector: 'app-object-selector',
    templateUrl: './object-selector.component.html',
    styleUrls: ['./object-selector.component.scss']
})
export class ObjectSelectorComponent implements OnInit, OnDestroy {
    // Attributes for displaying the information of selected objects
    hiddenSelectedInfo = true;
    overlayWindow: ComponentRef<ObjectSelectorOverlayComponent>;

    constructor(
        private overlay: Overlay,
        private eventDisplay: EventDisplayService
    ) {}

    ngOnInit() {
        const overlayRef = this.overlay.create();
        const overlayPortal = new ComponentPortal(
            ObjectSelectorOverlayComponent
        );
        this.overlayWindow = overlayRef.attach(overlayPortal);
        this.overlayWindow.instance.hiddenSelectedInfo =
            this.hiddenSelectedInfo;
    }

    ngOnDestroy(): void {
        this.overlayWindow.destroy();
    }

    toggleOverlay() {
        this.hiddenSelectedInfo = !this.hiddenSelectedInfo;
        this.overlayWindow.instance.hiddenSelectedInfo =
            this.hiddenSelectedInfo;
        this.eventDisplay.enableSelecting(!this.hiddenSelectedInfo);
    }
}
