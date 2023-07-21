import {
    Component,
    OnInit,
    Input
} from '@angular/core';
import { EventDisplayService } from 'phoenix-ui-components';

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
            'Neutral particles',
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
                    this.selectedObject.attributes = [
                        {
                            attributeName: 'index',
                            attributeValue: selectedParticle.index
                        },
                        {
                            attributeName: 'name',
                            attributeValue: selectedParticle.name
                        },
                        {
                            attributeName: 'momentumX',
                            attributeValue: selectedParticle.momentumX
                        },
                        {
                            attributeName: 'momentumY',
                            attributeValue: selectedParticle.momentumY
                        },
                        {
                            attributeName: 'momentumZ',
                            attributeValue: selectedParticle.momentumZ
                        },
                        {
                            attributeName: 'Track',
                            attributeValue: selectedParticle.Track
                        },
                        {
                            attributeName: 'PDG',
                            attributeValue: selectedParticle.PDG
                        },
                        {
                            attributeName: 'seen',
                            attributeValue: selectedParticle.seen
                        },
                        {
                            attributeName: 'q',
                            attributeValue: selectedParticle.charge
                        },
                        {
                            attributeName: 'Energy',
                            attributeValue: selectedParticle.energy
                        },
                        {
                            attributeName: 'ϕ',
                            attributeValue: selectedParticle.phi
                        }
                    ];

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
            this.selectedObject.attributes = [
                { attributeName: 'index', attributeValue: selectedTrack.index },
                { attributeName: 'd0', attributeValue: selectedTrack.d0 },
                { attributeName: 'z0', attributeValue: selectedTrack.z0 },
                { attributeName: 'omega', attributeValue: selectedTrack.omega },
                {
                    attributeName: 'tanLambda',
                    attributeValue: selectedTrack.tanLambda
                },
                {
                    attributeName: 'momentumX',
                    attributeValue: selectedTrack.momentumX
                },
                {
                    attributeName: 'momentumY',
                    attributeValue: selectedTrack.momentumY
                },
                {
                    attributeName: 'momentumZ',
                    attributeValue: selectedTrack.momentumZ
                },
                {
                    attributeName: 'MCParticle',
                    attributeValue: selectedTrack.MCParticle
                },
                { attributeName: 'e-', attributeValue: selectedTrack?.['e-'] },
                {
                    attributeName: 'mu-',
                    attributeValue: selectedTrack?.['mu-']
                },
                {
                    attributeName: 'pi+',
                    attributeValue: selectedTrack?.['pi+']
                },
                { attributeName: 'K+', attributeValue: selectedTrack?.['K+'] },
                { attributeName: 'p+', attributeValue: selectedTrack?.['p+'] },
                {
                    attributeName: 'deuteron',
                    attributeValue: selectedTrack?.['deuteron']
                },
                { attributeName: 'q', attributeValue: selectedTrack.charge },
                { attributeName: 'ϕ', attributeValue: selectedTrack.phi }
            ];
        }
    }
}
