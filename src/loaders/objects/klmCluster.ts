import * as THREE from 'three';

const getPhi = (vector: THREE.Vector3) => {
    return Math.atan2(vector.y, vector.x);
};

const getR = (vector: THREE.Vector3) => {
    return Math.sqrt(
        vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
    );
};

const getTheta = (vector: THREE.Vector3) => {
    return Math.atan2(
        Math.sqrt(vector.x * vector.x + vector.y * vector.y),
        vector.z
    );
};

function clusterCreator(
    o: THREE.Vector3,
    u: THREE.Vector3,
    v: THREE.Vector3,
    ud: number,
    vd: number,
    depth: number,
    info: any
): THREE.Group {
    // Force minimum width of polygon to deal with Eve limits
    const min = 0.04;
    if (vd < min) vd = min;
    if (ud < min) ud = min;
    if (depth < min) depth = min;

    const norm = u.clone().cross(v);
    const scaled_u = u.clone().multiplyScalar(0.5 * ud);
    const scaled_v = v.clone().multiplyScalar(0.5 * vd);
    norm.multiplyScalar(0.5 * depth);

    const verticies: any = [];

    for (let k = 0; k < 8; ++k) {
        // Coordinates for all eight corners of the box
        // as two parallel rectangles, with vertices specified in clockwise direction
        const signU = (k + 1) & 2 ? -1 : 1;
        const signV = k & 4 ? -1 : 1;
        const signN = k & 2 ? -1 : 1;
        const vertex = new THREE.Vector3(
            o.x + signU * scaled_u.x + signV * scaled_v.x + signN * norm.x,
            o.y + signU * scaled_u.y + signV * scaled_v.y + signN * norm.y,
            o.z + signU * scaled_u.z + signV * scaled_v.z + signN * norm.z
        );
        verticies.push([vertex.x, vertex.y, vertex.z]);
    }

    const verticiesMapping: any = {
        front_1: verticies[0],
        front_2: verticies[4],
        front_3: verticies[5],
        front_4: verticies[1],
        back_1: verticies[3],
        back_2: verticies[7],
        back_3: verticies[6],
        back_4: verticies[2]
    };

    let allFacePositions: number[] = [];

    const addFace3 = (...faces: string[]) => {
        allFacePositions = allFacePositions.concat(
            ...faces.map(face => verticiesMapping[face])
        );
    };

    // front
    addFace3('front_1', 'front_2', 'front_3');
    addFace3('front_3', 'front_4', 'front_1');

    // back
    addFace3('back_1', 'back_2', 'back_3');
    addFace3('back_3', 'back_4', 'back_1');

    // top
    addFace3('back_1', 'back_2', 'front_2');
    addFace3('front_2', 'front_1', 'back_1');

    // bottom
    addFace3('back_4', 'back_3', 'front_3');
    addFace3('front_3', 'front_4', 'back_4');

    // left
    addFace3('front_1', 'front_4', 'back_4');
    addFace3('back_4', 'back_1', 'front_1');

    // right
    addFace3('front_2', 'back_2', 'back_3');
    addFace3('back_3', 'front_3', 'front_2');

    const boxBuffer = new THREE.BufferGeometry();
    boxBuffer.attributes['position'] = new THREE.BufferAttribute(
        new Float32Array(allFacePositions),
        3
    );
    boxBuffer.computeVertexNormals();

    const boxObject = new THREE.Mesh(
        boxBuffer,
        new THREE.MeshPhongMaterial({
            color: 0x3a5311,
            // opacity: 0.7,
            // transparent: true,
            side: THREE.DoubleSide
        })
    );

    const boxEdges = new THREE.EdgesGeometry(boxBuffer);
    const lineBoxObject = new THREE.LineSegments(
        boxEdges,
        new THREE.LineBasicMaterial({
            color: 0xffffff
            // opacity: 1,
            // transparent: true
        })
    );

    boxObject.userData = Object.assign({}, info);
    boxObject.name = 'KLMCluster';

    const cluster = new THREE.Group();

    cluster.add(boxObject);
    cluster.add(lineBoxObject);

    return cluster;
}

export class KLMClusterObject {
    public static getKLMCluster(klmClusterParams: any): THREE.Object3D {
        const scale: number = 4;
        const layerThickness = 3.16 * scale;
        const layerDistance = 9.1 * scale - layerThickness;
        const layerNum = klmClusterParams['layer'];
        const innerMostLayer = klmClusterParams['innermostLayer'];

        const startPos = new THREE.Vector3(
            klmClusterParams['x'],
            klmClusterParams['y'],
            klmClusterParams['z']
        ).multiplyScalar(scale);

        let dir: THREE.Vector3;

        let a = new THREE.Vector3();

        const isBarrel = startPos.z > -175 * scale && startPos.z < 270 * scale;
        let b: THREE.Vector3;
        if (isBarrel) {
            b = new THREE.Vector3(0, 0, 1);
            a = startPos.clone().cross(b).normalize();

            // const c = Math.PI / 4.0

            // const offset = c / 2.0 + Math.PI

            // const phi = Math.floor((getPhi(a.clone()) + offset) / c) * c - Math.PI
            // const theta = getTheta(a.clone())
            // const lenA = getR(a.clone())

            let perp = b.clone().cross(a);

            const barrelRadius = 204.0 * scale;

            startPos.setLength(
                barrelRadius / perp.dot(startPos.clone().normalize())
            );

            dir = startPos.clone();
            dir.normalize();

            dir.setLength(
                (layerDistance + layerThickness) / perp.dot(dir.clone())
            );
        } else {
            b = new THREE.Vector3(startPos.x, startPos.y, 0);
            b.normalize();

            a = startPos.clone().cross(b).normalize();

            let endcapStartZ = 284 * scale;
            if (startPos.z < 0) {
                endcapStartZ = -189.5 * scale;
            }
            const scaleFac = endcapStartZ / startPos.z;

            startPos.setLength(startPos.length() * scaleFac);

            dir = startPos.clone();
            dir.normalize();
            dir.setLength((layerDistance + layerThickness) / Math.abs(dir.z));
        }
        const scene = new THREE.Scene();

        for (let i = 0; i < layerNum; i++) {
            let layerPos = startPos.clone();
            layerPos.add(dir.clone().multiplyScalar(innerMostLayer + i));
            const cluster = clusterCreator(
                layerPos,
                a,
                b,
                20 * scale,
                20 * scale,
                layerThickness / 2,
                klmClusterParams
            );
            scene.add(cluster);
        }
        klmClusterParams.uuid = scene.uuid;
        return scene;
    }
}
