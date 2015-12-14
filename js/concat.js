//struct-like class for trinodes
var TriTreeNode = function ()
{
    this.leftChild    = null;
    this.rightChild   = null;
    this.baseNeighbor = null;
    this.leftNeighbor = null;
    this.baseNeighbor = null;
}

var NodeMemoryHandler = function(poolSize)
{
    this.poolSize = poolSize;
    this.nextTriNode = null;
    this.nodePool = [];
    for (var i = 0; i < this.poolSize; i++)
        this.nodePool[i] = new TriTreeNode();
}

NodeMemoryHandler.prototype.claimNextFreeNode = function()
{
    //check if run out of nodes
    if(this.nextTriNode >= this.poolSize)
        return null;

    var node = this.nodePool[this.nextTriNode++];
    node.leftChild = null;
    node.rightChild = null;

    return node;
}

var math = require('mathjs');




var Patch = function( heightMap, mapConsts ,offsetX, offsetY, worldX, worldY, camera, memHandler )
{
    this.mapConsts = mapConsts;
    //clear all relationship
    this.baseLeft  = new TriTreeNode();
    this.baseRight = new TriTreeNode();

    //attach bases
    this.baseLeft.baseNeighbor  = this.baseRight;
    this.baseRight.baseNeighbor = this.baseLeft;

    //store patch offsets for world and height map
    this.worldX = worldX;
    this.worldY = worldY;

    this.localHeightStartIdx = offsetY * this.mapConsts.mapWidth + offsetX;
    this.patchWidth = this.mapConsts.mapWidth/this.mapConsts.nPatchesPerSide;
    this.heightMap = heightMap;

    this.isVisible = true;
    this.isVarianceDirty = true;

    // Which varience we are currently using.
    // [Only valid during the Tessellate and ComputeVariance passes]
    this.currentVariance = null;

    this.camera = camera;
    this.memHandler = memHandler;
    this.varianceTreeLeft  = new Uint8Array(1<<(this.mapConsts.varianceDepth)); //fills w 0s
    this.varianceTreeRight = new Uint8Array(1<<(this.mapConsts.varianceDepth));
}

Patch.prototype.coord2Index = function (x,y) {
    return this.localHeightStartIdx + y * this.mapConsts.mapWidth + x;

};
Patch.prototype.reset = function()
{
    //this.isVisible = false;

    this.baseLeft.leftChild = null;
    this.baseLeft.rightChild = null;
    this.baseRight.leftChild = null;
    this.baseRight.rightChild = null;

    this.baseLeft.baseNeighbor = this.baseRight;
    this.baseRight.baseNeighbor = this.baseLeft;

    this.baseLeft.leftNeighbor = null;
    this.baseLeft.rightNeighbor = null;
    this.baseRight.leftNeighbor = null;
    this.baseRight.rightNeighbor = null;

}

Patch.prototype.computeVariance = function()
{

    var leftX = 0;
    var leftY = this.patchWidth-1;
    var leftZ = this.heightMap[this.localHeightStartIdx + (this.patchWidth-1) * this.mapConsts.mapWidth];

    var rightX = this.patchWidth-1 ;
    var rightY = 0;
    var rightZ = this.heightMap[this.localHeightStartIdx + (this.patchWidth-1)];

    var apexX = 0;
    var apexY = 0;
    var apexZ = this.heightMap[this.localHeightStartIdx];

    var node = 1;

    this.currentVariance = this.varianceTreeLeft;

    this.recursiveComputeVariance( leftX, leftY, leftZ,  rightX, rightY, rightZ,  apexX, apexY, apexZ,  node);

    leftX = this.patchWidth-1 ;
    leftY = 0;
    leftZ = this.heightMap[this.localHeightStartIdx + this.patchWidth-1];

    rightX = 0;
    rightY = this.patchWidth-1;
    rightZ = this.heightMap[this.localHeightStartIdx + (this.patchWidth-1) * this.mapConsts.mapWidth];

    apexX = this.patchWidth-1;
    apexY = this.patchWidth-1;
    apexZ = this.heightMap[this.localHeightStartIdx + ((this.patchWidth-1) * this.mapConsts.mapWidth) + this.patchWidth-1 ];

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
    //just for debug
    var leftId = this.coord2Index(leftX,leftY);
    var rightId = this.coord2Index(rightX,rightY);
    var apexId = this.coord2Index(apexX,apexY);

    var centerX = (leftX + rightX)>>1;
    var centerY = (leftY + rightY)>>1;
    var centerHeightMapIndex = this.coord2Index(centerX,centerY);


    var centerZ = this.heightMap[centerHeightMapIndex];

    // Variance of this triangle is the actual height at it's hypotenuse midpoint minus the interpolated height.
    // Use values passed on the stack instead of re-accessing the Height Field.
    var variance = math.abs(math.floor(centerZ) - ((math.floor(leftZ) + math.floor(rightZ)) >> 1));
    debugger;
    // Since we're after speed and not perfect representations,
    //    only calculate variance down to an 8x8 block
    if(math.abs(leftX - rightX) >= 2 || math.abs(leftY - rightY) >= 2)
    {

        //final variance for the node is max of its own varianc and of its children
        variance = math.max(variance, this.recursiveComputeVariance(apexX, apexY, apexZ, leftX, leftY, leftZ, centerX, centerY, centerZ, node<<1));
        variance = math.max(variance, this.recursiveComputeVariance(rightX, rightY, rightZ, apexX, apexY, apexZ, centerX, centerY, centerZ, 1+(node<<1)));
    }

    if(node < (1<<this.mapConsts.varianceDepth))
    {
        this.currentVariance[node] = 1 + variance;
    }
    //recursive, not used for the last call
    return variance;
}

