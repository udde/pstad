
// heightMap8 = [1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,10,10,10,10,10,10,10,10,10,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,1.353352832,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,0.003354626279,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.522997974e-07,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13,1.266416555e-13]


function threeData(res)
{
    heightMap = require('./heightMapGenerator.js')(res, 1);
    landscape = new Landscape(heightMap, res , 1, 0.5, {pos: [0,0,0]}, {x:0, y:0, z:0});

    // debugger;
    landscape.reset();

    landscape.tessellate();
    data = landscape.generateTriangleData();
    // console.log(data.positions);
    //
    // var geometry = new THREE.BufferGeometry();
    // geometry.addAttribute( 'position', new THREE.BufferAttribute( data.positions, 3 ) );
    // // geometry.addAttribute( 'aColor', new THREE.BufferAttribute( data.normals, 3 ) );
    // // geometry.addAttribute( 'aNormal', new THREE.BufferAttribute( data.normals, 3 ) );
    //
    // var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    // var mesh = new THREE.Mesh( geometry, material );
    //
    // return mesh;
    var geometry = new THREE.BufferGeometry();

    var positions = new Float32Array(data.positions);
    var normals = new Float32Array(data.normals);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
    geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );

    return geometry;

    // var triangle = new THREE.Geometry();
    // triangle.vertices.push( new THREE.Vector3( 1, 1, 1 ) );
    // triangle.vertices.push( new THREE.Vector3( 6, 1, 1 ) );
    // triangle.vertices.push( new THREE.Vector3( 6, 3, 1 ) );

    // for (var i = 0; i < data.positions.length-2; i+=3) {
    //     triangle.vertices.push( new THREE.Vector3( data.positions[i], data.positions[i+1], data.positions[i+2] ) );
    //     triangle.faces.push( new THREE.Face3( i+0, i+1, i+2 ) );
    // }

    // triangle.faces.push( new THREE.Face3( 0, 1, 2 ) );

    // console.log(triangle.vertices);

    return triangle;

}
