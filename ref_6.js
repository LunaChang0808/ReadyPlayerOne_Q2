export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Texture projection

A video is projected on a screen, simulating a... video projector.

_original code: https://jsfiddle.net/t2w6bagq/, updated to three.js 0.121.1_
`
)});
  main.variable(observer("flyingCinema")).define("flyingCinema", ["html","THREE"], function(html,THREE)
{
  const resizableDiv = html`<div style="display: block;overflow: hidden;resize: horizontal;"></div>`;

  const canvas = html`<canvas id="c" style="width: 100%; height: 500px;"></canvas>`;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0x202020);

  const clock = new THREE.Clock();
  var time = 0;
  var rotation = THREE.Math.degToRad(15);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    2, //default: will be computed later
    0.01,
    1000
  );
  camera.position.set(2, 1, 2).setLength(15);

  const video = html`<video id="video" autoplay loop crossOrigin="anonymous" webkit-playsinline style="display:none">
			<source src="https://threejs.org/examples/textures/sintel.ogv" type='video/ogg; codecs="theora, vorbis"'>
			<source src="https://threejs.org/examples/textures/sintel.mp4" type='video/mp4; codecs="avc1.42E01E, mp4a.40.2"'>
</video>`;
  video.volume = 0;
  video.play();

  const videoTex = new THREE.VideoTexture(video);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);

  var projCamera = new THREE.PerspectiveCamera(35, 1.2, 0.01, 10);
  projCamera.position.set(0, 0, 9);
  projCamera.updateMatrixWorld();

  const helper = new THREE.CameraHelper(projCamera);
  scene.add(helper);

  const screen = new THREE.Mesh(
    new THREE.BoxBufferGeometry(16, 9, 2),
    new THREE.ShaderMaterial({
      uniforms: {
        baseColor: {
          value: new THREE.Color(0xcccccc)
        },
        cameraMatrix: {
          type: 'm4',
          value: projCamera.matrixWorldInverse
        },
        projMatrix: {
          type: 'm4',
          value: projCamera.projectionMatrix
        },
        myTexture: {
          value: videoTex
        }
      },
      vertexShader: `

        varying vec4 vWorldPos;

        void main() {

          vWorldPos = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * viewMatrix * vWorldPos;

        }

      `,
      fragmentShader: `

        uniform vec3 baseColor;
        uniform sampler2D myTexture;
        uniform mat4 cameraMatrix;
        uniform mat4 projMatrix;

        varying vec4 vWorldPos;

        void main() {

          vec4 texc = projMatrix * cameraMatrix * vWorldPos;
          vec2 uv = texc.xy / texc.w / 2.0 + 0.5;

          vec3 color = ( max( uv.x, uv.y ) <= 1. && min( uv.x, uv.y ) >= 0. ) ? texture(myTexture, uv).rgb:vec3(1.0);
          gl_FragColor = vec4(baseColor * color, 1.0);

        }
      `,
      side: THREE.DoubleSide
    })
  );
  screen.position.z = -2;
  var boxGeom = new THREE.BoxBufferGeometry(16, 9, 2, 16, 9, 2);

  function GridBoxGeometry(geometry, independent) {
    if (!(geometry instanceof THREE.BoxBufferGeometry)) {
      console.log(
        "GridBoxGeometry: the parameter 'geometry' has to be of the type THREE.BoxBufferGeometry"
      );
      return geometry;
    }
    independent = independent !== undefined ? independent : false;

    let newGeometry = new THREE.BoxBufferGeometry();
    let position = geometry.attributes.position;
    newGeometry.attributes.position =
      independent === false ? position : position.clone();

    let segmentsX = geometry.parameters.widthSegments || 1;
    let segmentsY = geometry.parameters.heightSegments || 1;
    let segmentsZ = geometry.parameters.depthSegments || 1;

    let startIndex = 0;
    let indexSide1 = indexSide(segmentsZ, segmentsY, startIndex);
    startIndex += (segmentsZ + 1) * (segmentsY + 1);
    let indexSide2 = indexSide(segmentsZ, segmentsY, startIndex);
    startIndex += (segmentsZ + 1) * (segmentsY + 1);
    let indexSide3 = indexSide(segmentsX, segmentsZ, startIndex);
    startIndex += (segmentsX + 1) * (segmentsZ + 1);
    let indexSide4 = indexSide(segmentsX, segmentsZ, startIndex);
    startIndex += (segmentsX + 1) * (segmentsZ + 1);
    let indexSide5 = indexSide(segmentsX, segmentsY, startIndex);
    startIndex += (segmentsX + 1) * (segmentsY + 1);
    let indexSide6 = indexSide(segmentsX, segmentsY, startIndex);

    let fullIndices = [];
    fullIndices = fullIndices.concat(indexSide1);
    fullIndices = fullIndices.concat(indexSide2);
    fullIndices = fullIndices.concat(indexSide3);
    fullIndices = fullIndices.concat(indexSide4);
    fullIndices = fullIndices.concat(indexSide5);
    fullIndices = fullIndices.concat(indexSide6);

    newGeometry.setIndex(fullIndices);

    function indexSide(x, y, shift) {
      let indices = [];
      for (let i = 0; i < y + 1; i++) {
        let index11 = 0;
        let index12 = 0;
        for (let j = 0; j < x; j++) {
          index11 = (x + 1) * i + j;
          index12 = index11 + 1;
          let index21 = index11;
          let index22 = index11 + (x + 1);
          indices.push(shift + index11, shift + index12);
          if (index22 < (x + 1) * (y + 1) - 1) {
            indices.push(shift + index21, shift + index22);
          }
        }
        if (index12 + x + 1 <= (x + 1) * (y + 1) - 1) {
          indices.push(shift + index12, shift + index12 + x + 1);
        }
      }
      return indices;
    }
    return newGeometry;
  }
  var gridBoxGeom = GridBoxGeometry(boxGeom);
  var grid = new THREE.LineSegments(
    gridBoxGeom,
    new THREE.LineBasicMaterial({
      color: 0x777777
    })
  );
  screen.add(grid);
  scene.add(screen);

  // render the scene, as viewed from the camera, onto the canvas
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = (canvas.clientWidth * pixelRatio) | 0;
    const height = (canvas.clientHeight * pixelRatio) | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  // animated
  function render(time) {
    time *= 0.001; // convert time to seconds

    // Resize
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    time += clock.getDelta();
    screen.rotation.y = Math.sin(time * 0.314) * rotation;
    screen.rotation.x = Math.cos(time * 0.54) * rotation;
    screen.position.z = Math.sin(time * 0.71) * 4 - 2;
    screen.position.y = Math.cos(time * 0.44) * 2;
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  resizableDiv.append(canvas);
  resizableDiv.append(video);
  return resizableDiv;
}
);
  main.variable(observer("THREE")).define("THREE", ["require"], async function(require)
{
  const THREE = await require("three@0.121.1/build/three.min.js");
  // See https://threejs.org/docs/#manual/en/introduction/Installation
  const OrbitControls = await import('https://unpkg.com/three@0.121.1/examples/jsm/controls/OrbitControls.js').then(
    a => a.OrbitControls
  );
  THREE.OrbitControls = OrbitControls;
  return THREE;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`## References

