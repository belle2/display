import { Component, OnInit, Input } from '@angular/core';
import { EventDisplayService } from 'phoenix-ui-components';
import { PrettySymbols } from 'phoenix-event-display';

@Component({
    selector: 'app-object-selector-overlay',
    templateUrl: './object-selector-overlay.component.html',
    styleUrls: ['./object-selector-overlay.component.scss']
})
export class ObjectSelectorOverlayComponent implements OnInit {
    // Attributes for displaying the information of selected objects
    @Input() hiddenSelectedInfo: boolean;
    selectedObject = { name: 'Object', attributes: [] };

    constructor(private eventDisplay: EventDisplayService) {}

    ngOnInit() {
        this.eventDisplay.allowSelection(this.selectedObject);
    }

    onClick() {
        this.eventDisplay.highlightObject(
            this.eventDisplay.getActiveObjectId().value
        );
    }

    highlightMCParticle(particleIndex: number) {
        const particleCollections = [
            'Charged particles',
            'Photons',
            'Neutral hadrons',
            'Neutrons',
            'Neutrinos',
            'Others'
        ];
        const allCollections = this.eventDisplay.getCollections();
        for (let i = 0; i < allCollections.length; i++) {
            if (particleCollections.includes(allCollections[i])) {
                const particles = this.eventDisplay.getCollection(
                    allCollections[i]
                );
                const selectedParticle = particles.find(
                    (p: any) => p.index === particleIndex
                );
                if (selectedParticle) {
                    this.eventDisplay.highlightObject(selectedParticle.uuid);
                    this.eventDisplay
                        .getActiveObjectId()
                        .update(selectedParticle.uuid);
                    // A non-smart way to update the overlay
                    this.selectedObject.name = 'MCParticle';
                    this.selectedObject.attributes = [];
                    const prettyParams =
                        PrettySymbols.getPrettyParams(selectedParticle);

                    for (const key of Object.keys(prettyParams)) {
                        if (key !== 'uuid') {
                            this.selectedObject.attributes.push({
                                attributeName: key,
                                attributeValue: prettyParams[key]
                            });
                        }
                    }

                    break;
                }
            }
        }
    }

    highlightTrack(trackIndex: number) {
        const tracks = this.eventDisplay.getCollection('Fitted Track');
        const selectedTrack = tracks.find((t: any) => t.index === trackIndex);
        if (selectedTrack) {
            this.eventDisplay.highlightObject(selectedTrack.uuid);
            this.eventDisplay.getActiveObjectId().update(selectedTrack.uuid);
            // A non-smart way to update the overlay
            this.selectedObject.name = 'Track';
            this.selectedObject.attributes = [];
            const prettyParams = PrettySymbols.getPrettyParams(selectedTrack);

            for (const key of Object.keys(prettyParams)) {
                if (key !== 'uuid') {
                    this.selectedObject.attributes.push({
                        attributeName: key,
                        attributeValue: prettyParams[key]
                    });
                }
            }
        }
    }
}
