var createBuffer    = require("gl-buffer");
var createVAO       = require("gl-vao");
var math            = require('mathjs');

module.exports = init;

function init(gl) {
    var meshes = {};

    //test 2 levels
    // var t1 = window.performance.now();
    var bigres = 3;
    var bigsize = math.pow(2,bigres);
    var res = 3;
    var size = math.pow(2,res);
    var blocks = {x : 2, y : 2};
    var levels = 2;
    var meshBlocks = [];
    // var j = 0, k = 0;
    for(var i = 0; i < levels; i++)
    for(var y = -blocks.y/2, j=0; y < blocks.y/2; y++, j++)
    for(var x = -blocks.x/2, k=0; x < blocks.x/2; x++, k++){
        meshBlocks[i*blocks.x*blocks.y + j*blocks.y + k] = generateMesh(gl,i+1, res, (x + 0.5)*size, (y + 0.5)*size );
    }
    meshes.nBlocks = blocks.x * blocks.y;
    meshes.nLevels = levels;
    meshes.blocks = meshBlocks;
    return meshes;
}

function generateMesh(gl, lodLevel, res, offsetx, offsety) {
    //res = storleken i "meter", lodLevel = upplösningen, "antal trianglar per meter"
    var grid_res_x = math.pow(2,res+(lodLevel -1)), grid_res_y = math.pow(2,res+(lodLevel -1));
    var xscale = 1/lodLevel, yscale = 1/lodLevel;
    var total_square_size = 18;
    var total_data_size = total_square_size * grid_res_x * grid_res_y + (2*(grid_res_x * grid_res_y) + 4) * 9;

    var nvertices = total_square_size * grid_res_x * grid_res_y / 3;
    var aPositionData = new Float32Array(total_data_size);
    var aNormalData = new Float32Array(total_data_size);
    var aTriangleHeightData = new Float32Array(nvertices);
    var triangleHeightDataPos = 0;
    var i = 0;

    var xh = (grid_res_x % 2 == 0) ? grid_res_x / 2 : (grid_res_x - 1) / 2 ;
    var yh = (grid_res_y % 2 == 0) ? grid_res_y / 2 : (grid_res_y - 1) / 2 ;
    for (var X = -xh; X < xh; X++)
    for (var Y = -yh; Y < yh; Y++, i += total_square_size) {

        var x = X  * xscale;
        var y = Y  * yscale;

        aPositionData[i   ] = x
        aPositionData[i+2 ] = y
        aPositionData[i+1 ] = getHeight(aPositionData[i] + offsetx, aPositionData[i + 2] + offsety)

        aPositionData[i+3 ] = x
        aPositionData[i+5 ] = y+yscale
        aPositionData[i+4 ] = getHeight(aPositionData[i + 3] + offsetx, aPositionData[i + 5] + offsety)

        aPositionData[i+6 ] = x+xscale
        aPositionData[i+8 ] = y
        aPositionData[i+7 ] = getHeight(aPositionData[i + 6] + offsetx, aPositionData[i + 8] + offsety)

        triangleHeight1 = ( aPositionData[i+1 ] + aPositionData[i+4] + aPositionData[i+7 ] ) / 3;

        var normal1 = math.cross([
            aPositionData[i + 3] - aPositionData[i + 0],
            aPositionData[i + 4] - aPositionData[i + 1],
            aPositionData[i + 5] - aPositionData[i + 2]
        ],[
            aPositionData[i + 6] - aPositionData[i + 3],
            aPositionData[i + 7] - aPositionData[i + 4],
            aPositionData[i + 8] - aPositionData[i + 5]
        ]);


        aPositionData[i+ 9] = x+xscale
        aPositionData[i+11] = y
        aPositionData[i+10] = getHeight(aPositionData[i + 9] + offsetx, aPositionData[i + 11] + offsety)

        aPositionData[i+12] = x
        aPositionData[i+14] = y+yscale
        aPositionData[i+13] = getHeight(aPositionData[i + 12] + offsetx, aPositionData[i + 14] + offsety)

        aPositionData[i+15] = x+xscale
        aPositionData[i+17] = y+yscale
        aPositionData[i+16] = getHeight(aPositionData[i + 15] + offsetx, aPositionData[i + 17] + offsety)

        tirangleHeight2 = ( aPositionData[i+10] + aPositionData[i+13] + aPositionData[i+16] ) / 3;

        // console.log(((tirangleHeight2/11.875) + 1)/2);
        aTriangleHeightData[triangleHeightDataPos + 0] = ((triangleHeight1/11.875)+1)/2;
        aTriangleHeightData[triangleHeightDataPos + 1] = ((triangleHeight1/11.875)+1)/2;
        aTriangleHeightData[triangleHeightDataPos + 2] = ((triangleHeight1/11.875)+1)/2;
        aTriangleHeightData[triangleHeightDataPos + 3] = ((tirangleHeight2/11.875)+1)/2;
        aTriangleHeightData[triangleHeightDataPos + 4] = ((tirangleHeight2/11.875)+1)/2;
        aTriangleHeightData[triangleHeightDataPos + 5] = ((tirangleHeight2/11.875)+1)/2;
        triangleHeightDataPos += 6;
        //calc the second normal
        var normal2 = math.cross([
            aPositionData[i + 12] - aPositionData[i +  9],
            aPositionData[i + 13] - aPositionData[i + 10],
            aPositionData[i + 14] - aPositionData[i + 11]
        ],[
            aPositionData[i + 15] - aPositionData[i + 12],
            aPositionData[i + 16] - aPositionData[i + 13],
            aPositionData[i + 17] - aPositionData[i + 14]
        ]);

        // //fill the normal data-array with the 2 normals
        for (var ii = 0; ii < total_square_size; ii += 3) {
            if ( ii < 9 ) {
                aNormalData[ii + i + 0] = normal1[0];
                aNormalData[ii + i + 1] = normal1[1];
                aNormalData[ii + i + 2] = normal1[2];
            }
            else {
                aNormalData[ii + i + 0] = normal2[0];
                aNormalData[ii + i + 1] = normal2[1];
                aNormalData[ii + i + 2] = normal2[2];
            }
        }

    }
    // var t2 = window.performance.now();
    buffer2 = createBuffer(gl, aPositionData);
    // var t3 = window.performance.now();
    colorBuffer = createBuffer(gl, [ 0.5, 0.5, 0.5, 0, 1, 0, 1, 1, 0 ]);
    // console.log(aPositionData);
    normalBuffer = createBuffer(gl, aNormalData);

    buffer = createBuffer(gl, [
        0, 0, 2,
        0, 1, 2,
        1, 1, 2
    ]);

    // var dt1 = t2-t1;
    // var dt2 = t3-t2;
    // console.log(dt1);
    // console.log(dt2);

    vao = createVAO(gl, [
        {
            "buffer": buffer2,
            "type": gl.FLOAT,
            "size": 3
        },
        {
            "buffer": normalBuffer,
            "type": gl.FLOAT,
            "size": 3
        },
        {
            "buffer": normalBuffer,
            "type": gl.FLOAT,
            "size": 3
        },
        {
            "buffer": createBuffer(gl, aTriangleHeightData),
            "type": gl.FLOAT,
            "size": 1
        }
    ]);

    return {
        vao: vao,
        nvertices: nvertices,
        offset: [offsetx, 0.0, offsety]
    };

}

