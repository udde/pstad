//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//

THREE.Vector3 mod289(THREE.Vector3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

THREE.Vector4 mod289(THREE.Vector4 x) {
  return x - Math.floor(x * (1.0 / 289.0)) * 289.0;
}

function permute(THREE.Vector4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

function taylorInvSqrt(THREE.Vector4 r)
{
  return  r.multiplyScalar(1.79284291400159 - 0.85373472095314);
}

function snoise(THREE.Vector3 v)
  {
  const THREE.Vector2  C = THREE.Vector2(1.0/6.0, 1.0/3.0) ;
  const THREE.Vector4  D = THREE.Vector4(0.0, 0.5, 1.0, 2.0);

// First corner
  THREE.Vector3 i  = floor(v + dot(v, C.yyy) );
  THREE.Vector3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  THREE.Vector3 g = step(x0.yzx, x0.xyz);
  THREE.Vector3 l = 1.0 - g;
  THREE.Vector3 i1 = min( g.xyz, l.zxy );
  THREE.Vector3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  THREE.Vector3 x1 = x0 - i1 + C.xxx;
  THREE.Vector3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  THREE.Vector3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  THREE.Vector4 p = permute( permute( permute(
             i.z + THREE.Vector4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + THREE.Vector4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + THREE.Vector4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  THREE.Vector3  ns = n_ * D.wyz - D.xzx;

  THREE.Vector4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  THREE.Vector4 x_ = floor(j * ns.z);
  THREE.Vector4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  THREE.Vector4 x = x_ *ns.x + ns.yyyy;
  THREE.Vector4 y = y_ *ns.x + ns.yyyy;
  THREE.Vector4 h = 1.0 - abs(x) - abs(y);

  THREE.Vector4 b0 = THREE.Vector4( x.xy, y.xy );
  THREE.Vector4 b1 = THREE.Vector4( x.zw, y.zw );

  //THREE.Vector4 s0 = THREE.Vector4(lessThan(b0,0.0))*2.0 - 1.0;
  //THREE.Vector4 s1 = THREE.Vector4(lessThan(b1,0.0))*2.0 - 1.0;
  THREE.Vector4 s0 = floor(b0)*2.0 + 1.0;
  THREE.Vector4 s1 = floor(b1)*2.0 + 1.0;
  THREE.Vector4 sh = -step(h, THREE.Vector4(0.0));

  THREE.Vector4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  THREE.Vector4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  THREE.Vector3 p0 = THREE.Vector3(a0.xy,h.x);
  THREE.Vector3 p1 = THREE.Vector3(a0.zw,h.y);
  THREE.Vector3 p2 = THREE.Vector3(a1.xy,h.z);
  THREE.Vector3 p3 = THREE.Vector3(a1.zw,h.w);

//Normalise gradients
  THREE.Vector4 norm = taylorInvSqrt(THREE.Vector4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  THREE.Vector4 m = max(0.6 - THREE.Vector4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, THREE.Vector4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }
