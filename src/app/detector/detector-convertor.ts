/* The code below is originated from phoenixExport file to convert the .root to .json */
import * as JSROOT from 'jsroot';
import { build } from 'jsroot/geom';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { saveAs } from 'file-saver';

var kVisThis = 0x80;
var kVisDaughter = 0x8;

function matches(name: string, paths: any) {
    for (const path of paths) {
        if (typeof path == 'string') {
            if (name.startsWith(path)) {
                return true;
            }
        } else {
            if (name.match(path)) {
                return true;
            }
        }
    }
    return false;
}

function filterArrayPlace(array: any, condition: any, thisArg?: any) {
    var traceIndex = 0;
    array.forEach((element: any, index: any) => {
        if (condition.call(thisArg, element, index, array)) {
            if (index != traceIndex) array[traceIndex] = element;
            traceIndex++;
        }
    });
    array.length = traceIndex;
    return array;
}

async function cleanup_geometry(
    node: any,
    hide_children: any,
    max_level: number,
    level: number = 0
) {
    if (node.fVolume.fNodes) {
        filterArrayPlace(
            node.fVolume.fNodes.arr,
            (node: any) =>
                level < max_level && !matches(node.fName, hide_children)
        );
        // recurse to children
        for (const snode of node.fVolume.fNodes.arr) {
            cleanup_geometry(snode, hide_children, max_level, level + 1);
        }
    }
}

function fixSphereShapes(shape: any) {
    if (shape._typename == 'TGeoSphere') {
        shape.fNseg = 3;
        shape.fNz = 3;
    }
    if (shape._typename == 'TGeoCompositeShape') {
        fixSphereShapes(shape.fNode.fLeft);
        fixSphereShapes(shape.fNode.fRight);
    }
}

function setVisible(node: any) {
    node.fVolume.fGeoAtt = node.fVolume.fGeoAtt | kVisThis;
    fixSphereShapes(node.fVolume.fShape);
}

function setVisibleDaughter(node: any) {
    node.fVolume.fGeoAtt = node.fVolume.fGeoAtt | kVisDaughter;
}

function setInvisible(node: any) {
    node.fVolume.fGeoAtt = node.fVolume.fGeoAtt & ~kVisThis;
}

function set_visible_recursively(node: any) {
    setVisible(node);
    if (node.fVolume.fNodes) {
        for (var j = 0; j < node.fVolume.fNodes.arr.length; j++) {
            var snode = node.fVolume.fNodes.arr[j];
            set_visible_recursively(snode);
        }
    }
}

function keep_only_subpart(volume: any, paths: any) {
    if (!volume.fNodes) return false;
    var anyfound = false;
    for (var j = 0; j < volume.fNodes.arr.length; j++) {
        var snode = volume.fNodes.arr[j];
        if (matches(snode.fName, paths)) {
            set_visible_recursively(snode);
            anyfound = true;
        } else {
            setInvisible(snode);
            var subpartfound = keep_only_subpart(snode.fVolume, paths);
            if (subpartfound) {
                setVisibleDaughter(snode);
                anyfound = true;
            }
        }
    }
    return anyfound;
}

function setColor(parent: any, color: any) {
    if (!parent) return;
    if (parent?.children?.length === 0) {
        if (parent?.isMesh) {
            if (parent?.material?.color) {
                parent.material.color.r = color.r;
                parent.material.color.g = color.g;
                parent.material.color.b = color.b;
            }
        }
        return;
    }
    for (var child of parent.children) {
        if (child?.isMesh) {
            if (child?.material?.color) {
                child.material.color.r = color.r;
                child.material.color.g = color.g;
                child.material.color.b = color.b;
            }
        } else {
            setColor(child, color);
        }
    }
}

async function deduplicate(gltf: any) {
    var kept = [];
    var links: { [index: number]: any } = {};
    var materials = gltf['materials'];
    for (var index = 0; index < materials.length; index++) {
        var found = false;
        for (var kindex = 0; kindex < kept.length; kindex++) {
            if (
                JSON.stringify(kept[kindex]) == JSON.stringify(materials[index])
            ) {
                links[index] = kindex;
                found = true;
                break;
            }
        }
        if (!found) {
            links[index] = kept.length;
            kept.push(materials[index]);
        }
    }
    // now rewrite the materials table and fix the meshes
    gltf['materials'] = kept;
    for (const mesh of gltf['meshes']) {
        for (const primitive of mesh['primitives']) {
            if ('material' in primitive) {
                primitive['material'] = links[primitive['material']];
            }
        }
    }

    kept = [];
    links = {};
    for (var index = 0; index < gltf.meshes.length; index++) {
        var found = false;
        for (var kindex = 0; kindex < kept.length; kindex++) {
            if (
                JSON.stringify(kept[kindex]) ==
                JSON.stringify(gltf.meshes[index])
            ) {
                links[index] = kindex;
                found = true;
                break;
            }
        }
        if (!found) {
            links[index] = kept.length;
            kept.push(gltf.meshes[index]);
        }
    }
    // now rewrite the meshes table and fix the nodes
    gltf.meshes = kept;
    let json = JSON.stringify(gltf);
    json = json.replace(/"mesh":([0-9]+)/g, function (a, b) {
        return `"mesh":${links[parseInt(b)]}`;
    });
    return JSON.parse(json);
}

async function saveGeometry(obj3d: any, filename: string) {
    const exporter = new GLTFExporter();
    let gltf = await new Promise(resolve =>
        exporter.parse(obj3d, resolve, e => {}, { binary: false })
    );

    gltf = await deduplicate(gltf);
    const fileToSave = new Blob([JSON.stringify(gltf)], {
        type: 'application/json'
    });
    saveAs(fileToSave, filename);
}

async function convert_geometry(
    obj: any,
    outputFile: string,
    max_level: number,
    subparts: any,
    hide_children: any
) {
    const scenes = [];
    cleanup_geometry(obj.fNodes.arr[0], hide_children, max_level);
    for (const [name, entry] of Object.entries<{ [key: string]: any }>(
        subparts
    )) {
        const paths = entry[0];
        const visibility = entry[1];
        const option = entry?.[2];

        setVisible(obj.fNodes.arr[0]);
        keep_only_subpart(obj.fMasterVolume, paths);
        var scene = new THREE.Scene();
        scene.name = name;
        var children = build(obj, {
            dflt_colors:
                typeof option?.dflt_colors == 'boolean'
                    ? option?.dflt_colors
                    : true,
            vislevel: option?.vislevel ?? 10,
            numfaces: option?.numfaces ?? 10000000,
            numnodes: option?.numnodes ?? 500000
        });
        if (option?.color) {
            setColor(children, option.color);
        }
        scene.children.push(children);
        if (typeof visibility == 'boolean') {
            scene.userData = { visible: visibility };
        } else {
            scene.userData = {
                visible: visibility.visible,
                opacity: visibility.opacity
            };
        }

        scenes.push(scene);
    }
    await saveGeometry(scenes, outputFile);
}

async function convertGeometry(
    inputFile: string,
    outputFile: string,
    max_level: number,
    subparts: any,
    hide_children: any,
    objectName: string
) {
    const file = await JSROOT.openFile(inputFile);
    const obj = await file.readObject(objectName);
    await convert_geometry(obj, outputFile, max_level, subparts, hide_children);
}

export { convertGeometry };
