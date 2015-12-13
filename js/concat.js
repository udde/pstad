var math = require('mathjs');

GLOBAL_DATA = {
    mapWidth: 64,
    nPatchesPerSide: 1,
    patchWidth: mapWidth/nPatchesPerSide,
    poolSize: 32768,
    // Scale of the terrain ie: 1 unit of the height map == how many world units (meters)?
    // 1.0f == 1 meter resolution
    // 0.5f == 1/2 meter resolution
    // 0.25f == 1/4 meter resolution
    scale: 0.5,
    //depth of vaiance: tree should be close to sqrt(patchWidth)+1
    varianceDepth: 9,
    //beginnig fram variance, should be high
    frameVariance: 50,
    desiredTriangleTessellations: 10000,
    nTrianglesRendered: 0,

}




var TriTreeNode = function ()
{
    this.leftChild    = NULL;
    this.rightChild   = NULL;
    this.baseNeighbor = NULL;
    this.leftNeighbor = NULL;
    this.baseNeighbor = NULL;
}

var Patch = function( camera )
{
    this.camera = camera;

    this.varianceTreeLeft  = new Uint8Array(1<<(GLOBAL_DATA.varianceDepth));
    this.varianceTreeRight = new Uint8Array(1<<(GLOBAL_DATA.varianceDepth));
}

Patch.prototype.init = function( offsetX, offsetY, worldX, worldY, heightMap)
{
    //clear all relationship

    this.baseLeft  = new TriTreeNode();
    this.baseRight = new TriTreeNode();

    //attach bases
    this.baseLeft.baseNeighbor  = this.baseRight;
    this.baseRight.baseNeighbor = this.baseLeft;

    //store patch offsets for world and height map
    this.worldX = worldX;
    this.worldY = worldY;
    // heightX = heightX
    // heightY = heightY
    this.localHeightStartIdx = offsetY * GLOBAL_DATA.mapWidth + offsetX;
    this.heightMap = heightMap;

    this.isVisible = false;
    this.isVarianceDirty = true;

    // Which varience we are currently using.
    // [Only valid during the Tessellate and ComputeVariance passes]
    this.currentVariance = NULL;
}

Patch.prototype.reset = function()
{
    this.isVisible = false;

    this.baseLeft.leftChild = NULL;
    this.baseLeft.rightChild = NULL;
    this.baseRight.leftChild = NULL;
    this.baseRight.rightChild = NULL;

    this.baseLeft.baseNeighbor = this.baseRight;
    this.baseRight.baseNeighbor = this.baseLeft;

    this.baseLeft.leftNeighbor = NULL;
    this.baseLeft.rightNeighbor = NULL;
    this.baseRight.leftNeighbor = NULL;
    this.baseRight.rightNeighbor = NULL;

}

Patch.prototype.computeVariance = function()
{
    var leftX = 0;
    var leftY = GLOBAL_DATA.patchWidth;
    var leftZ = this.heightMap[this.localHeightStartIdx + GLOBAL_DATA.patchWidth * GLOBAL_DATA.mapWidth];

    var rightX = GLOBAL_DATA.patchWidth ;
    var rightY = 0;
    var rightZ = this.heightMap[this.localHeightStartIdx + GLOBAL_DATA.patchWidth];

    var apexX = 0;
    var apexY = 0;
    var apexZ = this.heightMap[this.localHeightStartIdx];

    var node = 1;

    this.currentVariance = this.varianceTreeLeft;
    this.recursiveComputeVariance( leftX, leftY, leftZ,  rightX, rightY, rightZ,  apexX, apexY, apexZ,  node);

    leftX = GLOBAL_DATA.patchWidth ;
    leftY = 0;
    leftZ = this.heightMap[this.localHeightStartIdx + GLOBAL_DATA.patchWidth];

    rightX = 0;
    rightY = GLOBAL_DATA.patchWidth;
    rightZ = this.heightMap[this.localHeightStartIdx + GLOBAL_DATA.patchWidth * GLOBAL_DATA.mapWidth];

    apexX = GLOBAL_DATA.patchWidth;
    apexY = GLOBAL_DATA.patchWidth;
    apexZ = this.heightMap[this.localHeightStartIdx + (GLOBAL_DATA.patchWidth * GLOBAL_DATA.mapWidth) + GLOBAL_DATA.patchWidth ];

    node = 1;

    this.currentVariance = this.varianceTreeRight;
    this.recursiveComputeVariance( leftX, leftY, leftZ,  rightX, rightY, rightZ,  apexX, apexY, apexZ,  node);

    this.isVarianceDirty = 0;
}

