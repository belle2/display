import { Cut, PhoenixLoader, PhoenixObjects } from 'phoenix-event-display';
import { KLMClusterObject } from './objects/klmCluster';

import { MCParticleObject } from './objects/mcParicles';
import { ECLClusterObject } from './objects/eclCluster';

export class Belle2Loader extends PhoenixLoader {
    private data: any;
    private scale: number = 4;

    constructor() {
        super();
        this.data = {};
    }

    protected override loadObjectTypes(eventData: any) {
        super.loadObjectTypes(eventData);
        const pi = parseFloat(Math.PI.toFixed(2));
        if (eventData.KLMClusters) {
            this.addObjectType(
                eventData.KLMClusters,
                KLMClusterObject.getKLMCluster,
                'KLMCLusters'
            );
        }
        if (eventData.MCParticles) {
            const cuts: Cut[] = [];

            this.addObjectType(
                eventData.MCParticles,
                MCParticleObject.getMCParticle,
                'MCParticles',
                false,
                cuts
            );
        }
        if (eventData.ECLClusters) {
            this.addObjectType(
                eventData.ECLClusters,
                ECLClusterObject.getECLCluster,
                'ECLClusters'
            );
        }
    }

    public getEventData(): any {
        const metadata = this.data?.EventMetadata;
        const eventData: any = {
            experimentNumber: metadata.experiment,
            runNumber: metadata.run,
            eventNumber: metadata.event,
            time: metadata.time,
            ECLClusters: {},
            KLMClusters: {},
            Tracks: {},
            MCParticles: {}
        };

        eventData.ECLClusters = this.getECLClusters();
        eventData.KLMClusters = this.getKLMClusters();
        eventData.Tracks = this.getTracks();
        eventData.MCParticles = this.getMCParticles();
        for (const objectType of [
            'ECLClusters',
            'KLMClusters',
            'Tracks',
            'MCParticles'
        ]) {
            if (Object.keys(eventData[objectType]).length === 0) {
                eventData[objectType] = undefined;
            }
        }
        return eventData;
    }

    public getAllEventData(allEventsDataFromJSON: any): any {
        const allEventsData: any = {};
        for (let i = 1; i <= Object.keys(allEventsDataFromJSON).length; i++) {
            this.data = allEventsDataFromJSON?.[`Event ${i}`];
            allEventsData[
                `Experiment ${this.data.EventMetadata.experiment}/Run ${this.data.EventMetadata.run}/Event ${this.data.EventMetadata.event}`
            ] = this.getEventData();
        }
        return allEventsData;
    }

    private radianToDegree(angle: number) {
        return ((angle * 180) / Math.PI).toFixed(4) + ' °';
    }

    private getKLMClusters(): any {
        const klmClusters: any = {};
        const clusterNum = this.data?.KLMClusters.length;
        if (clusterNum !== 0) {
            for (let i = 0; i < clusterNum; i++) {
                klmClusters[`KLMCluster ${i}`] = [this.data.KLMClusters[i]];
            }
        }
        return klmClusters;
    }

    private getECLClusters(): any {
        let eclClusters: any = {};
        const clusterNum = this.data?.ECLClusters.length;
        if (clusterNum !== 0) {
            for (let i = 0; i < clusterNum; i++) {
                eclClusters[`ECLCluster ${i}`] = [
                    {
                        energy: this.data.ECLClusters[i].energy,
                        theta: this.data.ECLClusters[i].theta,
                        phi: this.data.ECLClusters[i].phi,
                        radius: this.data.ECLClusters[i].r
                    }
                ];
            }
        }
        return eclClusters;
    }

    private getProbabilities(logL: any) {
        if (Object.keys(logL).length === 0) return {};

        const stableParticles = ['e-', 'mu-', 'pi+', 'K+', 'p+', 'deuteron'];
        const frac: number[] = new Array(stableParticles.length).fill(1.0);
        const probabilities: any = {};
        let norm = 0;

        const logLMax = Math.max(...(Object.values(logL) as number[]));

        for (let i = 0; i < stableParticles.length; i++) {
            const particle = stableParticles[i];
            const exponent = Math.exp(logL[particle] - logLMax) * frac[i];
            probabilities[particle] = exponent;
            norm += exponent;
        }

        for (let i = 0; i < stableParticles.length; i++) {
            const particle = stableParticles[i];
            probabilities[particle] /= norm;
        }

        return probabilities;
    }

    private getMommentumForTrack(tanLambda, omega, phi) {
        return {
            momentumX: ((0.0045 * Math.cos(phi)) / omega).toPrecision(5),
            momentumY: ((0.0045 * Math.sin(phi)) / omega).toPrecision(5),
            momentumZ: ((0.0045 * tanLambda) / omega).toPrecision(5)
        };
    }

