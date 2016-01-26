math = require('mathjs')
//LANDSCAPE
var Landscape = function(heightMap, mapWidth, nPatchesPerSide, scale, camera, worldPosition )
{
    //Constants
    this.mapConsts = {};
    this.mapConsts.mapWidth = mapWidth;
    this.mapConsts.nSamplesPerMapDim = mapWidth + 1;
    this.mapConsts.nMaxPossibleLeaves = math.pow(2,mapWidth);
    this.mapConsts.maxTreeDepth = math.log(this.mapConsts.nMaxPossibleLeaves,2);
    this.mapConsts.nPatchesPerSide = nPatchesPerSide;
    this.mapConsts.patchWidth = mapWidth/nPatchesPerSide;
    this.mapConsts.scale = scale;
    this.mapConsts.minTriangleWidthForVariance = 3;

    //hardcoded
    //depth of vaiance: tree should be close to sqrt(patchWidth)+1
    this.mapConsts.varianceDepth = 9;
    //beginnig fram variance, should be high
    this.mapConsts.frameVariance = 7;
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
    var totalData = { positions: [], normals: [], depth: [] };

    for(var y = 0; y < this.mapConsts.nPatchesPerSide; y++)
    for(var x = 0; x < this.mapConsts.nPatchesPerSide; x++)
    {
        currentPatch = this.patches[y][x];
        if(currentPatch.isVisible)
        {

            var patchData = currentPatch.render();

            totalData.positions = totalData.positions.concat(patchData.positions);
            totalData.normals = totalData.normals.concat(patchData.normals);
            totalData.depth = totalData.depth.concat(patchData.depth);
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
