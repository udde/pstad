//struct-like class for trinodes
var TriTreeNode = function ()
{
    this.id           = null;
    this.leftChild    = null;
    this.rightChild   = null;
    this.baseNeighbor = null;
    this.leftNeighbor = null;
    this.baseNeighbor = null;
}

var NodeMemoryHandler = function(poolSize)
{
    this.poolSize = poolSize;
    this.nextTriNode = 0;
    this.nodePool = [];
    for (var i = 0; i < this.poolSize; i++)
        this.nodePool[i] = new TriTreeNode();
}

NodeMemoryHandler.prototype.claimNextFreeNode = function()
{
    //check if run out of nodes
    if(this.nextTriNode >= this.poolSize)
        return null;

    var node = this.nodePool[this.nextTriNode];
    node.leftChild = null;
    node.rightChild = null;
    node.id = this.nextTriNode + 1;

    this.nextTriNode += 1;

    return node;
}
