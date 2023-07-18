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

    getProbabilities(logL: any) {
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

    private getTracks(): any {
        let tracks: any = {};
        tracks['Fitted Track'] = this.data?.Tracks.map(
            (track: any, index: number) => {
                const logL = {
                    'e-':
                        track['e-'] ?? this.data?.PIDLikelihoods?.[index]['e-'],
                    'mu-':
                        track['mu-'] ??
                        this.data?.PIDLikelihoods?.[index]['mu-'],
                    'pi+':
                        track['pi+'] ??
                        this.data?.PIDLikelihoods?.[index]['pi+'],
                    'K+':
                        track['K+'] ?? this.data?.PIDLikelihoods?.[index]['K+'],
                    'p+':
                        track['p+'] ?? this.data?.PIDLikelihoods?.[index]['p+'],
                    deuteron:
                        track['deuteron'] ??
                        this.data?.PIDLikelihoods?.[index]['deuteron']
                };
                const probabilities = this.getProbabilities(logL);
                return {
                    charge: track.charge,
                    color: '336FD1',
                    d0: track.d0,
                    z0: track.z0,
                    phi: track.phi0,
                    omega: track.omega,
                    tanLambda: track.tanLambda,
                    'e-': probabilities?.['e-'],
                    'mu-': probabilities?.['mu-'],
                    'pi+': probabilities?.['pi+'],
                    'K+': probabilities?.['K+'],
                    'p+': probabilities?.['p+'],
                    deuteron: probabilities?.['deuteron'],
                    pos: track.pos.map((row: any) =>
                        row.map((val: any) => val * this.scale)
                    )
                };
            }
        );
        // const trackNum = this.data?.Tracks.length;
        // if (trackNum !== 0) {
        //     for (let i = 0; i < trackNum; i++) {
        //         tracks[`Track ${i}`] = [
        //             {
        //                 charge: this.data.Tracks[i].charge,
        //                 // color: track.charge ? track.charge === 1.0 ? "E33535" : "336FD1": "A6C55E",
        //                 color: '336FD1',
        //                 pos: this.data.Tracks[i].pos.map((row: any) =>
        //                     row.map((val: any) => val * this.scale)
        //                 ),
        //                 d0: this.data.Tracks[i].d0,
        //                 z0: this.data.Tracks[i].z0,
        //                 phi: this.data.Tracks[i].phi0,
        //                 omega: this.data.Tracks[i].omega,
        //                 tanLambda: this.data.Tracks[i].tanLambda
        //             }
        //         ];
        //     }
        // }
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
            2112: 'n0',
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
        this.data?.MCParticles.forEach((particle: any) => {
            if (particle?.seen?.length) {
                const groupName = this.getParticleGroup(particle.PDG);
                if (!collection.includes(groupName)) {
                    collection.push(groupName);
                    particles[groupName] = [];
                }
                particles[groupName].push({
                    name:
                        particle.name ??
                        particleNames[particle.PDG] ??
                        'Unknown particle',
                    charge: particle.charge,
                    pos: particle.pos.map((row: any) =>
                        row.map((val: any) => val * this.scale)
                    ),
                    energy: particle?.energy,
                    momentumX: particle?.momentum_x,
                    momentumY: particle?.momentum_y,
                    momentumZ: particle?.momentum_z,
                    PDG: particle.PDG,
                    color: this.getParticleColor(particle.PDG),
                    seen: particle?.seen
                });
            }
        });

        // particles['ReconstructedTrack'] = this.data?.MCParticles.map((particle: any) => ({
        //   name: particle.name,
        //   charge: particle.charge,
        //   pos: particle.pos.map((row: any) => row.map((val: any) => val * this.scale)),
        //   PDG: particle.PDG,
        //   color: this.getParticleColor(particle.PDG)
        // }))
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
            case 111:
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
