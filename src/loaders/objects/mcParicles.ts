import {
    BufferGeometry,
    CatmullRomCurve3,
    Color,
    Group,
    Line,
    LineBasicMaterial,
    LineDashedMaterial,
    Mesh,
    MeshToonMaterial,
    Object3D,
    Scene,
    TubeGeometry,
    Vector3
} from 'three';
export class MCParticleObject {
    public static getMCParticle(mcParticleParams: any): Object3D {
        const points = mcParticleParams.pos.map(
            (point: any) => new Vector3(point[0], point[1], point[2])
        );
        const color = new Color(mcParticleParams.color);

        const curve = new CatmullRomCurve3(points);

        // TubeGeometry
        const tubeGeometry = new TubeGeometry(curve, undefined, 2);
        const tubeMaterial = new MeshToonMaterial({
            color: color,
            transparent: true,
            opacity: 0
        });
        const tubeObject = new Mesh(tubeGeometry, tubeMaterial);

        const lineGeometry = new BufferGeometry().setFromPoints(points);
        const lineMaterial = new LineDashedMaterial({
            color: color,
            dashSize: 3,
            gapSize: 2
        });
        const lineObject = new Line(lineGeometry, lineMaterial);
        lineObject.computeLineDistances();

        const trackObject = new Group();

        trackObject.add(tubeObject);
        trackObject.add(lineObject);

        for (const object of [tubeObject, trackObject, lineObject]) {
            object.userData = Object.assign(
                {},
                { ...mcParticleParams, pos: undefined }
            );
            object.name = 'MCParticle';
        }

        mcParticleParams.uuid = tubeObject.uuid;

        return trackObject;
    }
}
