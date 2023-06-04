import * as THREE from 'three'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls'

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cameraControl: FirstPersonControls;

async function init() {
  const clock = new THREE.Clock();

  // create Three.js Scene and Renderer.
  const scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0xEEEEEE));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const roomSizePerElem = 3;
  let imageNum = 0;

  // read image files.
  const response = await fetch('./images.txt');
  if (response.status != 200) {
    return;
  }
  const files = await response.text();
  files.split(/\r\n|\r|\n/).forEach(line => {
    if (line) {
      const count = imageNum++;
      const img = new Image();
      img.onload = function() {
        // add image to scene.        
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const ratio = height / width;
        let illustrationHeight;
        let illustrationWidth;
        if (width > height) {
          illustrationWidth = 1;
          illustrationHeight = ratio;
        } else {
          illustrationWidth = 1 / ratio;
          illustrationHeight = 1;
        }
        const illustrationMaterial = new THREE.MeshLambertMaterial();
        const texture = new THREE.Texture();
        texture.image = img;
        texture.needsUpdate = true;
        illustrationMaterial.map = texture;
        const illustration = new THREE.Mesh(
          new THREE.PlaneGeometry(illustrationWidth, illustrationHeight),
          illustrationMaterial
        );
        illustration.position.set(
          (count + 0.5) * roomSizePerElem,
          roomSizePerElem / 2,
          0.1);
        illustration.receiveShadow = true;
        scene.add(illustration);

        // add frame to scene.
        const frameMaterial = new THREE.MeshStandardMaterial({color: 0xffd700});
        frameMaterial.metalness = 1;
        const frame = new THREE.Mesh(
          new THREE.PlaneGeometry(illustrationWidth + 0.1, illustrationHeight + 0.1),
          frameMaterial
        );
        frame.position.set(illustration.position.x, illustration.position.y, illustration.position.z - 0.01);
        frame.receiveShadow = true;
        scene.add(frame);

        // add ceilingLight to scene.
        const ceilingLight = new THREE.PointLight(0xffffff);
        ceilingLight.position.set(illustration.position.x, roomSizePerElem - 0.1, roomSizePerElem / 2);
        ceilingLight.decay = 3;
        ceilingLight.distance = 5;
        ceilingLight.intensity = 1;
        scene.add(ceilingLight);

        // add spotLight to scene.
        const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(illustration.position.x, roomSizePerElem - 0.1, roomSizePerElem / 2 - 0.1);
        spotLight.castShadow = true;
        spotLight.target = illustration;
        spotLight.decay = 3;
        spotLight.distance = 3;
        spotLight.intensity = 2;
        spotLight.angle = Math.PI / 6;
        scene.add(spotLight);      
      }
      img.src = line;
    }
  });

  // add room to scene.
  const roomMaterial = new THREE.MeshLambertMaterial({color: 0xfff9ee});
  roomMaterial.side = THREE.DoubleSide;
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(imageNum * roomSizePerElem, roomSizePerElem, roomSizePerElem),
    roomMaterial
  );
  room.position.set(imageNum / 2 * roomSizePerElem, roomSizePerElem / 2, roomSizePerElem / 2);
  room.receiveShadow = true;
  scene.add(room);

  // add camera to scene.
  const cameraHeight = 1.7;
  camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0.5, cameraHeight, roomSizePerElem / 2);
  camera.lookAt(new THREE.Vector3(imageNum * roomSizePerElem, cameraHeight, roomSizePerElem));

  // set camera control
  cameraControl = new FirstPersonControls(camera, renderer.domElement);
  cameraControl.lookSpeed = 0.05;
  cameraControl.movementSpeed = 2;
  cameraControl.lookVertical = true;
  cameraControl.constrainVertical = true;
  cameraControl.verticalMin = Math.PI / 4;
  cameraControl.verticalMax = Math.PI / 4 * 3;

  document.getElementById("WebGL-output")?.appendChild(renderer.domElement);

  // ここで一度handleResizeを投げないとFirstPersonControlsが内部で持っているウインドウサイズが正しく処理されない
  cameraControl.handleResize();
  render();

  function render() {
    cameraControl.update(clock.getDelta());

    // camera position adjustment
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, 0.5, imageNum * roomSizePerElem - 0.5);
    camera.position.y = cameraHeight;
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, 0.5, roomSizePerElem - 0.5);

    renderer.clear();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cameraControl.handleResize();
}

window.onload = init;

window.addEventListener('resize', onResize);
