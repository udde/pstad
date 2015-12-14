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