    private getTracks(): any {
        let tracks: any = {};
        const roundProbability = (prob: number) => prob.toFixed(4);

        tracks['Fitted Track'] = this.data?.Tracks.map(
            (track: any, index: number) => {
                const logL = {
                    'e-':
                        track['e-'] ??
                        this.data?.PIDLikelihoods?.[index]?.['e-'] ??
                        -100,
                    'mu-':
                        track['mu-'] ??
                        this.data?.PIDLikelihoods?.[index]?.['mu-'] ??
                        -100,
                    'pi+':
                        track['pi+'] ??
                        this.data?.PIDLikelihoods?.[index]?.['pi+'] ??
                        -100,
                    'K+':
                        track['K+'] ??
                        this.data?.PIDLikelihoods?.[index]?.['K+'] ??
                        -100,
                    'p+':
                        track['p+'] ??
                        this.data?.PIDLikelihoods?.[index]?.['p+'] ??
                        -100,
                    deuteron:
                        track['deuteron'] ??
                        this.data?.PIDLikelihoods?.[index]?.['deuteron'] ??
                        -100
                };
                const probabilities = this.getProbabilities(logL);
                return {
                    index: track.index ?? index,
                    charge: track.charge,
                    color: '336FD1',
                    d0: track.d0.toPrecision(5),
                    z0: track.z0.toPrecision(5),
                    phi: track.phi0.toPrecision(5),
                    omega: track.omega.toPrecision(5),
                    tanLambda: track.tanLambda.toPrecision(5),
                    ...this.getMommentumForTrack(
                        track.tanLambda,
                        track.omega,
                        track.phi0
                    ),
                    ...(track?.MCParticleIndex > 0 && {
                        MCParticle: track?.MCParticleIndex
                    }),
                    'e-': roundProbability(probabilities?.['e-']),
                    'mu-': roundProbability(probabilities?.['mu-']),
                    'pi+': roundProbability(probabilities?.['pi+']),
                    'K+': roundProbability(probabilities?.['K+']),
                    'p+': roundProbability(probabilities?.['p+']),
                    deuteron: roundProbability(probabilities?.['deuteron']),
                    pos: track.pos.map((row: any) =>
                        row.map((val: any) => val * this.scale)
                    )
                };
            }
        );
        return tracks;
    }

    private getMCParticles(): any {
        let particles: any = {};
        let collection: any[] = [];
        // const pdgMap: any = {
        //   "22": "photon",
        //   "321": "kaon",
        //   "-321": "kaon",
        //   "211": "pion",
        //   "-211": "pion",
        //   "111": "pion",
        //   "11": "electron",
        //   "-11": "electron",
        //   "13": "muon",
        //   "-13": "muon",
        //   "2212": "proton",
        //   "-2212": "proton",
        //   "411": "deuteron",
        //   "-411": "deuteron",
        //   "421": "deuteron"
        // }
        const particleNames = {
            11: 'e-',
            12: 'nu_e',
            13: 'mu-',
            14: 'nu_mu',
            22: 'gamma',
            130: 'K_L0',
            211: 'pi+',
            111: 'pi0',
            2112: 'n0',
            '-2112': 'anti-n0',
            2212: 'p+',
            '-11': 'e+',
            '-12': 'anti-nu_e',
            '-13': 'mu+',
            '-14': 'anti-nu_mu',
            '-211': 'pi-',
            321: 'K+',
            '-321': 'K-',
            '-2212': 'anti-p-'
        };
        this.data?.MCParticles.forEach((particle: any, index: number) => {
            if (particle?.seen !== '0' && particle?.seen?.length) {
                const groupName = this.getParticleGroup(particle.PDG);
                if (!collection.includes(groupName)) {
                    collection.push(groupName);
                    particles[groupName] = [];
                }
                particles[groupName].push({
                    index: particle.index ?? index,
                    name:
                        particle.name ??
                        particleNames[particle.PDG] ??
                        'Unknown particle',
                    charge: particle.charge,
                    energy: particle?.energy.toPrecision(5),
                    momentumX: particle?.momentum_x.toPrecision(5),
                    momentumY: particle?.momentum_y.toPrecision(5),
                    momentumZ: particle?.momentum_z.toPrecision(5),
                    ...(particle?.trackIndex > 0 && {
                        Track: particle.trackIndex
                    }),
                    phi: Math.atan(
                        particle?.momentum_x / particle?.momentum_y
                    ).toPrecision(5),
                    PDG: particle.PDG,
                    color: this.getParticleColor(particle.PDG),
                    ...(this.getParticleGroup(particle.PDG) !== 'Neutrinos' && {
                        seen: particle.seen
                    }),
                    pos: particle.pos.map((row: any) =>
                        row.map((val: any) => val * this.scale)
                    )
                });
            }
        });

        return particles;
    }

    private getParticleColor(pdg: number): string {
        switch (pdg) {
            case 22:
                return '#ff1e1e';
            case 321:
            case -321:
                return '#22ff1e';
            case 2212:
            case -2212:
                return '#f213a0';
            case 411:
            case -411:
            case 421:
                return '#00FFFF';
            case 11:
            case -11:
                return '#f26513';
            case 13:
            case -13:
                return '#f2eb13';
            case 211:
            case -211:
            case 111:
                return '#1322f2';
            case 12:
            case 14:
            case 16:
            case -12:
            case -14:
            case -16:
                return '#595954';
            default:
                return '#bdbdb5';
        }
    }

    private getParticleGroup(pdg: number): string {
        switch (pdg) {
            case 22:
            case 2112:
            case -2112:
            case 130:
            case 111:
                return 'Neutral particles';
            case 321:
            case -321:
            case 2212:
            case -2212:
            case 411:
            case -411:
            case 421:
            case 11:
            case -11:
            case 13:
            case -13:
            case 211:
            case -211:
                return 'Charged particles';
            case 12:
            case 14:
            case 16:
            case -12:
            case -14:
            case -16:
                return 'Neutrinos';
            default:
                return 'Others';
        }
    }
}
