import { Component, OnInit } from '@angular/core';
import { EventDisplayService } from 'phoenix-ui-components';
import {
    Configuration,
    PhoenixMenuNode,
    PresetView
} from 'phoenix-event-display';
import { Belle2Loader } from 'src/loaders/event-data-loader';

@Component({
    selector: 'app-detector',
    templateUrl: './detector.component.html',
    styleUrls: ['./detector.component.scss']
})
export class DetectorComponent implements OnInit {
    loaded = false;
    loadingProgress = 0;
    phoenixMenuRoot: PhoenixMenuNode = new PhoenixMenuNode(
        'Display Options',
        'phoenix-menu'
    );

    constructor(private eventDisplay: EventDisplayService) {}

    ngOnInit() {
        // const detectorFile = new DetectorLoader('../../assets/Belle2Geo.root');
        // detectorFile.getData('VGM Root geometry');
        const belle2Loader = new Belle2Loader();

        const configuration: Configuration = {
            eventDataLoader: belle2Loader,
            presetViews: [
                new PresetView(
                    'Left View',
                    [0, 0, 3600],
                    [0, 0, 0],
                    'left-cube'
                ),
                new PresetView(
                    'Center View',
                    [3300, 100, 0],
                    [0, 0, 0],
                    'top-cube'
                ),
                new PresetView(
                    'Right View',
                    [0, 0, -3600],
                    [0, 0, 0],
                    'right-cube'
                )
            ],
            defaultView: [3300, -100, 1800, 0, 0, 0],
            phoenixMenuRoot: this.phoenixMenuRoot
        };

        this.eventDisplay.init(configuration);

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_BKLM.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_EKLM.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_ARICH.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_Material_FWD.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_Material_BWD.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_Material_TOP_BWD.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_Material_Barrel.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay.loadGLTFGeometry(
            '../../assets/geometry/Belle2Geo_TOP.gltf',
            undefined,
            undefined,
            4,
            true
        );

        this.eventDisplay
            .getLoadingManager()
            .addProgressListener(progress => (this.loadingProgress = progress));
        this.eventDisplay
            .getLoadingManager()
            .addLoadListenerWithCheck(() => (this.loaded = true));
    }
}