Patch.prototype.tessellate = function()
{
    this.currentVariance = this.varianceTreeLeft;
    this.recursiveTessellate(this.baseLeft,
                            this.worldX, this.worldY + this.patchWidth-1,
                            this.worldX + this.patchWidth-1, this.worldY,
                            this.worldX, this.worldY,
                            1);
    this.currentVariance = this.varianceTreeRight;
    this.recursiveTessellate(this.baseRight,
                            this.worldX + this.patchWidth-1, this.worldY,
                            this.worldX, this.worldY + this.patchWidth-1,
                            this.worldX + this.patchWidth-1, this.worldY + this.patchWidth-1,
                            1);
}

Patch.prototype.recursiveTessellate = function( tri, leftX, leftY, rightX, rightY, apexX, apexY, node )
{
    var centerX = (leftX + rightX) >> 1 ;
    var centerY = (leftY + rightY) >> 1 ;

    if(node < (1<<this.mapConsts.varianceDepth))
    {
        //Obs only 2d. for now...
        var distance = 1.0 + math.sqrt( math.pow(centerX - this.camera.pos[0], 2) + math.pow(centerY - this.camera.pos[2], 2) ) ;

        //just a simple formula, not anchor in physics
        triVariance = (this.currentVariance[node] * this.mapConsts.mapWidth * 2) / distance;
    }
    //if there is no variance info in this node we have gotten here by spliting so continue down to the lowest level
    //OR if we are not below the variance tree
    if(node >= (1<<this.mapConsts.varianceDepth) || triVariance > this.mapConsts.frameVariance )
    {
        // split this mother fucker
        this.split(tri);

        //if tri was split, try split its children again. Tessellate all the way down to one vertex per hightfield entry
        // UNSURE varför dist just >= 3???
        if(tri.leftChild != null && ( math.abs(leftX - rightX) >= 3 || math.abs(leftY - rightY) >= 3  ))
        {
            this.recursiveTessellate( tri.leftChild,   apexX,  apexY, leftX, leftY, centerX, centerY,    node<<1  );
            this.recursiveTessellate( tri.rightChild, rightX, rightY, apexX, apexY, centerX, centerY, 1+(node<<1) );
        }
    }
}

Patch.prototype.split = function(tri)
{
    //allready split, no need to do it again
    if(tri.leftChild != null)
    {
        return;
    }

    //if this triangle is not a proper diamond, force split our base neighbor
    if(tri.baseNeighbor != null && tri.baseNeighbor.baseNeighbor != tri)
    {
        this.split(tri.baseNeighbor);
    }

    //create children and link into mesh
    tri.leftChild = this.memHandler.claimNextFreeNode();
    tri.rightChild = this.memHandler.claimNextFreeNode();

    //check if we´re out of memory
    if(tri.leftChild == null)
    {
        return;
    }

    //fill in the information we can get form the parent (neighbor pointers)
    tri.leftChild.baseNeighbor = tri.leftNeighbor;
    tri.leftChild.leftNeighbor = tri.rightChild;

    tri.rightChild.baseNeighbor = tri.leftNeighbor;
    tri.rightChild.rightNeighbor = tri.leftChild;

    //link our left neigbhor to the new childre
    if(tri.leftNeighbor != null)
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
    if(tri.rightNeighbor != null)
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
    if (tri.baseNeighbor != null)
    {
        if ( tri.baseNeighbor.leftChild != null)
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
        tri.leftChild.rightNeighbor = null;
        tri.rightChild.leftNeighbor = null;
    }
}

