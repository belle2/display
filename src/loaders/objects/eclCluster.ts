import {
    BoxGeometry,
    BufferGeometry,
    CatmullRomCurve3,
    Color,
    Group,
    Line,
    LineBasicMaterial,
    LineDashedMaterial,
    Mesh,
    MeshPhongMaterial,
    MeshToonMaterial,
    Object3D,
    Scene,
    TubeGeometry,
    Vector3
} from 'three';

import { CoordinateHelper } from 'phoenix-event-display/dist/helpers/coordinate-helper';

function getCaloCube(cellWidth: number, cellLength: number) {
    if (cellLength < cellWidth) {
        cellLength = cellWidth;
    }

    const geometry = new BoxGeometry(cellWidth, cellWidth, cellLength);

    // material
    const material = new MeshPhongMaterial({
        color: '#fa233c'
    });

    // object
    const cube = new Mesh(geometry, material);
    return cube;
}

function getCaloPosition(radius: number, theta: number, phi: number) {
    const position = CoordinateHelper.sphericalToCartesian(radius, theta, phi);

    return position;
}

export class ECLClusterObject {
    public static getECLCluster(eclClusterParams: any): Object3D {
        const scale = 4;
        const clusterLength = eclClusterParams.energy * 120 * scale;
        const clusterWidth = 3 * scale;
        const radius = eclClusterParams.radius * scale + clusterLength * 0.3;
        const theta = eclClusterParams.theta;
        const phi = eclClusterParams.phi;

        const cube = getCaloCube(clusterWidth, clusterLength);

        const position = getCaloPosition(radius, theta, phi);

        cube.position.copy(position);

        cube.lookAt(new Vector3(0, 0, 0));
        cube.userData = Object.assign({}, eclClusterParams);
        cube.name = 'ECLCluster';
        // Setting uuid for selection from collections info
        eclClusterParams.uuid = cube.uuid;

        return cube;
    }
}