var simplexNoise    = require('../simplex-noise-med-stegu');
var simplex = new simplexNoise();

function getHeight(x ,y)
{
    max = 1;
    // var height = 1.0 * simplex.noise2D(0.00116*0.4*x, 0.00116*0.9*y);
    d = math.sqrt( x * x  +  y * y );
    el = 1 / (0.05*d + 1)
    // height = 5*el;
    var f = 0.125/4;
    var s = 3.0;
    height = s * simplex.noise2D(f*x,f*y);
    // console.log(height);

    s = s/2;
    f = f*2;
    height += s * simplex.noise2D(f*x, f*y);
    // if(height)
    // height *= (0.5*height);
    height = height > 0.5 ? height * (1.6 +  math.pow(height/4.5, 3.0))
    : height;

    for (var i = 0; i < 5; i++) {
        max += s
        s = s/2;
        f = f*2;
        height += s * simplex.noise2D(f*x, f*y);
    }
    if(height > 3)
        height *= (height/5.5);


    // var waterNoise = 0.25 * simplex.noise2D(2.0*x,2.0*y);
    // waterNoise += 0.125 * simplex.noise2D(4.0*x,4.0*y);
    // waterNoise += 0.0625 * simplex.noise2D(8.0*x,8.0*y);
    // waterNoise *= 1.0;
    // waterNoise = math.min(waterNoise, 0.0);
    // //
    // var mountainNoise = 1.0 ; //* snoise(0.002*vec2(0.4*p.x, 0.9*p.y));
    // // var snow = 0;
    // //
    // mountainNoise = height;
    // height = math.max(-0.3,height);
    // height = math.min(height, 0.5);
    // // vh = height;
    // height = height < 0.5 ? height  :  mountainNoise;// + 0.0 + mountainNoise;
    // height = height > -0.3 ? height : -1.0 + waterNoise;
    // mountainNoise = height;
    // height = math.min(height, 2.0);
    // // snow = height;
    // height = height < 2.0 ? height  : mountainNoise;
    // height *= 1.0;
    // max*=1;
    // console.log(max); //11.875
    return height;
}
// function createMesh(xoffset, yoffset) {
//     grid_res = { x: 4, y: 4 };
//     var count = grid_res.x * grid_res.y;
//     var total_square_size = 18; //3x3x2 floats for 2 triangles points
//     var size = count * total_square_size;
//
//     var aPositionData = new Float32Array(size);
//     var aColorData = new Float32Array(size);
//     var aNormalData = new Float32Array(size);
//     // var aVertex1Data  = new Float32Array(size);
//     // var aVertex2Data  = new Float32Array(size);
//     // var aVertex3Data  = new Float32Array(size);
//     xoffset = xoffset || 0;
//     yoffset = yoffset || 0;
//     //size scale
//     var xscale = 0.1;
//     var yscale = 0.1;
//
//     var i = 0;
//     for (var X = 0; X < grid_res.x; X++)
//     for (var Y = 0; Y < grid_res.y; Y++, i += total_square_size) {
//         var x = X * xscale + xoffset * xscale;
//         var y = Y * yscale + yoffset * yscale;
//
//         // Triangle 1
//         aPositionData[i   ] = x+xscale
//         aPositionData[i+1 ] = y
//         aPositionData[i+2 ] = getHeight(aPositionData[i], aPositionData[i + 1])
//         aPositionData[i+3 ] = x
//         aPositionData[i+4 ] = y
//         aPositionData[i+5 ] = getHeight(aPositionData[i + 3], aPositionData[i + 4])
//         aPositionData[i+6 ] = x
//         aPositionData[i+7 ] = y+yscale
//         aPositionData[i+8 ] = getHeight(aPositionData[i + 6], aPositionData[i + 7])
//
//         var normal1 = math.cross([
//             aPositionData[i + 3] - aPositionData[i    ],
//             aPositionData[i + 4] - aPositionData[i + 1],
//             aPositionData[i + 5] - aPositionData[i + 2]
//         ],[
//             aPositionData[i    ] - aPositionData[i + 6],
//             aPositionData[i + 1] - aPositionData[i + 7],
//             aPositionData[i + 2] - aPositionData[i + 8]
//         ]);
//
//         // Triangle 2
//         aPositionData[i+9 ] = x
//         aPositionData[i+10] = y+yscale
//         aPositionData[i+11] = getHeight(aPositionData[i + 9], aPositionData[i + 10])
//
//         aPositionData[i+12] = x+xscale
//         aPositionData[i+13] = y+yscale
//         aPositionData[i+14] = getHeight(aPositionData[i + 12], aPositionData[i + 13])
//
//         aPositionData[i+15] = x+xscale
//         aPositionData[i+16] = y
//         aPositionData[i+17] = getHeight(aPositionData[i + 15], aPositionData[i + 16])
//
//         //calc the second normal
//         var normal2 = math.cross([
//             aPositionData[i + 12] - aPositionData[i    9],
//             aPositionData[i + 13] - aPositionData[i + 10],
//             aPositionData[i + 14] - aPositionData[i + 11]
//         ],[
//             aPositionData[i    9] - aPositionData[i + 15],
//             aPositionData[i + 10] - aPositionData[i + 16],
//             aPositionData[i + 11] - aPositionData[i + 17]
//         ]);
//
//         //fill the normal data-array with the 2 normals
//         for (var i = 0; i < total_square_size; i += 3) {
//             if ( i < 9 ) {
//                 aNormalData[i    ] = normal1[0];
//                 aNormalData[i + 1] = normal1[1];
//                 aNormalData[i + 2] = normal1[2];
//             }
//             else {
//                 aNormalData[i    ] = normal2[0];
//                 aNormalData[i + 1] = normal2[1];
//                 aNormalData[i + 2] = normal2[2];
//             }
//         }
//
//         var color1 = [ 0.9 , 0.5, 0.5 ];
//         var color2 = [ 0.5 , 0.5, 0.9 ];
//
//         for (var i = 0; i < total_square_size; i += 3) {
//             if ( i < 9 ) {
//                 aColorData[i    ] = color1[0];
//                 aColorData[i + 1] = color1[1];
//                 aColorData[i + 2] = color1[2];
//             }
//             else {
//                 aColorData[i    ] = color2[0];
//                 aColorData[i + 1] = color2[1];
//                 aColorData[i + 2] = color2[2];
//             }
//         }
//
//
//         // aVertex1Data[i   ] = x+xscale
//         // aVertex1Data[i+1 ] = y
//         // aVertex1Data[i+2 ] = x+xscale
//         // aVertex1Data[i+3 ] = y
//         // aVertex1Data[i+4 ] = x+xscale
//         // aVertex1Data[i+5 ] = y
//         // aVertex1Data[i+6 ] = x
//         // aVertex1Data[i+7 ] = y+yscale
//         // aVertex1Data[i+8 ] = x
//         // aVertex1Data[i+9 ] = y+yscale
//         // aVertex1Data[i+10] = x
//         // aVertex1Data[i+11] = y+yscale
//         //
//         // aVertex2Data[i   ] = x
//         // aVertex2Data[i+1 ] = y
//         // aVertex2Data[i+2 ] = x
//         // aVertex2Data[i+3 ] = y
//         // aVertex2Data[i+4 ] = x
//         // aVertex2Data[i+5 ] = y
//         // aVertex2Data[i+6 ] = x+xscale
//         // aVertex2Data[i+7 ] = y+yscale
//         // aVertex2Data[i+8 ] = x+xscale
//         // aVertex2Data[i+9 ] = y+yscale
//         // aVertex2Data[i+10] = x+xscale
//         // aVertex2Data[i+11] = y+yscale
//         //
//         // aVertex3Data[i   ] = x
//         // aVertex3Data[i+1 ] = y+yscale
//         // aVertex3Data[i+2 ] = x
//         // aVertex3Data[i+3 ] = y+yscale
//         // aVertex3Data[i+4 ] = x
//         // aVertex3Data[i+5 ] = y+yscale
//         // aVertex3Data[i+6 ] = x+xscale
//         // aVertex3Data[i+7 ] = y
//         // aVertex3Data[i+8 ] = x+xscale
//         // aVertex3Data[i+9 ] = y
//         // aVertex3Data[i+10] = x+xscale
//         // aVertex3Data[i+11] = y
//     }
//
//     var attributes;
//     var vao = createVAO(gl,[
//         createAttribute(aPositionData),
//         createAttribute(aColorData),
//         createAttribute(aNormalData)
//     ]);
//     return vao;
//     // return { vao: vao, length: size / 2 };
// }
// function createAttribute(data) {
//     return {
//         "buffer": createBuffer(gl, data),
//         "type": gl.FLOAT,
//         "size": 3
//     };
// }
// function getHeight(x, y){
//     //calculate height for world w noise
//     return 1.0;
// }
// This is fugly as hell. I simply cut, pasted, and wrapped it with
// a simple interface. Sorry! -wwwtyro
// https://github.com/wwwtyro/perlin.js
// PerlinNoise = new function() {
//
// this.noise = function(x, y, z) {
//
//    var p = new Array(512)
//    var permutation = [ 151,160,137,91,90,15,
//    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
//    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
//    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
//    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
//    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
//    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
//    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
//    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
//    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
//    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
//    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
//    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
//    ];
//    for (var i=0; i < 256 ; i++)
//  p[256+i] = p[i] = permutation[i];
//
//       var X = Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
//           Y = Math.floor(y) & 255,                  // CONTAINS POINT.
//           Z = Math.floor(z) & 255;
//       x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
//       y -= Math.floor(y);                                // OF POINT IN CUBE.
//       z -= Math.floor(z);
//       var    u = fade(x),                                // COMPUTE FADE CURVES
//              v = fade(y),                                // FOR EACH OF X,Y,Z.
//              w = fade(z);
//       var A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
//           B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,
//
//       return scale(lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
//                                      grad(p[BA  ], x-1, y  , z   )), // BLENDED
//                              lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
//                                      grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
//                      lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
//                                      grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
//                              lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
//                                      grad(p[BB+1], x-1, y-1, z-1 )))));
//    }
//    function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
//    function lerp( t, a, b) { return a + t * (b - a); }
//    function grad(hash, x, y, z) {
//       var h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
//       var u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
//              v = h<4 ? y : h==12||h==14 ? x : z;
//       return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
//    }
//    function scale(n) { return (1 + n)/2; }
// }
