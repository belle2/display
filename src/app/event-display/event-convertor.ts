import * as mdstExample from '../../assets/event/mdst.json';
import { saveAs } from 'file-saver';

export function eventConvertor() {
    let event = {};
    const arrayEvent = Object.entries(mdstExample).map(([key, value]) => {
        return {
            CaloClusters: {
                ECLClusters: value?.ECLClusters?.map(cluster => ({
                    energy: 10000 * Math.exp(cluster?.['m_logEnergy']),
                    eta: -Math.log(Math.tan(cluster?.['m_theta'] / 2)),
                    phi: cluster?.['m_phi'],
                    radius:
                        2 * cluster?.m_r +
                        (10000 * Math.exp(cluster?.['m_logEnergy']) * 0.03) /
                            2.9,
                    side: 6,
                    color: '#FF5533'
                }))
            }
        };
    });
    for (let i = 0; i < arrayEvent.length - 1; i++) {
        event = { ...event, [`Event ${i}`]: arrayEvent[i] };
    }
    const fileToSave = new Blob([JSON.stringify(event)], {
        type: 'application/json'
    });
    saveAs(fileToSave, 'mdst_event.json');
}
