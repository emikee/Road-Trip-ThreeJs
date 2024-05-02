import './style.css'
import * as THREE from 'three'
import { addWindow, createTerrain } from './addMeshes'
import { addAmbient, addDirect } from './addLights'
import {postprocessing} from "./postprocessing"
import { Sky } from 'three/addons/objects/Sky.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene()
let fog = scene.fog

const fogSettings = {
	yellow: [15111193, 800, 1500],
	blue: [4684963, 400, 1200],
	green: [5144403, 800, 1300]
}
let fogColor = fogSettings.yellow[0]
let fogNear = fogSettings.yellow[1]
let fogFar = fogSettings.yellow[2]

fog = new THREE.Fog( fogColor, fogNear, fogFar ); 
const renderer = new THREE.WebGLRenderer({ 
	antialias: true,
	canvas: document.querySelector("#bg") 
})
const loader = new GLTFLoader();

const camera = new THREE.PerspectiveCamera(
	10,
	window.innerWidth / window.innerHeight,
	0.01,
	10000
)

let sky, sun

//bg sound
const listener = new THREE.AudioListener()
camera.add( listener )
const sound = new THREE.Audio( listener )
const audioLoader = new THREE.AudioLoader()

//bump sound
const listener2 = new THREE.AudioListener()
const bumpSound = new THREE.Audio( listener2 )
const bumpLoader = new THREE.AudioLoader()

audioLoader.load( "/drive.mp3", function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0 );
	sound.play();
});


camera.position.set(0, 20, 700)

//Globals
const meshes = {}
const lights = {}
const clock = new THREE.Clock()
const material = new THREE.ShaderMaterial
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let prevTime = performance.now();
let moveLeft = false
let moveRight = false
let canJump = false
let composer 
let rayleigh = 1.0
let exposure = 0.7

//camera group
const cameraGroup = new THREE.Group()
cameraGroup.add(camera)
cameraGroup.add(addWindow())
const pointerLock = new PointerLockControls( cameraGroup, document.body )
meshes.window = cameraGroup
scene.add(meshes.window)


init()

function initSky() {

	// Add Sky
	sky = new Sky();
	sky.scale.setScalar( 450000 );
	scene.add( sky );

	sun = new THREE.Vector3();

	let uniforms = sky.material.uniforms;
	uniforms[ 'turbidity' ].value = 4.5;
	uniforms[ 'mieCoefficient' ].value = 0.009;
	uniforms[ 'mieDirectionalG' ].value = 0.7;

	const phi = THREE.MathUtils.degToRad( 90 - 0.3 );
	const theta = THREE.MathUtils.degToRad( -150 );

	sun.setFromSphericalCoords( 1, phi, theta );

	uniforms[ 'sunPosition' ].value.copy( sun );
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	
	renderer.render( scene, camera );

}

