import { convertGeometry } from '../detector/detector-convertor';

export class DetectorLoader {
    private fileData: any;
    private fileURL: any;

    private subparts: any = {
        // TOP_Envelope
        TOP: [['TOPEnvelopeModule'], { visible: true, opacity: 0.05 }],

        //CDC
        CDC: [
            [/^logicalCDC_0/],
            { visible: false, opacity: 0.05 },
            { vislevel: 1 }
        ],

        //EKLM
        EKLM: [['__'], false], //turn off EKLM in Menu
        'EKLM > FWD': [
            [/^Section_1_1.*/],
            { visible: false, opacity: 0.1 },
            { vislevel: 2 }
        ],
        'EKLM > BWD': [
            [/^Section_2_2.*/],
            { visible: false, opacity: 0.1 },
            { vislevel: 2 }
        ],

        //SVD
        SVD: [
            [/SVD\.[1234567890].*/],
            { visible: true, opacity: 0.5 },
            { vislevel: 2 }
        ],

        // PXD
        PXD: [
            [/PXD\.[1234567890].*/],
            { visible: true, opacity: 0.5 },
            { vislevel: 2, color: { r: 1, g: 0.1, b: 0.1 } }
        ],

        // BKLM
        BKLM: [
            ['BKLM.EnvelopeLogical'],
            { visible: false, opacity: 0.1 },
            { vislevel: 1 }
        ],

        // ARICH
        ARICH: [[/ARICH.*/], { visible: false, opacity: 0.05 }, { vislevel: 1 }]
    };

    private hide_children: any = [
        //BKLM
        // /BKLM\.EnvelopeLogical/,
        /^BKLM.CapLogical.*/,
        /^BKLM.ChimneyCapLogical.*/,
        /^BKLM.Inner.*/,
        //EKLM
        // /^Layer_.*/,
        // /^ShieldLayer.*/,

        //CDC
        // /^logicalCDC_0/,

        //TOP
        /^TOPPrism.*/,
        /^TOPPMTArray.*/,
        /^TOPInner.*/,
        /^TOPOuter.*/,
        /^TOPBoardStack.*/,
        /^TOPColdPlate.*/,
        /^TOPBarSegment.*/,
        /^TOPMirrorSegment.*/,
        /^TOPSide.*/,
        /^TOPHVBoard.*/,
        /^TOPForward.*/,
        // /^TOPFront.*/,
        /^PeekFrame/,

        //ARICH
        // /ARICH.*/,

        //PXD
        /^PXD\.Switcher.*/,
        /^PXD\.Balcony.*/,
        /^PXD\.Cap.*/,
        /^PXD\.ReadoutChips.*/,
        /^PXD\.Reinforcement.*/,
        /^PXD\.ThinningLayer.*/,
        /^PXD\.Border.*/,
        /^CarbonTube.*/,
        /^backward_.*/,
        /^forward_.*/,

        //SVD
        /^SVD\. Forward.*/,
        /^SVD\. Backward.*/,
        /^SVD\. Outer.*/,
        /^SVD\.Kapton.*/,
        /^SVD\.Layer.*/,
        /^SVD\.Barrel.*/,
        /^SVD\.Origami.*/,
        /^SVD\.Slanted.*/,
        /^SVD\.APV.*/
    ];

    constructor(fileURL: any) {
        this.fileURL = fileURL;
    }

    public async getData(objName: string) {
        await convertGeometry(
            this.fileURL,
            'Belle2Geo_EventDisplay.gltf',
            10,
            this.subparts,
            this.hide_children,
            objName
        );
        return this.fileData;
    }
}
