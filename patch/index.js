var math = require('mathjs');

module.exports = init;

function init(gl) {

    return {};
}

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
}

var TriTreeNode = function ()
{
    this.leftChild    = NULL;
    this.rightChild   = NULL;
    this.baseNeighbor = NULL;
    this.leftNeighbor = NULL;
    this.baseNeighbor = NULL;
}

var Patch = function()
{
    this.varianceTreeLeft  = new Uint8Array(1<<(GLOBAL_DATA.varianceDepth));
    this.varianceTreeRight = new Uint8Array(1<<(GLOBAL_DATA.varianceDepth));
}

Patch.prototype.init = function( offsetX, offsetY, worldX, worldY, heightMap )
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
    this.currentVariance = this.varianceTreeLeft;
    this.recursiveComputeVariance()
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

    var centerZ = this.heightMap[this.localHeightStartIdx + centerY + GLOBAL_DATA.mapWidth + centerX];

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