//        /|\
//      /  |  \
//    /    |    \
//  /      |      \
//  ~~~~~~~*~~~~~~~  <-- Compute the X and Y coordinates of '*'
Patch.prototype.recursiveComputeVariance = function(leftX, leftY, leftZ, rightX, rightY, rightZ, apexX, apexY, apexZ, node)
{
    var centerX = (leftX + rightX)>>1;
    var centerY = (leftY + rightY)>>1;

    var centerZ = this.heightMap[this.localHeightStartIdx + centerY * GLOBAL_DATA.mapWidth + centerX];

    // Variance of this triangle is the actual height at it's hypotenuse midpoint minus the interpolated height.
	// Use values passed on the stack instead of re-accessing the Height Field.
    var variance = math.abs(math.floor(centerZ) - ((math.floor(leftZ) + math.floor(rightZ)) >> 1));

    // Since we're after speed and not perfect representations,
	//    only calculate variance down to an 8x8 block
    if(math.abs(leftX - rightX) >= 8 || math.abs(leftY - rightY) >= 8)
    {
        //final variance for the node is max of its own varianc and of its children
        variance = math.max(variance, this.recursiveComputeVariance(apexX, apexY, apexZ, leftX, leftY, leftZ, centerX, centerY, centerZ, node<<1));
        variance = math.max(variance, this.recursiveComputeVariance(rightX, rightY, rightZ, apexX, apexY, apexZ, centerX, centerY, centerZ, 1+(node<<1)));

        if(node < (1<<GLOBAL_DATA.varianceDepth))
        {
            this.currentVariance[node] = 1 + variance;
        }

        return variance;
    }
}

Patch.prototype.tessellate = function()
{
    this.currentVariance = this.varianceTreeLeft;
    this.recursiveTessellate();
}

Patch.prototype.recursiveTessellate = function( tri, leftX, leftY, rightX, rightY, apexX, apexY, node )
{
    var triVariance = 0;
    var centerX = (leftX + rightX) >> 1 ;
    var centerY = (leftY + rightY) >> 1 ;

    if(node < (1<<GLOBAL.varianceDepth))
    {
        //Obs only 2d. for now...
        var distance = 1.0 + math.sqrt( math.pow(centerX - this.camera.pos.x, 2) + math.pow(centerY - this.camera.pos.z, 2) ) ;

        //just a simple formula, not anchor in physics
        triVariance = (this.currentVariance[node] * GLOBAL_DATA.mapWidth * 2) / distance;
    }
    //if there is no variance info in this node we have gotten here by spliting so continue down to the lowest level
    //OR if we are not below the variance tree
    if(node >= (1<<GLOBAL.varianceDepth) || triVariance > GLOBAL_DATA.frameVariance )
    {
        // split this mother fucker
        this.split(tri);

        //if tri was split, try split its children again. Tessellate all the way down to one vertex per hightfield entry
        // UNSURE varför dist just >= 3???
        if(tri.leftChild != NULL && ( math.abs(leftX - rightX) >= 3 || math.abs(leftY - rightY) >= 3  ))
        {
            this.recursiveTessellate( tri.leftChild,   apexX,  apexY, leftX, leftY, centerX, centerY,    node<<1  );
            this.recursiveTessellate( tri.rightChild, rightX, rightY, apexX, apexY, centerX, centerY, 1+(node<<1) );
        }
    }
}

Patch.prototype.split = function(tri)
{
    //allready split, no need to do it again
    if(tri.leftChild != NULL)
    {
        return;
    }

    //if this triangle is not a proper diamond, force split our base neighbor
    if(tri.baseNeighbor != NULL && tri.baseNeighbor.baseNeighbor != tri)
    {
        this.split(tri.baseNeighbor);
    }

    //create children and link into mesh
    tri.leftChild = Landscape.allocateTri();
    tri.rightChild = Landscape.allocateTri();

    if(tri.leftChild = NULL)
    {
        return;
    }

    //fill in the information we can get form the parent (neighbor pointers)
    tri.leftChild.baseNeighbor = tri.leftNeighbor;
    tri.leftChild.leftNeighbor = tri.rightChild;

    tri.rightChild.baseNeighbor = tri.leftNeighbor;
    tri.rightChild.rightNeighbor = tri.leftChild;

    //link our left neigbhor to the new childre
    if(tri.leftNeighbor != NULL)
    {
        if(tri.leftNeighbor.baseNeighbor == tri)
        {
            tri.leftNeighbor.baseNeighbor = tri.leftChild;
        }
        else if(tri.leftNeighbor.leftNeighbor == tri)
        {
            tri.leftNeighbor.leftNeighbor = tri.leftChild;
        }
        else if(tri.leftNeighbor.rightNeighbor == tri)
        {
            tri.leftNeighbor.rightNeighbor = tri.leftChild;
        }
        else {
            ;
        }
    }
    if(tri.rightNeighbor != NULL)
    {
        if(tri.rightNeighbor.baseNeighbor == tri)
        {
            tri.rightNeighbor.baseNeighbor = tri.rightChild;
        }
        else if(tri.rightNeighbor.leftNeighbor == tri)
        {
            tri.rightNeighbor.leftNeighbor = tri.rightChild;
        }
        else if(tri.rightNeighbor.rightNeighbor == tri)
        {
            tri.rightNeighbor.rightNeighbor = tri.rightChild;
        }
        else {
            ;
        }
    }
    // Link our Base Neighbor to the new children
    if (tri.baseNeighbor != NULL)
    {
        if ( tri.baseNeighbor.leftChild != NULL)
        {
            tri.baseNeighbor.leftChild.rightNeighbor = tri.rightChild;
            tri.baseNeighbor.rightChild.leftNeighbor = tri.leftChild;
            tri.leftChild.rightNeighbor = tri.baseNeighbor.rightChild;
            tri.rightChild.leftNeighbor = tri.baseNeighbor.leftChild;
        }
        else
            this.split( tri.baseNeighbor);  // Base Neighbor (in a diamond with us) was not split yet, so do that now.
    }
    else
    {
        // An edge triangle, trivial case.
        tri.leftChild.rightNeighbor = NULL;
        tri.rightChild.leftNeighbor = NULL;
    }
}

