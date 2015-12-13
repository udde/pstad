//LANDSCAPE
var Landscape = function(heightMap, mapWidth, nPatchesPerSide, scale, camera, worldPosition )
{

    //Constants
    this.mapConsts.mapWidth = mapWidth;
    this.mapConsts.nPatchesPerSide = nPatchesPerSide;
    this.mapConsts.patchWidth = this.mapWidth/this.nPatchesPerSide;
    this.mapConsts.poolSize = 32768;
    this.mapConsts.scale = scale;

    //hardcoded
    //depth of vaiance: tree should be close to sqrt(patchWidth)+1
    this.mapConsts.varianceDepth = 9;
    //beginnig fram variance, should be high
    this.mapConsts.frameVariance = 50;
    this.mapConsts.desiredTriangleTessellations = 10000;
    this.mapConsts.nTrianglesRendered = 0;

    this.nextTriNode = NULL;
    this.nodePool = [];
    for (var i = 0; i < this.mapConsts.poolSize; i++)
        this.nodePool[i] = new TriTreeNode();

    //instance variables
    this.heightMap = heightMap;
    this.camera = camera;
    this.worldPosition = worldPosition;
    this.patches = new Array(this.nPatchesPerSide);
    //create the patches in a 2d array
    this.createPatches();
}

Landscape.prototype.allocateTri()
{

}

Landscape.prototype.createPatches()
{
    for(var y = 0; y <  ; y++)
    {
        this.patches[i] = new Array(this.nPatchesPerSide);
        for(var x = 0; x <  ; x++)
        {
            this.patches[i][j] = new Patch(this.heightMap, this.mapConsts, x*this.mapConsts.patchWidth,
            y*this.mapConsts.mapWidth, worldPosition.x, worldPosition.z, this.camera );
        }
    }
}
