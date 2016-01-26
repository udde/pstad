var math  = require('mathjs');

module.exports = init;

function init(res, option)
{
    if(option == 0)
        return generateHeightMap(res);

    if(res == 8)
        return heightMap8;
    if(res == 32)
        return heightMap32;

}

function generateHeightMap(res)
{
    var mapWidth = res+1
    var heightMap = new Float32Array(mapWidth*mapWidth);
    for(var i = 0; i < mapWidth; i++)
    for(var j = 0; j < mapWidth; j++)
    {
        heightMap[i*mapWidth + j] = getHeight(j, i);
    }

    return heightMap;
}


var simplexNoise    = require('./simplexNoiseImproved.js');
var simplex = new simplexNoise();

function getHeight(x ,y, getMax)
{
    // var height = 1.0 * simplex.noise2D(0.00116*0.4*x, 0.00116*0.9*y);
    d = math.sqrt( x * x  +  y * y );
    // height = 5*el;

    var f = 0.125 / 8;
    var s = 2.0 * 2;
    height = s * simplex.noise2D(f*x,f*y);
    var max = s;
    s = s/2;
    f = f*2;
    height += s * simplex.noise2D(f*x, f*y);
    max += s;
    // if(height)
    // height *= (0.5*height);
    height =  height > 0.0 ? height * (math.pow(height, 0.5)) : height *0.8;
    max = max * math.pow(max, 0.5);

    for (var i = 0; i < 2; i++) {
        s = s/2;
        f = f*2;
        max += s;
        height += s * simplex.noise2D(f*x, f*y);
    }

    if(height > 0.0)
        height *= 1.3;
    else
        height *= 1.0;
    max *= 1.3;

    // if(height > 6.0)
        // height += 0.1*height

    for (var i = 0; i < 2; i++) {
        s = s/2;
        f = f*2;
        max += s;
        height += s * simplex.noise2D(f*x, f*y);
    }

    if(getMax)
        return max;
    return height;
}
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
    // console.log(max);