//TODO new names
Patch.prototype.render = function()
{
    var data = { positions: [], normals: [] };

    this.recursiveRender(this.baseLeft,
                        0, GLOBAL_DATA.patchWidth,
                        GLOBAL_DATA.patchWidth, 0,
                        0, 0 );

    this.recursiveRender(this.baseRight,
                        GLOBAL_DATA.patchWidth, 0,
                        0, GLOBAL_DATA.patchWidth,
                        GLOBAL_DATA.patchWidth, GLOBAL_DATA.patchWidth );
    return data;
}

Patch.prototype.recursiveRender = function(tri, leftX, leftY, rightX, rightY, apexX, apexY, triangleData)
{
    //all nonleaf nodes have both children, so just check for one...
    if(tri.leftChild != NULL)
    {
        var centerX = (leftX + leftX)>>1;
        var centerY = (leftY + leftY)>>1;

        this.recursiveRender(tri.leftChild, apexX, apexY, leftX, leftY, centerX, centerY, triangeData);
        this.recursiveRender(tri.rightChild, rightX, rightY, apexX, apexY, centerX, centerY, triangeData);
    }
    else
    {
        GLOBAL_DATA.nTrianglesRendered++;

        var leftZ  = m_HeightMap[this.localHeightStartIdx + (leftY *GLOBAL_DATA.mapWidth)+leftX ];
        var rightZ = m_HeightMap[this.localHeightStartIdx + (rightY*GLOBAL_DATA.mapWidth)+rightX];
        var apexZ  = m_HeightMap[this.localHeightStartIdx + (apexY *GLOBAL_DATA.mapWidth)+apexX ];

        triangeData.positions.push(leftX);
        triangeData.positions.push(leftZ);
        triangeData.positions.push(leftY);

        triangeData.positions.push(rightX);
        triangeData.positions.push(rightZ);
        triangeData.positions.push(rightY);

        triangeData.positions.push(apexX);
        triangeData.positions.push(apexZ);
        triangeData.positions.push(apexY);

        var normal = math.cross([
            rightX - leftX,
            rightZ - leftZ,
            rightY - leftY
        ],[
            apexX - rightX,
            apexZ - rightZ,
            apexY - rightY
        ]);

        triangleData.normals.push( normal[0] );
        triangleData.normals.push( normal[1] );
        triangleData.normals.push( normal[3] );

        triangleData.normals.push( normal[0] );
        triangleData.normals.push( normal[1] );
        triangleData.normals.push( normal[3] );

        triangleData.normals.push( normal[0] );
        triangleData.normals.push( normal[1] );
        triangleData.normals.push( normal[3] );
    }

}

//LANDSCAPE
var Landscape = function()
{


}

Landscape.prototype.allocateTri()
{

}


function loadShaders(gl){

    var crateShader = require('gl-shader');

    var shaders = {};

    // shaders.test = crateShader(
    //     gl,
    //     require('./shader.vert')(),
    //     require('./shader.frag')()
    // );

    shaders.ground = crateShader(
        gl,
        require('../shaders/ground.vert')(),
        require('../shaders/ground.frag')()
    );

    return shaders;
}

var createGL    = require('gl-now'),
createShader    = require('gl-shader'),
createBuffer    = require("gl-buffer"),
createVAO       = require("gl-vao"),
clearGL         = require('gl-clear'),
mat4            = require('gl-mat4'),
vec3            = require('gl-vec3');
// createCamera    = require('orbit-camera');

var shell = createGL({

});

var clear = clearGL({
    color: [0.8, 0.9, 0.9, 1],
});