- https://stemkoski.github.io/Three.js/Video.html: video texture on a rectangular plane
- https://stemkoski.github.io/Three.js/Camera-Texture.html: create a texture rendering the scene from a specific camera. It's the opposite of our objective (use a projected scene as a texture for a rectangular plane)
- texture projection, as a light projector:
  - https://discourse.threejs.org/t/texture-projection/3224/3: discussion
  - https://jsfiddle.net/t2w6bagq/: live example. Includes WebGL code

  <iframe width="100%" height="300" src="//jsfiddle.net/t2w6bagq/embedded/result/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>
- candidate pull request on Three.js to include a Texture "map" property to SpotLight to specify _"a texture to modulate the light"_:
  - https://github.com/mrdoob/three.js/pull/20290: the pull request. It seems that the PR will be reworked in order to create a [TextureLight](https://github.com/mrdoob/three.js/pull/20290#issuecomment-731598173) instead
  - [live example](https://rawgit.com/mbredif/three.js/41f1a55998ee717b5957621cdd42d2fe961c0faa/examples/webgl_shadowmap_viewer.html)
  - [another live example](https://cdn.rawgit.com/usefulthink/three.js/projector-lights-preview/examples/webgl_lights_projectorlight.html)
`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---

### Credits

_Developed for the [LIRIS M2i project](https://projet.liris.cnrs.fr/mi2/) by Sylvain Lesage._

_Original code by Guilherme Avila https://discourse.threejs.org/t/texture-projection/3224/5_

---
`
)});
  return main;
}
