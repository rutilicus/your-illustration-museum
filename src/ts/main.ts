import * as THREE from 'three'
import GUI from 'lil-gui'

let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;

function init() {
  const scene = new THREE.Scene();
  renderer = new THREE.WebGLRenderer();

  renderer.setClearColor(new THREE.Color(0xEEEEEE));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const roomSize = 3;
  const roomMaterial = new THREE.MeshLambertMaterial({color: 0xfff9ee});
  roomMaterial.side = THREE.DoubleSide;
  const room = new THREE.Mesh(
    new THREE.BoxGeometry(roomSize, roomSize, roomSize),
    roomMaterial
  );
  room.position.z = roomSize / 2;
  room.receiveShadow = true;
  scene.add(room);

  const ratio = 4093 / 2894;
  const illustrationHeight = 1;
  const illustrationWidth = illustrationHeight / ratio;
  const illustrationMaterial = new THREE.MeshLambertMaterial();
  illustrationMaterial.map = new THREE.TextureLoader().load('water.jpg');
  const illustration = new THREE.Mesh(
    new THREE.PlaneGeometry(illustrationWidth, illustrationHeight),
    illustrationMaterial
  );
  illustration.position.set(
    0,
    roomSize / 2 - 0.1,
    roomSize / 2);
  illustration.rotation.x = Math.PI / 2;
  illustration.receiveShadow = true;
  scene.add(illustration);

  const frameMaterial = new THREE.MeshStandardMaterial({color: 0xffd700});
  frameMaterial.metalness = 1;
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(illustrationWidth + 0.1, illustrationHeight + 0.1),
    frameMaterial
  );
  frame.position.set(illustration.position.x, illustration.position.y + 0.01, illustration.position.z);
  frame.rotation.x = Math.PI / 2;
  frame.receiveShadow = true;
  scene.add(frame);

  const ceilingLight = new THREE.PointLight(0xffffff);
  ceilingLight.position.set(0, 0, roomSize - 0.1);
  ceilingLight.decay = 3;
  ceilingLight.distance = 5;
  ceilingLight.intensity = 1;
  scene.add(ceilingLight);

  const spotLight = new THREE.SpotLight(0xffffff);
  spotLight.position.set(0, roomSize / 2 - 0.2, roomSize - 0.1);
  spotLight.position.set(0, 0.1, roomSize - 0.1);
  spotLight.castShadow = true;
  spotLight.target = illustration;
  spotLight.decay = 3;
  spotLight.distance = 3;
  spotLight.intensity = 2;
  spotLight.angle = Math.PI / 6;
  scene.add(spotLight);

  const cameraHeight = 1.7;
  camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, -roomSize / 2 + 0.1, cameraHeight);
  camera.lookAt(illustration.position);

  // scene.add(new THREE.AxesHelper(40));

  const control = {
    ceilingLight_decay: ceilingLight.decay,
    ceilingLight_distance: ceilingLight.distance,
    ceilingLight_intenstiy: ceilingLight.intensity,
    spotLight_decay: spotLight.decay,
    spotLight_distance: spotLight.distance,
    spotLight_intensity: spotLight.intensity,
    spotLight_angle: spotLight.angle
  };
  const gui = new GUI();
  gui.add(control, 'ceilingLight_decay', 0, 10);
  gui.add(control, 'ceilingLight_distance', 0, 10);
  gui.add(control, 'ceilingLight_intenstiy', 0, 10);
  gui.add(control, 'spotLight_decay', 0, 10);
  gui.add(control, 'spotLight_distance', 0, 10);
  gui.add(control, 'spotLight_intensity', 0, 10);
  gui.add(control, 'spotLight_angle', 0, Math.PI);

  document.getElementById("WebGL-output")?.appendChild(renderer.domElement);

  render();

  function render() {
    ceilingLight.decay = control.ceilingLight_decay;
    ceilingLight.distance = control.ceilingLight_distance;
    ceilingLight.intensity = control.ceilingLight_intenstiy;
    spotLight.decay = control.spotLight_decay;
    spotLight.distance = control.spotLight_distance;
    spotLight.intensity = control.spotLight_intensity;
    spotLight.angle = control.spotLight_angle;
    
    // illustration.position.x = control.iX;
    // illustration.position.y = control.iY;
    // illustration.position.z = control.iZ;
    // camera.position.x = control.cX;
    // camera.position.y = control.cY;
    // camera.position.z = control.cZ;
    // camera.lookAt(illustration.position);

    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onload = init;

window.addEventListener('resize', onResize);
