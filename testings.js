import * as THREE from '/node_modules/three/build/three.module.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/node_modules/three/examples/jsm/loaders/DRACOLoader.js';
import {SkeletonUtils} from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js';


const clock = new THREE.Clock();


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2,2,5);
scene.add(light);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setClearColor( 0xffffff );

const geometry = new THREE.SphereGeometry( 2, 80, 80 ); 
const material = new THREE.MeshBasicMaterial( { color: 'lightblue' } ); 
const sphere = new THREE.Mesh( geometry, material ); 
scene.add( sphere );




// Click the sphere will pop up a window

const raycaster = new THREE.Raycaster(); 
const pointer = new THREE.Vector2(); 
var mouseLocation;

const analytics = document.createElement("div");
analytics.style.position = "absolute";
analytics.style.backgroundColor = "pink";
analytics.style.width = "700px";
analytics.style.height = "1000";
analytics.textContent = "AnalyticsAnalyticsAnalytics";
analytics.style.fontSize = "200%";
analytics.style.top = "300px";
analytics.style.left = "300px";
analytics.style.opacity = "0.7";

function onPointerMove( event ) { 
    // calculate pointer position in normalized device coordinates 
    // (-1 to +1) for both components 
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1; 
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1; 
} 


window.addEventListener( 'pointermove', onPointerMove ); 
window.addEventListener('pointerdown', event =>{
mouseLocation = pointer.x;
});

window.addEventListener('pointerup', event =>{
    raycaster.setFromCamera( pointer, camera ); 
    const intersects = raycaster.intersectObjects( scene.children ); 

    if(pointer.x == mouseLocation){

    if(intersects.length > 0){
            // intersects[0].object.material.color.set( 0xffffff ); 
            document.body.appendChild(analytics);
    }
    }

    renderer.render( scene, camera ); 

});

// Click the sphere will pop up a window  ---------------- ending





//Import animated testing blender objects


// Instantiate a loader
const loader = new GLTFLoader();
let bird;
var birdSpecies = [];
let mixer = [];


const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './node_modules/three/examples/jsm/loaders/DRACOLoader.js' );
loader.setDRACOLoader( dracoLoader );


// Load a glTF resource
loader.load(
	// resource URL
	'testanimations.glb',
	// called when the resource is loaded
	function ( gltf ) {
        const birdScene = gltf.scene;
        birdScene.scale.set(0.35,0.35,0.35);
        birdScene.rotateZ(60);
        birdScene.rotateX(30);


		scene.add( birdScene );

        bird = gltf;
        birdSpecies.push(bird);
		// gltf.animations; // Array<THREE.AnimationClip>
		// gltf.scene; // THREE.Group
		// gltf.scenes; // Array<THREE.Group>
		// gltf.cameras; // Array<THREE.Camera>
		// gltf.asset; // Object

        
     

// // Create an AnimationMixer, and get the list of AnimationClip instances
const birdMixer = new THREE.AnimationMixer( birdScene );
mixer.push(birdMixer);
const clips = bird.animations;



// // Play action1
const clipAction1 = THREE.AnimationClip.findByName( clips, 'Action1' );
const action1 = birdMixer.clipAction( clipAction1 );
action1.play();

console.log(action1);
console.log(1);


	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);




//Import animated testing blender objects ---------------------- ending




//Duplicate animated objects

const rangeSlider = document.createElement("input");
var score;

rangeSlider.style.position = "absolute";
rangeSlider.setAttribute("type", "range");
rangeSlider.setAttribute("min", "1");
rangeSlider.setAttribute("max", "6");
rangeSlider.setAttribute("value", "1");
rangeSlider.setAttribute("step", "1");
rangeSlider.style.top = "100px";
rangeSlider.style.left = "50px";

document.body.appendChild(rangeSlider);



rangeSlider.oninput = function(){
    score = rangeSlider.value;

    if(score > birdSpecies.length){

         var addAnimals = SkeletonUtils.clone(bird.scene);
    birdSpecies.push(addAnimals);
    addAnimals.rotateX(10*birdSpecies.length);
    addAnimals.rotateZ(5*birdSpecies.length);

    scene.add(addAnimals);
    renderer.render( scene, camera );
    

    const birdMixer = new THREE.AnimationMixer( addAnimals );
    mixer.push(birdMixer);
    const clips = bird.animations;
    

    // // Play action1
    const clipAction1 = THREE.AnimationClip.findByName( clips, 'Action1' );
    
    const action1 = birdMixer.clipAction( clipAction1 );
    
    console.log(action1);
    action1.play();

    }

   

  



}

//Duplicate animated objects ----------------------- ending







const controls = new OrbitControls( camera, renderer.domElement );

    //Disable zooming
    controls.enableZoom = false;


camera.position.z = 5;


controls.update();








function animate() {
	requestAnimationFrame( animate );
	controls.update();

    const delta = clock.getDelta();

    if (mixer.length > 0){

        mixer.forEach(function(a){
            a.update(delta);
        }

        );

    }

	renderer.render( scene, camera );


}

animate();