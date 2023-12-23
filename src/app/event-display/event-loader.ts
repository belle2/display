import { PhoenixLoader } from 'phoenix-event-display/dist/loaders/phoenix-loader';
import { settings as jsrootSettings, openFile } from 'jsroot';
import { TSelector, treeProcess } from 'jsroot/tree';
import { format } from 'date-fns';

class TEventSelector extends TSelector {
    /** constructor */
    private branch: string;
    private branchData: any;
    constructor(branch: string) {
        super();
        this.branch = branch;
        this.addBranch(branch);
        this.branchData = [];
    }

    getECLClusters(data: any) {
        return [
            ...data
                .filter(cluster => [16, 48].includes(cluster['m_hypotheses']))
                .map(cluster => ({
                    r: cluster['m_r'],
                    phi: cluster['m_phi'],
                    theta: cluster['m_theta'],
                    energy: Math.exp(cluster?.['m_logEnergy'])
                }))
        ];
    }

    getKLMClusters(data: any) {
        return [
            ...data.map(cluster => ({
                x: cluster['m_globalX'],
                y: cluster['m_globalY'],
                z: cluster['m_globalZ'],
                layer: cluster['m_layers'],
                innermostLayer: cluster['m_innermostLayer']
            }))
        ];
    }

    getEventMetaData(data: any) {
        return {
            experiment: data['m_experiment'],
            run: data['m_run'],
            event: data['m_event'],
            time: format(
                parseInt(data['m_time'].toString().slice(0, -6)),
                'yyyy-MM-dd HH:mm:ss'
            )
        };
    }

    private getParticleCharge(pdg: number): number {
        switch (pdg) {
            case 22:
            case 2112:
            case -2112:
            case 130:
            case 111:
                return 0;
            case 321:
            case 2212:
            case 411:
            case 421:
            case -11:
            case -13:
            case 211:
                return 1;
            case -321:
            case -2212:
            case -411:
            case 11:
            case 13:
            case -211:
                return -1;
            default:
                return 0;
        }
    }

    getMCParticles(data: any) {
        return [
            ...data.map((particle: any, index: number) => {
                const charge = this.getParticleCharge(particle['m_pdg']);
                const x0 = particle['m_productionVertex_x'];
                const y0 = particle['m_productionVertex_y'];
                const z0 = particle['m_productionVertex_z'];

                const xe = particle['m_decayVertex_x'];
                const ye = particle['m_decayVertex_y'];
                const ze = particle['m_decayVertex_z'];

                const px = particle['m_momentum_x'];
                const py = particle['m_momentum_y'];
                const pz = particle['m_momentum_z'];

                let points: [number, number, number][] = [];
                const rho = charge * Math.sqrt(px * px + py * py) / 0.0045; // approximation and only for charge != 0
                const tanLambda = pz / Math.sqrt(px * px + py * py);
                const phi0 = Math.atan2(py, px);

                if (charge === 0) {
                    if (
                        Math.sqrt(xe * xe + ye * ye) < 200 &&
                        ze < 280 &&
                        ze > -150
                    ) {
                        points = [
                            [x0, y0, z0],
                            [xe, ye, ze]
                        ];
                    } else {
                        const sz = (pz > 0) ? (280 - z0) / pz : (-150 - z0) / pz;
                        const a = px * px + py * py;
                        const b = 2 * (x0 * px + y0 * py);
                        const c = x0 * x0 + y0 * y0 - 200 * 200;
                        const sr = -0.5 * b + Math.sqrt(b * b - 4 * a * c) / a;
                        const s = (sr < sz) ? sr : sz;
                        points = [
                            [x0, y0, z0],
                            [x0 + s * px, y0 + s * py, z0 + s * pz]
                        ];
                    }
                } else {
                    const xa = x0 + rho * Math.cos(phi0 - Math.PI / 2);
                    const ya = y0 + rho * Math.sin(phi0 - Math.PI / 2);
                    const phis = Array.from(
                        {
                            length: Math.floor((Math.PI - 0.015) / 0.015) + 1
                        },
                        (_, i) => 0.015 + 0.015 * i
                    );

                    points.push([x0, y0, z0]);
                    for (const phi of phis) {
                        const x =
                            xa -
                            rho * Math.cos(phi0 - Math.PI / 2 - charge * phi); //opposite with Python
                        const y =
                            ya -
                            rho * Math.sin(phi0 - Math.PI / 2 - charge * phi);
                        const z = z0 + Math.abs(rho) * tanLambda * phi;
                        points.push([x, y, z]);

                        if (
                            Math.sqrt(x * x + y * y) > 150 ||
                            z > 300 ||
                            z < -200
                        ) {
                            break;
                        }
                    }
                }

                return {
                    index,
                    pos: points,
                    PDG: particle['m_pdg'],
                    charge: charge,
                    momentum_x: px,
                    momentum_y: py,
                    momentum_z: pz,
                    energy: particle['m_energy'],
                    seen: `${particle['m_seenIn']['m_bits']}`
                };
            })
        ];
    }