//TODO new names
Patch.prototype.render = function()
{
    var data = { positions: [], normals: [] };

    this.recursiveRender(this.baseLeft,
        0, this.patchWidth-1,
        this.patchWidth-1, 0,
        0, 0,
        data);

    this.recursiveRender(this.baseRight,
        this.patchWidth-1, 0,
        0, this.patchWidth-1,
        this.patchWidth-1, this.patchWidth-1,
        data);
    return data;
}

Patch.prototype.recursiveRender = function(tri, leftX, leftY, rightX, rightY, apexX, apexY, triangleData)
{
    //all nonleaf nodes have both children, so just check for one...
    if(tri.leftChild != null)
    {
        var centerX = (leftX + rightX)>>1;
        var centerY = (leftY + rightY)>>1;

        this.recursiveRender(tri.leftChild, apexX, apexY, leftX, leftY, centerX, centerY, triangleData);
        this.recursiveRender(tri.rightChild, rightX, rightY, apexX, apexY, centerX, centerY, triangleData);
    }
    else
    {
        this.mapConsts.nTrianglesRendered++;

        var leftZ  = this.heightMap[this.localHeightStartIdx + (leftY *this.mapConsts.mapWidth)+leftX ];
        var rightZ = this.heightMap[this.localHeightStartIdx + (rightY*this.mapConsts.mapWidth)+rightX];
        var apexZ  = this.heightMap[this.localHeightStartIdx + (apexY *this.mapConsts.mapWidth)+apexX ];

        triangleData.positions.push(leftX);
        triangleData.positions.push(leftZ);
        triangleData.positions.push(leftY);

        triangleData.positions.push(rightX);
        triangleData.positions.push(rightZ);
        triangleData.positions.push(rightY);

        triangleData.positions.push(apexX);
        triangleData.positions.push(apexZ);
        triangleData.positions.push(apexY);

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
        triangleData.normals.push( normal[2] );

        triangleData.normals.push( normal[0] );
        triangleData.normals.push( normal[1] );
        triangleData.normals.push( normal[2] );

        triangleData.normals.push( normal[0] );
        triangleData.normals.push( normal[1] );
        triangleData.normals.push( normal[2] );
    }

}

//LANDSCAPE
var Landscape = function(heightMap, mapWidth, nPatchesPerSide, scale, camera, worldPosition )
{
    //Constants
    this.mapConsts = {};
    this.mapConsts.mapWidth = mapWidth;
    this.mapConsts.nPatchesPerSide = nPatchesPerSide;
    this.mapConsts.patchWidth = mapWidth/nPatchesPerSide;
    this.mapConsts.scale = scale;

    //hardcoded
    //depth of vaiance: tree should be close to sqrt(patchWidth)+1
    this.mapConsts.varianceDepth = 9;
    //beginnig fram variance, should be high
    this.mapConsts.frameVariance = 10;
    this.mapConsts.desiredTriangleTessellations = 10000;
    this.mapConsts.nTrianglesRendered = 0;

    //instance variables
    this.heightMap = heightMap;
    this.camera = camera;
    this.worldPosition = worldPosition;
    this.patches = new Array(this.nPatchesPerSide);

    this.memHandler = new NodeMemoryHandler(32768)

    //create the patches in a 2d array
    this.createPatches();


}

Landscape.prototype.createPatches = function()
{

    for(var y = 0; y < this.mapConsts.nPatchesPerSide ; y++)
    {
        this.patches[y] = new Array(this.nPatchesPerSide);
        for(var x = 0; x < this.mapConsts.nPatchesPerSide ; x++)
        {

            this.patches[y][x] = new Patch(this.heightMap, this.mapConsts, x*this.mapConsts.patchWidth,
            y*this.mapConsts.patchWidth, this.worldPosition.x, this.worldPosition.z, this.camera,this.memHandler );
            this.patches[y][x].computeVariance();
        }
    }
}


Landscape.prototype.tessellate = function()
{
    //loop through all patches and call their tessellate method
    for(var y = 0; y < this.mapConsts.nPatchesPerSide; y++)
    for(var x = 0; x < this.mapConsts.nPatchesPerSide; x++)
    {
        if(this.patches[y][x].isVisible)
        {
            this.patches[y][x].tessellate();
        }
    }
}

