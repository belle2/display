import { Component, OnInit } from '@angular/core';
import { EventLoader } from './event-loader';
import {
    EventDataFormat,
    EventDataImportOption,
    EventDisplayService
} from 'phoenix-ui-components';
import {
    Configuration,
    PhoenixMenuNode,
    PresetView
} from 'phoenix-event-display';
import { Belle2Loader } from 'src/loaders/event-data-loaders';
import * as saveAs from 'file-saver';

@Component({
    selector: 'app-event-display',
    templateUrl: './event-display.component.html',
    styleUrls: ['./event-display.component.scss']
})
export class EventDisplayComponent implements OnInit {
    loaded = false;
    loadingProgress = 0;
    phoenixMenuRoot: PhoenixMenuNode = new PhoenixMenuNode(
        'Display Options',
        'phoenix-menu'
    );

    constructor(private eventDisplay: EventDisplayService) {}
    async ngOnInit() {
        const belle2Loader = new Belle2Loader();

        const configuration: Configuration = {
            eventDataLoader: belle2Loader,
            presetViews: [
                new PresetView(
                    'Left View (xy)',
                    [0, 0, 1700],
                    [0, 0, 0],
                    'left-cube'
                ),
                new PresetView(
                    'Center View (yz)',
                    [1600, 0, 0],
                    [0, 0, 0],
                    'top-cube'
                ),
                new PresetView(
                    'Top View (zx)',
                    [1, 1600, 0],
                    [0, 0, 0],
                    'top-cube'
                ),
                new PresetView(
                    'Right View (-xy)',
                    [0, 0, -1700],
                    [0, 0, 0],
                    'right-cube'
                )
            ],
            defaultView: [1600, -300, 900, 0, 0, 0],
            phoenixMenuRoot: this.phoenixMenuRoot,
            forceColourTheme: 'dark'
        };

        this.eventDisplay.init(configuration);

        const response = await fetch('../../assets/mdst_data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // const eventLoader = new EventLoader('../../assets/mdst-v06-00-00.root');

        // const data = await eventLoader.getData('tree');
        const data = await response.json();
        const eventData = belle2Loader.getAllEventData(data);
        this.eventDisplay.parsePhoenixEvents(eventData);

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/Belle2Geo_EventDisplay.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.getLoadingManager().addProgressListener(progress => {
            return (this.loadingProgress = progress);
        });

        this.eventDisplay.getLoadingManager().addLoadListenerWithCheck(() => {
            this.eventDisplay.getUIManager().geometryVisibility('ARICH', false);
            this.eventDisplay.getUIManager().geometryVisibility('BKLM', false);
            this.eventDisplay.getUIManager().geometryVisibility('EKLM', false);
            this.eventDisplay
                .getUIManager()
                .geometryVisibility('EKLM > BWD', false);
            this.eventDisplay
                .getUIManager()
                .geometryVisibility('EKLM > FWD', false);
            this.eventDisplay.getUIManager().geometryVisibility('CDC', false);

            this.loaded = true;
        });
    }
}