    getTracks(data: any) {
        return [
            ...data.map((track: any, index: number) => ({
                index,
                trackFitIndex: track['m_trackFitIndices'].find(i => i >= 0)
            }))
        ];
    }

    getTrackFitResults(data: any) {
        return [
            ...data.map((track: any) => ({
                d0: track['m_tau'][0],
                phi0: track['m_tau'][1],
                omega: track['m_tau'][2],
                z0: track['m_tau'][3],
                tanLambda: track['m_tau'][4],
                charge:
                    track['m_tau'][2] === 0
                        ? 0
                        : track['m_tau'][2] / Math.abs(track['m_tau'][2])
            }))
        ];
    }

    getTracksToPIDLikelihoods(data: any) {
        const elementData: any = data['m_elements'];
        const tracksToPIDMap: any = {};
        for (let i = 0; i < elementData.length; i++) {
            tracksToPIDMap[elementData[i]['m_from']] =
                elementData[i]['m_to'][0];
        }
        return tracksToPIDMap;
    }

    getTracksToMCParticles(data: any) {
        const elementData: any = data['m_elements'];
        const tracksToMCParticleMap: any = {};
        for (let i = 0; i < elementData.length; i++) {
            tracksToMCParticleMap[elementData[i]['m_from']] =
                elementData[i]['m_to'][0];
        }
        return tracksToMCParticleMap;
    }

    getPIDLikelihoods(data: any) {
        // [<type: e->, <type: mu->, <type: pi+>, <type: K+>, <type: p+>, <type: deuteron>]
        const stableParticles = ['e-', 'mu-', 'pi+', 'K+', 'p+', 'deuteron'];
        // <set: SVD,CDC,TOP,ARICH,ECL,KLM>
        const detectorSet = ['SVD', 'CDC', 'TOP', 'ARICH', 'ECL', 'KLM'];
        return [
            ...data.map((info: any) => {
                const logl = info['m_logl'];
                const PID: any = {};
                for (let i = 0; i < stableParticles.length; i++) {
                    PID[stableParticles[i]] = logl.reduce(
                        (sum, array) => sum + array[i],
                        0
                    );
                }
                return PID;
            })
        ];
    }

    /** function called before reading of TTree starts */
    Begin() {}

    /** function called for every entry */
    Process(entryNum: any) {
        if (this.branch === 'ECLClusters') {
            this.branchData.push({
                ECLClusters: this.getECLClusters(this.tgtobj['ECLClusters'])
            });
        }
        if (this.branch === 'KLMClusters') {
            this.branchData.push({
                KLMClusters: this.getKLMClusters(this.tgtobj['KLMClusters'])
            });
        }
        if (this.branch === 'EventMetaData') {
            this.branchData.push({
                EventMetadata: this.getEventMetaData(
                    this.tgtobj['EventMetaData']
                )
            });
        }
        if (this.branch === 'Tracks') {
            this.branchData.push({
                Tracks: this.getTracks(this.tgtobj['Tracks'])
            });
        }
        if (this.branch === 'TrackFitResults') {
            this.branchData.push({
                TrackFitResults: this.getTrackFitResults(
                    this.tgtobj['TrackFitResults']
                )
            });
        }
        if (this.branch === 'MCParticles') {
            this.branchData.push({
                MCParticles: this.getMCParticles(this.tgtobj['MCParticles'])
            });
        }
        if (this.branch === 'TracksToPIDLikelihoods') {
            this.branchData.push({
                TracksToPIDLikelihoods: this.getTracksToPIDLikelihoods(
                    this.tgtobj['TracksToPIDLikelihoods']
                )
            });
        }
        if (this.branch === 'TracksToMCParticles') {
            this.branchData.push({
                TracksToMCParticles: this.getTracksToMCParticles(
                    this.tgtobj['TracksToMCParticles']
                )
            });
        }
        if (this.branch === 'PIDLikelihoods') {
            this.branchData.push({
                PIDLikelihoods: this.getPIDLikelihoods(
                    this.tgtobj['PIDLikelihoods']
                )
            });
        }
    }