var meshes, ground, groundShader, cam, eye, target, up, camUp, camRight, camToTarget;
var nBlocks, nLevels, blocks, levels = [0,0,0,0];

shell.on('gl-init', function() {
    var gl = shell.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //camshit
    cam = mat4.create()
    eye = vec3.create()
    vec3.set(eye, 0, 10, 10);
    target = vec3.create()
    vec3.set(target, 0, 0, 0);
    up = vec3.create()
    vec3.set(up, 0, 1, 0);
    // camToTarget = vec3.create();
    // vec3.subtract(camToTarget, target, eye);
    // camRight = vec3.create();
    // vec3.cross(camRight, camToTarget, up );
    // camUp = vec3.create();
    // vec3.cross(camUp, camRight, camToTarget);

    mat4.lookAt(cam, eye, target, up)
    console.log(cam);
    // shader = createShader(gl,vs(),fs());
    // shaders = require('./shaders/shaders.js')(gl);
    shaders = loadShaders(gl);
    groundShader = shaders.ground;

    ground = require('./terrainDataGenerator.js')(gl);
    nLevels = ground.nLevels;
    nBlocks = ground.nBlocks;
    ground.skriv();

    groundShader.attributes.aPosition.location = 0;
    groundShader.attributes.aColor.location = 1;
    groundShader.attributes.aNormal.location = 2;
    groundShader.attributes.aTriangleHeight.location = 3;

});

shell.on('gl-render', function(t) {
    var gl = shell.gl;
    clear(gl);

    //draw the ground
    groundShader.bind();
    groundShader.uniforms.t += 0.01;
    groundShader.uniforms.uCameraPos = eye;


    mat4.lookAt(cam, eye, target, up)

    var scratch = mat4.create()
    groundShader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0)
    groundShader.uniforms.view = cam
    var model = mat4.create(), unityM = mat4.create();

    for (var j = 0; j < nBlocks; j++) {
        var i = j + 4*levels[j];

        // i = level * 4 + 2*y + x
        mat4.translate(model, unityM, vec3.fromValues(ground.blocks[i].offset[0],ground.blocks[i].offset[1],ground.blocks[i].offset[2]) );
        groundShader.uniforms.model = model;
        ground.blocks[i].vao.bind();
        ground.blocks[i].vao.draw(gl.TRIANGLES, ground.blocks[i].nVertices);
        ground.blocks[i].vao.unbind();
    }

});

shell.on("tick", function() {
    if(shell.wasDown("W")) {
        vec3.add(eye, vec3.fromValues(0.0,0.0,-1.0), eye);
        vec3.add(target, vec3.fromValues(0.0,0.0,-1.0), target);
        // mat4.lookAt(cam, eye, target, up)
        // mat4.translate(cam, cam , vec3.fromValues(0.0,0.0,1.0));
    }
    if(shell.wasDown("S")) {
        vec3.add(eye, vec3.fromValues(0.0,0.0,1.0), eye);
        vec3.add(target, vec3.fromValues(0.0,0.0,1.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(0.0,0.0,-1.0));
    }
    if(shell.wasDown("A")) {
        vec3.add(eye, vec3.fromValues(-1.0,0.0,0.0), eye);
        vec3.add(target, vec3.fromValues(-1.0,0.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(1.0,0.0,0.0));
    }
    if(shell.wasDown("D")) {
        vec3.add(eye, vec3.fromValues(1.0,0.0,0.0), eye);
        vec3.add(target, vec3.fromValues(1.0,0.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(-1.0,0.0,0.0));
    }
    if(shell.wasDown("Z")) {
        vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        vec3.add(target, vec3.fromValues(0.0,-1.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(0.0,1.0,0.0));
    }
    if(shell.wasDown("X")) {
        vec3.add(eye, vec3.fromValues(0.0,1.0,0.0), eye);
        vec3.add(target, vec3.fromValues(0.0,1.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(0.0,-1.0,0.0));
    }
    if(shell.wasDown("I")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, 0.1, vec3.fromValues(1.0, 0.0, 0.0));
        // vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        // vec3.rotateY(target, target, up, 0.1);
    }
    if(shell.wasDown("K")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, -0.1, vec3.fromValues(1.0, 0.0, 0.0));
        // vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        // vec3.rotateY(target, target, up, 0.3);
    }
    if(shell.wasDown("J")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, -0.1, vec3.fromValues(0.0, 1.0, 0.0));
    }
    if(shell.wasDown("L")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, 0.1, vec3.fromValues(0.0, 1.0, 0.0));
    }
    if(shell.wasDown("mouse-right")) {
        // cam.pan([10*(shell.mouseX-shell.prevMouseX)/shell.width,
        // 10*(shell.mouseY - shell.prevMouseY)/shell.height])
    }
    if(shell.scroll[1]) {
        // cam.zoom(shell.scroll[1] * 0.1)
    }
});