function init() {
	renderer.setSize(window.innerWidth, window.innerHeight)

	//meshes
	meshes.terrain = createTerrain()

	//lights
	lights.ambient = addAmbient()
	lights.direct = addDirect()

	//post
	composer = postprocessing(scene, camera, renderer)

	//key
	const onKeyDown = function ( event ) {
		switch ( event.code ) {

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				sound.setVolume(1)
				if (rayleigh < 6.0) {
					rayleigh += 0.005
				}
				if (exposure > 0.3) {
					exposure -= 0.005
				}
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				sound.setVolume(1)
				if (rayleigh >= 0.3) {
					rayleigh -= 0.005
				}
				if (exposure < 0.9) {
					exposure += 0.005
				}
				break;
			case 'ArrowUp':
			case 'KeyW':
			case 'Space':
				if ( canJump === true ) velocity.y += 350;
					canJump = false;
					bumpLoader.load( "/bump.mp3", function( buffer ) {
						bumpSound.setBuffer( buffer );
						bumpSound.setVolume(0.6);
						bumpSound.play();
					});
					break;
		}

	};

	const onKeyUp = function ( event ) {
		switch ( event.code ) {

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				sound.setVolume(0)
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				sound.setVolume(0)
				break;

		}

	};

	document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );

	//button for fog
	document.getElementById("yellow-scene").addEventListener("click", function() {yellowFog()}, false);
	document.getElementById("blue-scene").addEventListener("click", function() {blueFog()}, false);
	document.getElementById("green-scene").addEventListener("click", function() {greenFog()}, false);

	//scene operations
	scene.add(meshes.terrain)
	scene.add(meshes.window)
	scene.add(lights.ambient)
	scene.add(lights.direct)

	lights.direct.target = meshes.window

	//tree1 model
	loader.load( 'tree.glb', function ( gltf ) {
		gltf.scene.scale.set(12,12,12);
		gltf.scene.position.set(-10,-40,-400);
		gltf.scene.castShadow = true;
		scene.add( gltf.scene );

			// clones
		for (let i = 0; i < 8; i++) {
			const clone = gltf.scene.clone();
			let xPos = THREE.MathUtils.randFloat(-50, 3);
			let yPos = THREE.MathUtils.randFloat(0.7, 1);
			let zPos = THREE.MathUtils.randFloat(0.8, 1.3);
			let scale = THREE.MathUtils.randFloat(0.8, 4);

			//styling
			clone.position.x = gltf.scene.position.x * xPos;
			clone.position.y = gltf.scene.position.y * yPos;
			clone.position.z = gltf.scene.position.z * zPos;
			clone.scale.set = (scale, scale, scale);
			clone.castShadow = true;

			scene.add(clone);
		}
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );

	//tree2 model
	loader.load( 'treee.glb', function ( gltf ) {
		gltf.scene.scale.set(3,3,3);
		gltf.scene.position.set(10,-33,-300);
		gltf.scene.castShadow = true;
		scene.add( gltf.scene );

			// clones
		for (let i = 0; i < 14; i++) {
			const clone = gltf.scene.clone();
			let xPos = THREE.MathUtils.randFloat(-60, 2);
			let yPos = THREE.MathUtils.randFloat(1, 1.15);
			let zPos = THREE.MathUtils.randFloat(-0.2, 2);
			let scale = THREE.MathUtils.randFloat(0.6, 3);

			//styling
			clone.position.x = gltf.scene.position.x * xPos;
			clone.position.y = gltf.scene.position.y * yPos;
			clone.position.z = gltf.scene.position.z * zPos;
			clone.scale.set = (scale, scale, scale);
			clone.castShadow = true;

			scene.add(clone);
		}
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );

	//pole model
	loader.load( 'Electricity Poles.glb', function ( gltf ) {
		gltf.scene.scale.set(8,8,8);
		gltf.scene.position.set(200,-100,-400);
		gltf.scene.castShadow = true;
		scene.add( gltf.scene );

			// clones
		for (let i = 0; i < 10; i++) {
			const clone = gltf.scene.clone();
			//styling
			clone.position.x += 150;
			clone.castShadow = true;

			scene.add(clone);
		}
	
	}, undefined, function ( error ) {
	
		console.error( error );
	
	} );
	

	initSky()
	resize()
	animate()
	
}


function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}


function animate() {
	requestAnimationFrame(animate)
	meshes.window.rotation.setFromRotationMatrix(camera.matrix)
	const time = performance.now();
	const delta = ( time - prevTime ) / 1000;

	meshes.terrain.rotation.x = -Math.PI/2
	meshes.terrain.position.y = -100

	camera.updateMatrixWorld()
	cameraGroup.updateMatrixWorld()

	//.lerpColors ( color1 : Color, color2 : Color, alpha : Float )
	//fog.color.lerp(fogColor, 0.5)
	//fog = new THREE.Fog( fogColor, fogNear, fogFar ); 

	let uniforms = sky.material.uniforms;
	uniforms[ 'rayleigh' ].value = rayleigh
	renderer.toneMappingExposure = exposure


	velocity.x -= velocity.x * 30.0 * delta;

	velocity.y -= 9.8 * 800.0 * (delta * 1.2);

	direction.x = Number( moveRight ) - Number( moveLeft );
	direction.normalize(); // this ensures consistent movements in all directions

	if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;
	pointerLock.moveRight( - velocity.x * delta );

	pointerLock.getObject().position.y += ( velocity.y * delta );
	if ( pointerLock.getObject().position.y < 2 ) {

		velocity.y = 0;
		pointerLock.getObject().position.y = 2;

		canJump = true;

	}

	prevTime = time;

	composer.composer.render()
}

window.onresize = function (e) {
	camera.aspect = window.innerWidth/window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
}

let oldx = 0
let oldy = 0

window.onmousemove = function(ev) {
	let changex = ev.x - oldx
	let changey = ev.y - oldy
	camera.position.x += changex/300
	camera.position.y += changey/300 

	oldx = ev.x
	oldy = ev.y
}

function yellowFog() {
	fog.color.lerp(fogSettings.yellow[1], 0.5)
	// fogColor = fogSettings.yellow[0]
	// fogNear = fogSettings.yellow[1]
	// fogFar = fogSettings.yellow[2]
}

function blueFog() {
	fogColor = fogSettings.blue[0]
	fogNear = fogSettings.blue[1]
	fogFar = fogSettings.blue[2]
}

function greenFog() {
	fogColor = fogSettings.green[0]
	fogNear = fogSettings.green[1]
	fogFar = fogSettings.green[2]
}