    /** function called when processing finishes */
    Terminate(res: any) {}

    public getBranchData() {
        return this.branchData;
    }
}

export class EventLoader extends PhoenixLoader {
    private fileData: any;
    private fileURL: any;
    private branches: any;
    private entries: any;

    constructor(fileURL: any) {
        super();

        this.fileURL = fileURL;

        this.fileData = {};

        this.branches = [
            'KLMClusters',
            'ECLClusters',
            'Tracks',
            'TrackFitResults',
            'TracksToPIDLikelihoods',
            'TracksToMCParticles',
            'TracksToMCParticles',
            'TracksToMCParticles',
            'PIDLikelihoods',
            'MCParticles',
            'EventMetaData'
        ];
    }

    getTrackPos(data: any) {
        const d0 = data['d0'];
        const phi0 = data['phi0'];
        const z0 = data['z0'];
        const omega = data['omega'];
        const tanLambda = data['tanLambda'];

        let points: [number, number, number][] = [];

        const x0: number = d0 * Math.cos(phi0 - Math.PI / 2);
        const y0: number = d0 * Math.sin(phi0 - Math.PI / 2);

        if (omega === 0) {
            const dx = Math.cos(phi0);
            const dy = Math.sin(phi0);
            const dz = tanLambda;

            for (let i = 0; true; i++) {
                const x: number = x0 + i * dx;
                const y: number = y0 + i * dy;
                const z: number = z0 + i * dz;
                points.push([x, y, z]);

                if (Math.sqrt(x ** 2 + y ** 2) > 130 || z > 210 || z < -100) {
                    return points;
                }
            }
        }

        const rho = 1 / omega;
        const charge = omega / Math.abs(omega);
        const xa = x0 + rho * Math.cos(phi0 - Math.PI / 2);
        const ya = y0 + rho * Math.sin(phi0 - Math.PI / 2);
        const phis = Array.from(
            { length: Math.floor(Math.PI / 0.015) },
            (_, i) => i * 0.015
        );

        for (const phi of phis) {
            const x: number =
                xa - rho * Math.cos(phi0 - Math.PI / 2 - charge * phi);
            const y: number =
                ya - rho * Math.sin(phi0 - Math.PI / 2 - charge * phi);
            const z: number = z0 + Math.abs(rho) * tanLambda * phi;

            points.push([x, y, z]);

            if (Math.sqrt(x ** 2 + y ** 2) > 130 || z > 210 || z < -100) {
                return points;
            }
        }

        return points;
    }

    public async getData(
        treeName: string,
        onHandleData: (data: any) => void = () => {}
    ) {
        jsrootSettings.UseStamp = false;

        const file = await openFile(this.fileURL);
        const tree = await file.readObject(treeName);
        // this.branches = tree.fBranches.arr.map((branch: any) => branch.fName);
        this.entries = tree.fEntries;

        // Use Promise.all and map to wait for all promises to resolve.
        const branchDataPromises = this.branches.map(async (branch: string) => {
            const selector = new TEventSelector(branch);
            await treeProcess(tree, selector);
            return selector.getBranchData();
        });
        const allBranchData = await Promise.all(branchDataPromises);

        for (let i = 0; i < this.entries; i++) {
            for (let j = 0; j < this.branches.length; j++) {
                this.fileData = {
                    ...this.fileData,
                    [`Event ${i + 1}`]: {
                        ...this.fileData[`Event ${i + 1}`],
                        ...allBranchData[j][i]
                    }
                };
            }
            // TrackFitResults --> Tracks
            const eventData = this.fileData[`Event ${i + 1}`];
            for (let j = 0; j < eventData['Tracks'].length; j++) {
                const trackFitIndex = eventData['Tracks'][j]['trackFitIndex'];
                const PIDIndex = eventData['TracksToPIDLikelihoods'][j];
                const MCParticleIndex = eventData['TracksToMCParticles'][j];
                eventData['Tracks'][j] = {
                    ...eventData['Tracks'][j],
                    pos: this.getTrackPos(
                        eventData['TrackFitResults'][trackFitIndex]
                    ),
                    ...eventData['TrackFitResults'][trackFitIndex],
                    ...eventData['PIDLikelihoods'][PIDIndex],
                    MCParticleIndex
                };
                eventData['MCParticles'][MCParticleIndex] = {
                    ...eventData['MCParticles'][MCParticleIndex],
                    trackIndex: j
                };
            }
        }
        // Save fileData by input the appropriate onHandleData function
        onHandleData(this.fileData);
        return this.fileData;
    }
}
