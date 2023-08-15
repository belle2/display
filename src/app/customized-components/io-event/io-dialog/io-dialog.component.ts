import { OnInit, Component, Input } from '@angular/core';
import { CMSLoader, JiveXMLLoader, readZipFile } from 'phoenix-event-display';
import { MatDialogRef } from '@angular/material/dialog';
import {
    EventDataFormat,
    EventDataImportOption,
    ImportOption,
    EventDisplayService
} from 'phoenix-ui-components';
import { Belle2Loader } from 'src/loaders/event-data-loader';
import { EventLoader } from 'src/app/event-display/event-loader';
import * as saveAs from 'file-saver';

@Component({
    selector: 'app-io-dialog',
    templateUrl: './io-dialog.component.html',
    styleUrls: ['./io-dialog.component.scss']
})
export class IODialogComponent implements OnInit {
    @Input()
    eventDataImportOptions: EventDataImportOption[] = [EventDataFormat.JSON];

    eventDataOptionsWithHandler: ImportOption[];

    private supportedEventDataFormats = [
        new ImportOption(
            EventDataFormat.JSON,
            '.json',
            this.handleJSONEventDataInput.bind(this),
            'application/json'
        )
    ];

    constructor(
        private eventDisplay: EventDisplayService,
        public dialogRef: MatDialogRef<IODialogComponent>
    ) {}

    ngOnInit() {
        this.eventDataOptionsWithHandler =
            this.supportedEventDataFormats.filter(eventDataFormat =>
                this.eventDataImportOptions.includes(
                    eventDataFormat.format as EventDataFormat
                )
            );

        this.eventDataImportOptions.forEach(eventDataImportOption => {
            if (eventDataImportOption instanceof ImportOption) {
                const importHandler = eventDataImportOption.handler.bind(this);
                eventDataImportOption.handler = (files: FileList) => {
                    importHandler(files);
                    this.onClose();
                };

                this.eventDataOptionsWithHandler.push(eventDataImportOption);
            }
        });
    }

    getSupportedEventDataFormats() {
        return this.eventDataImportOptions
            .map(format => {
                if (format instanceof ImportOption) {
                    return format.format;
                }

                return format;
            })
            .filter(format => format !== 'ZIP')
            .join(', ');
    }

    onClose(): void {
        this.dialogRef.close();
    }

    handleJSONEventDataInput(files: FileList) {
        const callback = (content: any) => {
            const belle2Loader = new Belle2Loader();
            const file =
                typeof content === 'string' ? JSON.parse(content) : content;
            const data = belle2Loader.getAllEventData(file);
            this.eventDisplay.parsePhoenixEvents(data);
        };
        this.handleFileInput(files[0], 'json', callback);
    }

    handleOBJInput(files: FileList) {
        const callback = (content: any, name: string) => {
            this.eventDisplay.parseOBJGeometry(content, name);
        };
        this.handleFileInput(files[0], 'obj', callback);
    }

    handleSceneInput(files: FileList) {
        const callback = (content: any) => {
            this.eventDisplay.parsePhoenixDisplay(content);
        };
        this.handleFileInput(files[0], 'phnx', callback);
    }

    handleGLTFInput(files: FileList) {
        const callback = (content: any, name: string) => {
            this.eventDisplay.parseGLTFGeometry(content, name);
        };
        this.handleFileInput(files[0], 'gltf', callback);
    }

    handlePhoenixInput(files: FileList) {
        const callback = (content: any) => {
            this.eventDisplay.parsePhoenixDisplay(content);
        };
        this.handleFileInput(files[0], 'phnx', callback);
    }

    async handleROOTInput(files: FileList) {
        const eventLoader = new EventLoader(URL.createObjectURL(files[0]));

        eventLoader.getData('tree', (fileData: any) => {
            const belle2Loader = new Belle2Loader();
            const data = belle2Loader.getAllEventData(fileData);
            this.eventDisplay.parsePhoenixEvents(data);
        });

        this.onClose();
    }

    async handleROOTDetectorInput(files: FileList) {
        const rootObjectName = prompt('Enter object name in ROOT file');

        await this.eventDisplay.loadRootGeometry(
            URL.createObjectURL(files[0]),
            rootObjectName,
            files[0].name.split('.')[0]
        );

        this.onClose();
    }

    async handleJSONConvertor(files: FileList) {
        const eventLoader = new EventLoader(URL.createObjectURL(files[0]));

        eventLoader.getData('tree', (fileData: any) => {
            const fileToSave = new Blob([JSON.stringify(fileData)], {
                type: 'application/json'
            });
            saveAs(fileToSave, 'event.json');
        });

        this.onClose();
    }

    async handleRootJSONInput(files: FileList) {
        if (!this.isFileOfExtension(files[0], 'gz')) {
            return;
        }

        const name = files[0].name.split('.')[0];
        await this.eventDisplay.loadRootJSONGeometry(
            URL.createObjectURL(files[0]),
            name
        );

        this.onClose();
    }

    handleIgEventDataInput(files: FileList) {
        const cmsLoader = new CMSLoader();
        cmsLoader.readIgArchive(files[0], (allEvents: any[]) => {
            const allEventsData = cmsLoader.getAllEventsData(allEvents);
            this.eventDisplay.parsePhoenixEvents(allEventsData);
            this.onClose();
        });
    }

    async handleZipEventDataInput(files: FileList) {
        if (!this.isFileOfExtension(files[0], 'zip')) {
            return;
        }

        const allEventsObject = {};
        let filesWithData: { [fileName: string]: string };

        // Using a try catch block to catch any errors in Promises
        try {
            filesWithData = await readZipFile(files[0]);
        } catch (error) {
            console.error('Error while reading zip', error);
            this.eventDisplay
                .getInfoLogger()
                .add('Could not read zip file', 'Error');
            return;
        }

        // JSON event data
        Object.keys(filesWithData)
            .filter(fileName => fileName.endsWith('.json'))
            .forEach(fileName => {
                Object.assign(
                    allEventsObject,
                    JSON.parse(filesWithData[fileName])
                );
            });

        // JiveXML event data
        const jiveloader = new JiveXMLLoader();
        Object.keys(filesWithData)
            .filter(fileName => {
                return (
                    fileName.endsWith('.xml') || fileName.startsWith('JiveXML')
                );
            })
            .forEach(fileName => {
                jiveloader.process(filesWithData[fileName]);
                const eventData = jiveloader.getEventData();
                Object.assign(allEventsObject, { [fileName]: eventData });
            });
        // For some reason the above doesn't pick up JiveXML_XXX_YYY.zip

        this.eventDisplay.parsePhoenixEvents(allEventsObject);

        this.onClose();
    }

    handleFileInput(
        file: File,
        extension: string,
        callback: (result: string, fileName?: string) => void
    ) {
        const reader = new FileReader();

        if (this.isFileOfExtension(file, extension)) {
            reader.onload = () => {
                callback(reader.result.toString(), file.name.split('.')[0]);
            };
            reader.readAsText(file);
        }

        this.onClose();
    }

    private isFileOfExtension(file: File, extension: string): boolean {
        if (file.name.split('.').pop() === extension) {
            return true;
        }

        console.error('Error: Invalid file format!');
        this.eventDisplay.getInfoLogger().add('Invalid file format!', 'Error');

        return false;
    }

    saveScene() {
        this.eventDisplay.exportPhoenixDisplay();
    }

    exportOBJ() {
        this.eventDisplay.exportToOBJ();
    }
}
