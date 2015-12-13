
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