Landscape.prototype.generateTriangleData = function()
{
    var totalData = { positions: [], normals: [] };

    for(var y = 0; y < this.mapConsts.nPatchesPerSide; y++)
    for(var x = 0; x < this.mapConsts.nPatchesPerSide; x++)
    {
        currentPatch = this.patches[y][x];
        if(currentPatch.isVisible)
        {

            var patchData = currentPatch.render();

            totalData.positions = totalData.positions.concat(patchData.positions);
            totalData.normals = totalData.normals.concat(patchData.normals);
        }
    }
    return totalData;
}

Landscape.prototype.reset = function()
{
    this.nextTriNode = 0;
    this.nTrianglesRendered = 0;
    for(var y = 0; y < this.mapConsts.nPatchesPerSide; y++)
    for(var x = 0; x < this.mapConsts.nPatchesPerSide; x++)
    {
        currentPatch = this.patches[y][x];
        currentPatch.reset();

        if(currentPatch.isVisible)
        {
            //TODO

        }
    }
}


function loadShaders(gl){

    var crateShader = require('gl-shader');

    var shaders = {};

    shaders.test = crateShader(
        gl,
        require('../shaders/shader.vert')(),
        require('../shaders/shader.frag')()
    );

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

var createAxes = require("gl-axes");
var camera = require("game-shell-orbit-camera")(shell)

var clear = clearGL({
    color: [0.8, 0.9, 0.9, 1],
});

var bounds = [[0,-10,0], [25,25,25]], axes;

var meshes, ground, groundShader, cam, eye, target, up, camUp, camRight, camToTarget;
var nBlocks, nLevels, blocks, levels = [0,0,0,0], landscape, vao;

shell.on('gl-init', function() {
    var gl = shell.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT_AND_BACK);

    camera.lookAt(bounds[1], [10,10,40], [0, 1, 0])
    axes = createAxes(gl, {bounds:bounds});

    //camshit
    cam = mat4.create()
    eye = vec3.create()
    vec3.set(eye, 40, 10, 10);
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
    // console.log(cam);
    // shader = createShader(gl,vs(),fs());
    // shaders = require('./shaders/shaders.js')(gl);
    shaders = loadShaders(gl);
    groundShader = shaders.ground;

    ground = require('./terrainDataGenerator.js')(gl);
    nLevels = ground.nLevels;
    nBlocks = ground.nBlocks;
    heightMap = ground.heightMap;


    landscape = new Landscape(heightMap, 9, 1, 0.5, {pos: eye}, {x:0, y:0, z:0});

    debugger;
    landscape.reset();

    landscape.tessellate();
    data = landscape.generateTriangleData();


    buffer2 = createBuffer(gl, data.positions);
    colorBuffer = createBuffer(gl, [ 0.5, 0.5, 0.5, 0, 1, 0, 1, 1, 0 ]);

    vao = createVAO(gl, [
        {
            "buffer": buffer2,
            "type": gl.FLOAT,
            "size": 3
        },
        {
            "buffer": buffer2,
            "type": gl.FLOAT,
            "size": 3
        },
        {
            "buffer": buffer2,
            "type": gl.FLOAT,
            "size": 3
        },
        {
            "buffer": buffer2,
            "type": gl.FLOAT,
            "size": 1
        }
    ]);


    groundShader.attributes.aPosition.location = 0;
    groundShader.attributes.aColor.location = 1;
    groundShader.attributes.aNormal.location = 2;
    groundShader.attributes.aTriangleHeight.location = 3;

});

shell.on('gl-render', function(t) {
    var gl = shell.gl;
    clear(gl);

    var cameraParameters = {
        view: camera.view(),
        projection: mat4.perspective(
        mat4.create(),
        Math.PI/4.0,
        shell.width/shell.height,
        0.1,
        1000.0)
    }

    //draw the ground
    groundShader.bind();
    groundShader.uniforms.t += 0.01;
    groundShader.uniforms.uCameraPos = eye;


    // mat4.lookAt(cam, eye, target, up)
    var scratch = mat4.create()


    groundShader.uniforms.model = scratch;
    groundShader.uniforms.projection = cameraParameters.projection;
    groundShader.uniforms.view = cameraParameters.view;


    // groundShader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0)
    // groundShader.uniforms.view = cam
    var model = mat4.create(), unityM = mat4.create();

    // for (var j = 0; j < nBlocks; j++) {
        // var i = j + 4*levels[j];

        // i = level * 4 + 2*y + x
        // mat4.translate(model, unityM, vec3.fromValues(ground.blocks[i].offset[0],ground.blocks[i].offset[1],ground.blocks[i].offset[2]) );
        groundShader.uniforms.model = model;
        vao.bind();
        vao.draw(gl.LINES, data.positions.length/3);
        vao.unbind();
    // }

     axes.draw(cameraParameters)

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
