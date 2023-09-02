import * as THREE from '../build/three.module.js';
import { OrbitControls } from '/build/OrbitControls.js';
import { GLTFLoader } from '/build/GLTFLoader.js';
import {SkeletonUtils} from '/build/SkeletonUtils.js';
import { DRACOLoader } from '/build/DRACOLoader.js';

const clock = new THREE.Clock();


let theme = new Audio('mp3/theme.mp3');
theme.loop = true;


let bubbleAction = [];
let history = [];

fetch( 'https://api.thingspeak.com/channels/2244255/feeds.json?api_key=2BZD7I9T5XFKHJBK&results=2')
	.then (response => {
	return response.json( );
	})
	.then (feeds => {
	history = feeds.feeds[1];
	});


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const xAxis = new THREE.Vector3(1,0,0);
const yAxis = new THREE.Vector3(0,1,0);
const zAxis = new THREE.Vector3(0,0,1);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.70);
scene.add(ambientLight);
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
scene.add(hemisphereLight);
const directionalLight1 = new THREE.DirectionalLight(0xFFFAA5, 0.4);
directionalLight1.target.position.set(0,0,0);
directionalLight1.position.set(3,3,3);
scene.add(directionalLight1);
scene.add(directionalLight1.target);
const directionalLight2 = new THREE.DirectionalLight(0xFFFAA5, 0.3);
directionalLight2.target.position.set(0,0,0);
directionalLight2.position.set(-3,0,-3);
scene.add(directionalLight2);
scene.add(directionalLight2.target);


let backdrop = document.querySelector('#backdrop');
let planetStateControl = document.querySelector('#planetStateControl');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.gammaOutput = true;
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = 'absolute';
document.body.insertBefore( renderer.domElement, planetStateControl);
renderer.setClearColor(0x000000, 0.0);


const planet = new THREE.SphereGeometry( 2, 80, 80 ); 
const materialPlanet = new THREE.MeshLambertMaterial( { color: '#31598C' } ); 
const spherePlanet = new THREE.Mesh( planet, materialPlanet ); 
const ocean = new THREE.SphereGeometry( 2.28, 80, 80 ); 
const materialOcean = new THREE.MeshLambertMaterial( { color: '#48D2FF', transparent:true, opacity:0.98 } ); 
const sphereOcean = new THREE.Mesh( ocean, materialOcean ); 

let defaultBackground = 'linear-gradient(45deg, rgb(255, 253, 232), rgb(211, 248, 255))';
// let defaultBackground = 'linear-gradient(45deg, rgb(0, 96, 41), rgb(0, 96, 41))';
document.body.style.background = defaultBackground;
let planetState = document.querySelector('#state');
let volcanoAnalytics = document.querySelector('#volcano');
let EimpactDrop = document.querySelector('#EimpactDrop');
let close = document.querySelector('#close');
let ner = document.querySelector('#ner');
let habitatNum = document.querySelector('#habitatNum');
let forestIcon = document.querySelector('#forestIcon');
let snowmountainIcon = document.querySelector('#snowmountainIcon');
let lakeIcon = document.querySelector('#lakeIcon');
let valleyIcon = document.querySelector('#valleyIcon');
let speciesNum = document.querySelector('#speciesNum');
let mammalNum = document.querySelector('#mammalNum');
let avesNum = document.querySelector('#avesNum');
let reptileNum = document.querySelector('#reptileNum');
let insectNum = document.querySelector('#insectNum');
let eventLabel = document.querySelector('#event');
let animalLabel = document.querySelector('#animalAction');
let podLabel = document.querySelector('#podAction');
let cc = document.querySelector('#cc');
let ccTip = document.querySelector('#ccTip');
let ccBuild = document.querySelector('#ccBuild');
let ccFinish = document.querySelector('#ccFinish');


speciesNum.style.marginLeft = '270px';
forestIcon.style.visibility = 'hidden';
snowmountainIcon.style.visibility = 'hidden';
lakeIcon.style.visibility = 'hidden';
valleyIcon.style.visibility = 'hidden';

const lowLevelAnimal = ['#B49A79', '#AC7C94', '#B1B178', '#BCA395', '#98C9B2', '#BDA6D3', '#A9C3D1', '#97BF96', '#8792B9', '#A391C6', '#7BB5BF'];
const highLevelAnimal = ['#D3FA20', '#F7B333', '#37BFFA', '#F741C6', '#21F5E5', '#23EF8A', '#B42BF0', '#F2F211', '#FF9F4D', '#5C62FF', '#F23082'];


// load game elements

let mixer = [];

const manager = new THREE.LoadingManager();



var geneticChangeloader = new THREE.TextureLoader();
var geneticChangeMaterial = new THREE.MeshBasicMaterial({
  map: geneticChangeloader.load('src/geneticChange.svg')
});
var geneticChangeGeometry = new THREE.SphereGeometry(0.05, 50, 50);
var geneticChangeMesh = new THREE.Mesh(geneticChangeGeometry, geneticChangeMaterial);
geneticChangeMesh.name = 'geneticChange';

var deadloader = new THREE.TextureLoader();
var deadMaterial = new THREE.MeshBasicMaterial({
  map: deadloader.load('src/dead.svg')
});
var deadGeometry = new THREE.SphereGeometry(0.05, 50, 50);
var deadMesh = new THREE.Mesh(deadGeometry, deadMaterial);
deadMesh.name = 'dead';

let geneticChange = [];
let dead = [];

function animalAction(){
	// Math.floor(Math.random()* (animals.length - 1))
	for(var i = 0; i < animals.length; i++){
		let copyGene = SkeletonUtils.clone(geneticChangeMesh);
		copyGene.position.set(animals[i].children[0].position.x *1.008, animals[i].children[0].position.y*1.008, animals[i].children[0].position.z*1.008);
		geneticChange.push(copyGene);
	}

	for(var j = 0; j < animals.length; j++){
		let copyDead = SkeletonUtils.clone(deadMesh);
		copyDead.userData.tag = j;
		copyDead.position.set(animals[j].children[0].position.x*1.008, animals[j].children[0].position.y*1.008, animals[j].children[0].position.z*1.008);
		dead.push(copyDead);
	}
}



let animals = [];
let animalMove = [];
let trees = [];
let wind = [];

const loader = new GLTFLoader(manager);
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/build/gltf/' );
loader.setDRACOLoader( dracoLoader );

dracoLoader.preload();

loader.load(
    'glb/manta.glb',
    function (gltf){
        const animal = gltf.scene;
		animal.visible = false;
        scene.add(animal);

		gltf.scene.animations = gltf.animations;
		animal.name = 'manta';
		animal.userData.level = 'epsilon';
		
		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		animal.getObjectByName('Sphere033').material.color.r = material.color.r;
		animal.getObjectByName('Sphere033').material.color.g = material.color.g;
		animal.getObjectByName('Sphere033').material.color.b = material.color.b;

		let animalMixer = new THREE.AnimationMixer( animal );
		mixer.push(animalMixer);
		const animalWalk = THREE.AnimationClip.findByName( gltf.animations, 'manta' );
		animalMove.push(animalMixer.clipAction(animalWalk));
		animals.push(animal);

    }
);

loader.load(
    'glb/flyingfish.glb',
    function (gltf){
        const animal = gltf.scene;
		animal.visible = false;
        scene.add(animal);

		gltf.scene.animations = gltf.animations;
		animal.name = 'flyingfish';
		animal.userData.level = 'epsilon';

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		animal.getObjectByName('Sphere032').material.color.r = material.color.r;
		animal.getObjectByName('Sphere032').material.color.g = material.color.g;
		animal.getObjectByName('Sphere032').material.color.b = material.color.b;

		let animalMixer = new THREE.AnimationMixer( animal );
		mixer.push(animalMixer);
		const animalWalk = THREE.AnimationClip.findByName( gltf.animations, 'flyingfish' );
		animalMove.push(animalMixer.clipAction(animalWalk));
		animals.push(animal);

    }
);

loader.load(
    'glb/dolphin.glb',
    function (gltf){
        const animal = gltf.scene;
		animal.visible = false;

		
		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		animal.getObjectByName('Dolphin001').material.color.r = material.color.r;
		animal.getObjectByName('Dolphin001').material.color.g = material.color.g;
		animal.getObjectByName('Dolphin001').material.color.b = material.color.b;


        scene.add(animal);

		gltf.scene.animations = gltf.animations;
		animal.name = 'dolphin';
		animal.userData.level = 'epsilon';

		let animalMixer = new THREE.AnimationMixer( animal );
		mixer.push(animalMixer);
		const animalWalk = THREE.AnimationClip.findByName( gltf.animations, 'dolphin' );
		animalMove.push(animalMixer.clipAction(animalWalk));
		animals.push(animal);


    }
);





// loader.load(
//     'glb/fox.glb',
//     function (gltf){
//         const animal = gltf.scene;
// 		animal.visible = false;

// 		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
// 		animal.getObjectByName('Fox001').material.color.r = material.color.r;
// 		animal.getObjectByName('Fox001').material.color.g = material.color.g;
// 		animal.getObjectByName('Fox001').material.color.b = material.color.b;


//         scene.add(animal);

// 		animal.animations = gltf.animations;
// 		animal.name = 'wolf';
// 		animal.userData.level = 'epsilon';
// 		animal.userData.continent = 'arctic';
// 		animals.push(animal);

// 		let animalMixer = new THREE.AnimationMixer( animal );
// 		mixer.push(animalMixer);
// 		const animalWalk = THREE.AnimationClip.findByName( gltf.animations, 'wolf' );
// 		animalMove.push(animalMixer.clipAction(animalWalk));
		


//     }
// );


loader.load(
    'glb/arcticAnimals.glb',
    function (gltf){
        const wolf = gltf.scene.getObjectByName('wolf');
		wolf.visible = false;
		const fox = gltf.scene.getObjectByName('fox');
		fox.visible = false;
		
		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		wolf.getObjectByName('Wolf001').material.color.r = material.color.r;
		wolf.getObjectByName('Wolf001').material.color.g = material.color.g;
		wolf.getObjectByName('Wolf001').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		fox.getObjectByName('Fox001').material.color.r = material.color.r;
		fox.getObjectByName('Fox001').material.color.g = material.color.g;
		fox.getObjectByName('Fox001').material.color.b = material.color.b;



		wolf.name = 'wolf';
		wolf.userData.level = 'epsilon';
		wolf.userData.continent = 'arctic';
		wolf.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'wolf' ));
		scene.add(wolf);

		let wolfMixer = new THREE.AnimationMixer( wolf );
		mixer.push(wolfMixer);
		const wolfWalk = THREE.AnimationClip.findByName( gltf.animations, 'wolf' );
		animalMove.push(wolfMixer.clipAction(wolfWalk));
		animals.push(wolf);

		fox.name = 'fox';
		fox.userData.level = 'epsilon';
		fox.userData.continent = 'arctic';
		fox.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'fox' ));
		scene.add(fox);

		let foxMixer = new THREE.AnimationMixer( fox );
		mixer.push(foxMixer);
		const foxWalk = THREE.AnimationClip.findByName( gltf.animations, 'fox' );
		animalMove.push(foxMixer.clipAction(foxWalk));
		animals.push(fox);

    }
);




loader.load(
    'glb/grasslandAnimals.glb',
    function (gltf){
        const cow = gltf.scene.getObjectByName('cow');
		cow.visible = false;
		const goat = gltf.scene.getObjectByName('goat');
		goat.visible = false;
        
		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		cow.getObjectByName('Sphere021').material.color.r = material.color.r;
		cow.getObjectByName('Sphere021').material.color.g = material.color.g;
		cow.getObjectByName('Sphere021').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		goat.getObjectByName('Sphere020').material.color.r = material.color.r;
		goat.getObjectByName('Sphere020').material.color.g = material.color.g;
		goat.getObjectByName('Sphere020').material.color.b = material.color.b;

		cow.name = 'cow';
		cow.userData.level = 'epsilon';
		cow.userData.continent = 'grassland';
		cow.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'cow' ));
		scene.add(cow);

		let cowMixer = new THREE.AnimationMixer( cow );
		mixer.push(cowMixer);
		const cowWalk = THREE.AnimationClip.findByName( gltf.animations, 'cow' );
		animalMove.push(cowMixer.clipAction(cowWalk));
		animals.push(cow);

		goat.name = 'goat';
		goat.userData.level = 'epsilon';
		goat.userData.continent = 'grassland';
		goat.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'goat' ));
		scene.add(goat);

		let goatMixer = new THREE.AnimationMixer( goat );
		mixer.push(goatMixer);
		const goatWalk = THREE.AnimationClip.findByName( gltf.animations, 'goat' );
		animalMove.push(goatMixer.clipAction(goatWalk));
		animals.push(goat);

    }
);





loader.load(
    'glb/desertAnimals.glb',
    function (gltf){
        const tiger = gltf.scene.getObjectByName('tiger');
		tiger.visible = false;
		const giraffe = gltf.scene.getObjectByName('giraffe');
		giraffe.visible = false;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		tiger.getObjectByName('Tiger002').material.color.r = material.color.r;
		tiger.getObjectByName('Tiger002').material.color.g = material.color.g;
		tiger.getObjectByName('Tiger002').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		giraffe.getObjectByName('Giraffe001').material.color.r = material.color.r;
		giraffe.getObjectByName('Giraffe001').material.color.g = material.color.g;
		giraffe.getObjectByName('Giraffe001').material.color.b = material.color.b;
        

		tiger.name = 'tiger';
		tiger.userData.level = 'epsilon';
		tiger.userData.continent = 'desert';
		tiger.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'tiger' ));
		scene.add(tiger);

		let tigerMixer = new THREE.AnimationMixer( tiger );
		mixer.push(tigerMixer);
		const tigerWalk = THREE.AnimationClip.findByName( gltf.animations, 'tiger' );
		animalMove.push(tigerMixer.clipAction(tigerWalk));
		animals.push(tiger);

		giraffe.name = 'giraffe';
		giraffe.userData.level = 'epsilon';
		giraffe.userData.continent = 'desert';
		giraffe.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'giraffe' ));
		scene.add(giraffe);

		let giraffeMixer = new THREE.AnimationMixer( giraffe );
		mixer.push(giraffeMixer);
		const giraffeWalk = THREE.AnimationClip.findByName( gltf.animations, 'giraffe' );
		animalMove.push(giraffeMixer.clipAction(giraffeWalk));
		animals.push(giraffe);

    }
);



loader.load(
    'glb/forestAnimals.glb',
    function (gltf){
        const paradise = gltf.scene.getObjectByName('paradise');
		paradise.visible = false;
		const hummingbird = gltf.scene.getObjectByName('hummingbird');
		hummingbird.visible = false;
		const eagle = gltf.scene.getObjectByName('eagle');
		eagle.visible = false;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		eagle.getObjectByName('Sphere023').material.color.r = material.color.r;
		eagle.getObjectByName('Sphere023').material.color.g = material.color.g;
		eagle.getObjectByName('Sphere023').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		hummingbird.getObjectByName('Sphere011').material.color.r = material.color.r;
		hummingbird.getObjectByName('Sphere011').material.color.g = material.color.g;
		hummingbird.getObjectByName('Sphere011').material.color.b = material.color.b;


		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						
		paradise.getObjectByName('Sphere024').material.color.r = material.color.r;
		paradise.getObjectByName('Sphere024').material.color.g = material.color.g;
		paradise.getObjectByName('Sphere024').material.color.b = material.color.b;
        

		paradise.name = 'paradise';
		paradise.userData.level = 'delta';
		paradise.userData.continent = 'forest';
		paradise.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'paradise' ));
		scene.add(paradise);

		let paradiseMixer = new THREE.AnimationMixer( paradise );
		mixer.push(paradiseMixer);
		const paradiseWalk = THREE.AnimationClip.findByName( gltf.animations, 'paradise' );
		animalMove.push(paradiseMixer.clipAction(paradiseWalk));
		animals.push(paradise);

		hummingbird.name = 'hummingbird';
		hummingbird.userData.level = 'delta';
		hummingbird.userData.continent = 'forest';
		hummingbird.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'hummingbird' ));
		scene.add(hummingbird);

		let hummingbirdMixer = new THREE.AnimationMixer(hummingbird );
		mixer.push(hummingbirdMixer);
		const hummingbirdWalk = THREE.AnimationClip.findByName( gltf.animations, 'hummingbird' );
		animalMove.push(hummingbirdMixer.clipAction(hummingbirdWalk));
		animals.push(hummingbird);


		eagle.name = 'eagle';
		eagle.userData.level = 'delta';
		eagle.userData.continent = 'forest';
		eagle.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'eagle' ));
		scene.add(eagle);

		let eagleMixer = new THREE.AnimationMixer( eagle );
		mixer.push(eagleMixer);
		const eagleWalk = THREE.AnimationClip.findByName( gltf.animations, 'eagle' );
		animalMove.push(eagleMixer.clipAction(eagleWalk));
		animals.push(eagle);

    }
);




loader.load(
    'glb/snowmountainAnimals.glb',
    function (gltf){
        const polarbear = gltf.scene.getObjectByName('polarbear');
		polarbear.visible = false;
		const squirrel = gltf.scene.getObjectByName('squirrel');
		squirrel.visible = false;
		const elephant = gltf.scene.getObjectByName('elephant');
		elephant.visible = false;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });			
		polarbear.getObjectByName('Sphere025').material.color.r = material.color.r;
		polarbear.getObjectByName('Sphere025').material.color.g = material.color.g;
		polarbear.getObjectByName('Sphere025').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });						
		squirrel.getObjectByName('Squirrel002').material.color.r = material.color.r;
		squirrel.getObjectByName('Squirrel002').material.color.g = material.color.g;
		squirrel.getObjectByName('Squirrel002').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });					
		elephant.getObjectByName('Elephant001').material.color.r = material.color.r;
		elephant.getObjectByName('Elephant001').material.color.g = material.color.g;
		elephant.getObjectByName('Elephant001').material.color.b = material.color.b;
        
        
        

		polarbear.name = 'polarbear';
		polarbear.userData.level = 'gamma';
		polarbear.userData.continent = 'snowmountain';
		polarbear.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'polarbear' ));
		scene.add(polarbear);

		let polarbearMixer = new THREE.AnimationMixer( polarbear );
		mixer.push(polarbearMixer);
		const polarbearWalk = THREE.AnimationClip.findByName( gltf.animations, 'polarbear' );
		animalMove.push(polarbearMixer.clipAction(polarbearWalk));
		animals.push(polarbear);

		squirrel.name = 'squirrel';
		squirrel.userData.level = 'gamma';
		squirrel.userData.continent = 'snowmountain';
		squirrel.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'squirrel' ));
		scene.add(squirrel);

		let squirrelMixer = new THREE.AnimationMixer(squirrel );
		mixer.push(squirrelMixer);
		const squirrelWalk = THREE.AnimationClip.findByName( gltf.animations, 'squirrel' );
		animalMove.push(squirrelMixer.clipAction(squirrelWalk));
		animals.push(squirrel);


		elephant.name = 'elephant';
		elephant.userData.level = 'gamma';
		elephant.userData.continent = 'snowmountain';
		elephant.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'elephant' ));
		scene.add(elephant);

		let elephantMixer = new THREE.AnimationMixer( elephant );
		mixer.push(elephantMixer);
		const elephantWalk = THREE.AnimationClip.findByName( gltf.animations, 'elephant' );
		animalMove.push(elephantMixer.clipAction(elephantWalk));
		animals.push(elephant);

    }
);




loader.load(
    'glb/lakeAnimals.glb',
    function (gltf){
        const lizard = gltf.scene.getObjectByName('lizard');
		lizard.visible = false;
		const frog = gltf.scene.getObjectByName('frog');
		frog.visible = false;
		const turtle = gltf.scene.getObjectByName('turtle');
		turtle.visible = false;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });					
		lizard.getObjectByName('Sphere026').material.color.r = material.color.r;
		lizard.getObjectByName('Sphere026').material.color.g = material.color.g;
		lizard.getObjectByName('Sphere026').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });					
		frog.getObjectByName('Sphere028').material.color.r = material.color.r;
		frog.getObjectByName('Sphere028').material.color.g = material.color.g;
		frog.getObjectByName('Sphere028').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });					
		turtle.getObjectByName('Sphere027').material.color.r = material.color.r;
		turtle.getObjectByName('Sphere027').material.color.g = material.color.g;
		turtle.getObjectByName('Sphere027').material.color.b = material.color.b;
        

		lizard.name = 'lizard';
		lizard.userData.level = 'beta';
		lizard.userData.continent = 'lake';
		lizard.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'lizard' ));
		scene.add(lizard);

		let lizardMixer = new THREE.AnimationMixer( lizard );
		mixer.push(lizardMixer);
		const lizardWalk = THREE.AnimationClip.findByName( gltf.animations, 'lizard' );
		animalMove.push(lizardMixer.clipAction(lizardWalk));
		animals.push(lizard);

		frog.name = 'frog';
		frog.userData.level = 'beta';
		frog.userData.continent = 'lake';
		frog.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'frog' ));
		scene.add(frog);

		let frogMixer = new THREE.AnimationMixer(frog );
		mixer.push(frogMixer);
		const frogWalk = THREE.AnimationClip.findByName( gltf.animations, 'frog' );
		animalMove.push(frogMixer.clipAction(frogWalk));
		animals.push(frog);


		turtle.name = 'turtle';
		turtle.userData.level = 'beta';
		turtle.userData.continent = 'lake';
		turtle.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'turtle' ));
		scene.add(turtle);

		let turtleMixer = new THREE.AnimationMixer( turtle );
		mixer.push(turtleMixer);
		const turtleWalk = THREE.AnimationClip.findByName( gltf.animations, 'turtle' );
		animalMove.push(turtleMixer.clipAction(turtleWalk));
		animals.push(turtle);

    }
);



loader.load(
    'glb/valleyAnimals.glb',
    function (gltf){
        const butterfly = gltf.scene.getObjectByName('butterfly');
		butterfly.visible = false;
		const bee = gltf.scene.getObjectByName('bee');
		bee.visible = false;
		const dragonfly = gltf.scene.getObjectByName('dragonfly');
		dragonfly.visible = false;
        
		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });					
		butterfly.getObjectByName('Sphere031').material.color.r = material.color.r;
		butterfly.getObjectByName('Sphere031').material.color.g = material.color.g;
		butterfly.getObjectByName('Sphere031').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });					
		bee.getObjectByName('Sphere030').material.color.r = material.color.r;
		bee.getObjectByName('Sphere030').material.color.g = material.color.g;
		bee.getObjectByName('Sphere030').material.color.b = material.color.b;

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });					
		dragonfly.getObjectByName('Sphere029').material.color.r = material.color.r;
		dragonfly.getObjectByName('Sphere029').material.color.g = material.color.g;
		dragonfly.getObjectByName('Sphere029').material.color.b = material.color.b;

		butterfly.name = 'butterfly';
		butterfly.userData.level = 'alpha';
		butterfly.userData.continent = 'valley';
		butterfly.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'butterfly' ));
		scene.add(butterfly);

		let butterflyMixer = new THREE.AnimationMixer( butterfly );
		mixer.push(butterflyMixer);
		const butterflyWalk = THREE.AnimationClip.findByName( gltf.animations, 'butterfly' );
		animalMove.push(butterflyMixer.clipAction(butterflyWalk));
		animals.push(butterfly);

		bee.name = 'bee';
		bee.userData.level = 'alpha';
		bee.userData.continent = 'valley';
		bee.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'bee' ));
		scene.add(bee);

		let beeMixer = new THREE.AnimationMixer(bee );
		mixer.push(beeMixer);
		const beeWalk = THREE.AnimationClip.findByName( gltf.animations, 'bee' );
		animalMove.push(beeMixer.clipAction(beeWalk));
		animals.push(bee);


		dragonfly.name = 'dragonfly';
		dragonfly.userData.level = 'alpha';
		dragonfly.userData.continent = 'valley';
		dragonfly.animations.push(THREE.AnimationClip.findByName( gltf.animations, 'dragonfly' ));
		scene.add(dragonfly);

		let dragonflyMixer = new THREE.AnimationMixer( dragonfly );
		mixer.push(dragonflyMixer);
		const dragonflyWalk = THREE.AnimationClip.findByName( gltf.animations, 'dragonfly' );
		animalMove.push(dragonflyMixer.clipAction(dragonflyWalk));
		animals.push(dragonfly);

    }
);









loader.load(
    'glb/treeForest.glb',
    function (gltf){
        const tree = gltf.scene;
		tree.visible = false;
        scene.add(tree);

		gltf.scene.animations = gltf.animations;
		tree.name = 'treeForest';
		

		for( var i = 0; i < tree.children.length; i++){
			let windMixer = new THREE.AnimationMixer( tree.children[i] );
			mixer.push(windMixer);
			const treeMove = gltf.animations[i];
			wind.push(windMixer.clipAction(treeMove));
			trees.push(tree);
		}


    }
);

loader.load(
    'glb/treeLake.glb',
    function (gltf){
        const tree = gltf.scene;
		tree.visible = false;
        scene.add(tree);

		gltf.scene.animations = gltf.animations;
		tree.name = 'treeLake';

		for( var i = 0; i < tree.children.length; i++){
			let windMixer = new THREE.AnimationMixer( tree.children[i] );
			mixer.push(windMixer);
			const treeMove = gltf.animations[i];
			wind.push(windMixer.clipAction(treeMove));
			trees.push(tree);
		}

    }
);

loader.load(
    'glb/treeValley.glb',
    function (gltf){
        const tree = gltf.scene;
		tree.visible = false;
        scene.add(tree);

		gltf.scene.animations = gltf.animations;
		tree.name = 'treeValley';

		for( var i = 0; i < tree.children.length; i++){
			let windMixer = new THREE.AnimationMixer( tree.children[i] );
			mixer.push(windMixer);
			const treeMove = gltf.animations[i];
			wind.push(windMixer.clipAction(treeMove));
			trees.push(tree);
		}

    }
);

loader.load(
    'glb/arctic.glb',
    function (gltf){
        const arcticGLB = gltf.scene;
		arcticGLB.name = 'arctic';
		arcticGLB.visible = false;
        scene.add(arcticGLB);
    }
);

loader.load(
    'glb/grassland.glb',
    function (gltf){
        const grasslandGLB = gltf.scene;
		grasslandGLB.name = 'grassland';
		grasslandGLB.visible = false;
        scene.add(grasslandGLB);

    }
);

loader.load(
    'glb/desert.glb',
    function (gltf){
        const desertGLB = gltf.scene;
		desertGLB.name = 'desert';
		desertGLB.visible = false;
        scene.add(desertGLB);

    }
);

loader.load(
    'glb/forest.glb',
    function (gltf){
        const forestGLB = gltf.scene;
		forestGLB.name = 'forest';
		forestGLB.visible = false;
        scene.add(forestGLB);

    }
);

loader.load(
    'glb/snowmountain.glb',
    function (gltf){
        const snowmountainGLB = gltf.scene;
		snowmountainGLB.name = 'snowmountain';
		snowmountainGLB.visible = false;
        scene.add(snowmountainGLB);
    }
);

loader.load(
    'glb/lake.glb',
    function (gltf){
        const lakeGLB = gltf.scene;
		lakeGLB.name = 'lake';
		lakeGLB.visible = false;
        scene.add(lakeGLB);
	}
);

loader.load(
    'glb/valley.glb',
    function (gltf){
        const valleyGLB = gltf.scene;
		valleyGLB.name = 'valley';
		valleyGLB.visible = false;
        scene.add(valleyGLB);
    }
);

let volcanoMixer;
let volcano;

loader.load(
    'glb/volcano.glb',
    function (gltf){
        const volcanoGLB = gltf.scene;
		volcanoGLB.name = 'volcano';
		volcanoGLB.visible = false;
        scene.add(volcanoGLB);

		gltf.scene.animations = gltf.animations;
		volcanoMixer = new THREE.AnimationMixer( volcanoGLB );
		mixer.push(volcanoMixer);
		volcano = gltf.animations;

    }
);

let hurricaneMixer;
let hurricane;

loader.load(
    'glb/hurricane.glb',
    function (gltf){
        const hurricaneGLB = gltf.scene;
		hurricaneGLB.name = 'hurricane';
		hurricaneGLB.visible = false;
        scene.add(hurricaneGLB);

		gltf.scene.animations = gltf.animations;
		hurricaneMixer = new THREE.AnimationMixer( hurricaneGLB );
		mixer.push(hurricaneMixer);
		const hurricaneclips = gltf.animations;

		const hurricaneClipAction = THREE.AnimationClip.findByName( hurricaneclips, 'Hurricane' );
		hurricane = hurricaneMixer.clipAction( hurricaneClipAction );
		

    }
);

let meteorstrikeMixer;
let meteorstrike;

loader.load(
    'glb/meteorstrike.glb',
    function (gltf){
        const meteorstrikeGLB = gltf.scene;
		meteorstrikeGLB.name = 'meteorstrike';
		meteorstrikeGLB.visible = false;
        scene.add(meteorstrikeGLB);

		gltf.scene.animations = gltf.animations;
		meteorstrikeMixer = new THREE.AnimationMixer( meteorstrikeGLB );
		mixer.push(meteorstrikeMixer);
		meteorstrike = gltf.animations;



    }
);




// Species growing

let babys = [];
let move = [];


function grow(){

		for(var i = 0; i < animals.length; i++){
			if(animals[i].name == 'fox'){
				scene.getObjectByName('arctic').add(animals[i]);
				for(var j = 0; j < 8; j++){

				var baby = SkeletonUtils.clone(animals[i]);
				
				baby.userData.continent = 'arctic';
				baby.name = 'fox';

				if(j <3){
					baby.userData.level = 'delta';
				} 

				if (2 < j < 6){
					baby.userData.level = 'gamma';
				}

				if (j == 6){
					baby.userData.level = 'beta';
				}
		
				if (j == 7){
					baby.userData.level = 'alpha';
				}

				var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
				var copyMaterial = baby.getObjectByName('Fox001').material.clone();
								
				copyMaterial.color.r = material.color.r;
				copyMaterial.color.g = material.color.g;
				copyMaterial.color.b = material.color.b;
		
				baby.getObjectByName('Fox001').material = copyMaterial;

				let babyMixer = new THREE.AnimationMixer( baby );
				mixer.push(babyMixer);
				const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'fox' );
				let babyAction = babyMixer.clipAction(babyWalk);
				babyAction.timeScale = Math.random()*0.8 + 1;
				babyAction.startAt = Math.random();
				animalMove.push(babyAction);
				
				babys.push(baby);
				scene.getObjectByName('arctic').add(baby);
				renderer.render( scene, camera );


				}

			


			} else if (animals[i].name == 'wolf'){
				scene.getObjectByName('arctic').add(animals[i]);
				for(var j = 0; j < 5; j++){
				var baby = SkeletonUtils.clone(animals[i]);

				baby.userData.continent = 'arctic';


				if(j < 2){
					baby.userData.level = 'delta';
				} 

				if (j == 2){
					baby.userData.level = 'gamma';
				}

				if (j == 3){
					baby.userData.level = 'beta';
				}
		
				if (j == 4){
					baby.userData.level = 'alpha';
				}

				var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
				var copyMaterial = baby.getObjectByName('Wolf001').material.clone();
								
				copyMaterial.color.r = material.color.r;
				copyMaterial.color.g = material.color.g;
				copyMaterial.color.b = material.color.b;
		
				baby.getObjectByName('Wolf001').material = copyMaterial;



				babys.push(baby);
				scene.getObjectByName('arctic').add(baby);
				renderer.render( scene, camera );

				let babyMixer = new THREE.AnimationMixer( baby );
				mixer.push(babyMixer);
				const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'wolf' );
				let babyAction = babyMixer.clipAction(babyWalk);
				babyAction.timeScale = Math.random()*0.8 + 1;
				babyAction.startAt = Math.random();
				animalMove.push(babyAction);

				}
				
				} else if (animals[i].name == 'cow'){
					scene.getObjectByName('grassland').add(animals[i]);
					for(var j = 0; j < 6; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						baby.name = 'cow' + j;

						if(j < 2){
							baby.userData.level = 'delta';
						} 
		
						if (2 < j <4){
							baby.userData.level = 'gamma';
						}
		
						if (j == 4){
							baby.userData.level = 'beta';
						}
				
						if (j == 5){
							baby.userData.level = 'alpha';
						}

				var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
				var copyMaterial = baby.getObjectByName('Sphere021').material.clone();
								
				copyMaterial.color.r = material.color.r;
				copyMaterial.color.g = material.color.g;
				copyMaterial.color.b = material.color.b;
		
				baby.getObjectByName('Sphere021').material = copyMaterial;

		

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'cow' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);
						
						babys.push(baby);
						scene.getObjectByName('grassland').add(baby);
						renderer.render( scene, camera );

						}

				} else if (animals[i].name == 'goat'){
					scene.getObjectByName('grassland').add(animals[i]);
					for(var j = 0; j < 5; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if(j < 2){
							baby.userData.level = 'delta';
						} 
		
						if (j == 2){
							baby.userData.level = 'gamma';
						}
		
						if (j == 3){
							baby.userData.level = 'beta';
						}
				
						if (j == 4){
							baby.userData.level = 'alpha';
						}

				var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
				var copyMaterial = baby.getObjectByName('Sphere020').material.clone();
								
				copyMaterial.color.r = material.color.r;
				copyMaterial.color.g = material.color.g;
				copyMaterial.color.b = material.color.b;
		
				baby.getObjectByName('Sphere020').material = copyMaterial;

				let babyMixer = new THREE.AnimationMixer( baby );
				mixer.push(babyMixer);
				const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'goat' );
				let babyAction = babyMixer.clipAction(babyWalk);
				babyAction.timeScale = Math.random()*0.8 + 1;
				babyAction.startAt = Math.random();
				animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('grassland').add(baby);
						renderer.render( scene, camera );



						}
				} else if (animals[i].name == 'tiger'){
					scene.getObjectByName('desert').add(animals[i]);
					for(var j = 0; j < 5; j++){
						var baby = SkeletonUtils.clone(animals[i]);

						if(j < 2){
							baby.userData.level = 'delta';
						} 
		
						if (j == 2){
							baby.userData.level = 'gamma';
						}
		
						if (j == 3){
							baby.userData.level = 'beta';
						}
				
						if (j == 4){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Tiger002').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Tiger002').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'tiger' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('desert').add(baby);
						renderer.render( scene, camera );

						}
				} else if (animals[i].name == 'giraffe'){
					scene.getObjectByName('desert').add(animals[i]);
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if(j == 0){
							baby.userData.level = 'delta';
						} 
		
						if (j == 1){
							baby.userData.level = 'gamma';
						}
		
						if (j == 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 3){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Giraffe001').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Giraffe001').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'giraffe' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('desert').add(baby);
						renderer.render( scene, camera );

						}
				} else if (animals[i].name == 'paradise'){
					scene.getObjectByName('forest').add(animals[i]);
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);

				
						if (j < 2){
							baby.userData.level = 'gamma';
						}
		
						if (j == 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 3){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere024').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere024').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'paradise' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('forest').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'eagle'){
					scene.getObjectByName('forest').add(animals[i]);
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);

						if (j == 0 ){
							baby.userData.level = 'gamma';
						}
		
						if (j == 1){
							baby.userData.level = 'beta';
						}
				
						if (j == 2){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere023').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere023').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'eagle' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('forest').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'hummingbird'){
					scene.getObjectByName('forest').add(animals[i]);
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if (j < 2 ){
							baby.userData.level = 'gamma';
						}
		
						if (j == 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 3){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere011').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere011').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'hummingbird' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);
						

						babys.push(baby);
						scene.getObjectByName('forest').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'elephant'){
					scene.getObjectByName('snowmountain').add(animals[i]);
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
					
						if (j < 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 2){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Elephant001').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Elephant001').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'elephant' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('snowmountain').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'squirrel'){
					scene.getObjectByName('snowmountain').add(animals[i]);
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
					
						if (j < 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 2){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Squirrel002').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Squirrel002').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'squirrel' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('snowmountain').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'polarbear'){
					scene.getObjectByName('snowmountain').add(animals[i]);
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if (j < 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 2){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere025').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere025').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'polarbear' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('snowmountain').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'lizard'){
					scene.getObjectByName('lake').add(animals[i]);
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						
						if (j > 0){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere026').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere026').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'lizard' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('lake').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'frog'){
					scene.getObjectByName('lake').add(animals[i]);
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if (j > 1){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere028').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere028').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'frog' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('lake').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'turtle'){
					scene.getObjectByName('lake').add(animals[i]);
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if (j > 0){
							baby.userData.level = 'alpha';
						}

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere027').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere027').material = copyMaterial;

						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'turtle' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('lake').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'butterfly'){
					scene.getObjectByName('valley').add(animals[i]);
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere031').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere031').material = copyMaterial;
						
						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'butterfly' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('valley').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'bee'){
					scene.getObjectByName('valley').add(animals[i]);
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere030').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere030').material = copyMaterial;
						
						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'bee' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('valley').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'dragonfly'){
					scene.getObjectByName('valley').add(animals[i]);
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);

						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere029').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere029').material = copyMaterial;
						
						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'dragonfly' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						babys.push(baby);
						scene.getObjectByName('valley').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'manta'){
					for(var j = 0; j < 7; j++){
						var baby = SkeletonUtils.clone(animals[i]);

						
						var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
						var copyMaterial = baby.getObjectByName('Sphere033').material.clone();
										
						copyMaterial.color.r = material.color.r;
						copyMaterial.color.g = material.color.g;
						copyMaterial.color.b = material.color.b;
				
						baby.getObjectByName('Sphere033').material = copyMaterial;

						if(j < 3 ){
							baby.userData.level = 'delta';
						} 
		
						if (2< j <5){
							baby.userData.level = 'gamma';
						}
		
						if (j == 5){
							baby.userData.level = 'beta';
						}
				
						if (j == 6){
							baby.userData.level = 'alpha';
						}
						
						baby.rotation.x = Math.random()*0.3 + 0.1;
						baby.rotation.z = Math.random()*1.3;
						baby.rotation.y = Math.random()*0.6-0.3;

						babys.push(baby);
						scene.add(baby);


				let babyMixer = new THREE.AnimationMixer( baby );
				mixer.push(babyMixer);
				const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'manta' );
				let babyAction = babyMixer.clipAction(babyWalk);
				babyAction.timeScale = Math.random()*0.8 + 1;
				babyAction.startAt = Math.random();
				animalMove.push(babyAction);

						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'flyingfish'){
					for(var j = 0; j < 6; j++){
						var baby = SkeletonUtils.clone(animals[i]);

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
		var copyMaterial = baby.getObjectByName('Sphere032').material.clone();
						
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;

		baby.getObjectByName('Sphere032').material = copyMaterial;

						if(j < 2 ){
							baby.userData.level = 'delta';
						} 
		
						if ( 1 < j < 4){
							baby.userData.level = 'gamma';
						}
		
						if (j == 4){
							baby.userData.level = 'beta';
						}
				
						if (j == 5){
							baby.userData.level = 'alpha';
						}

						baby.rotation.x = Math.random()*0.6;
						baby.rotation.z = Math.random()*0.8 - 0.2;
						baby.rotation.y = Math.random()*0.8 - 0.2;

						babys.push(baby);
						scene.add(baby);


				let babyMixer = new THREE.AnimationMixer( baby );
				mixer.push(babyMixer);
				const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'flyingfish' );
				let babyAction = babyMixer.clipAction(babyWalk);
				babyAction.timeScale = Math.random()*0.8 + 1;
				babyAction.startAt = Math.random();
				animalMove.push(babyAction);

						renderer.render( scene, camera );
						}
				} else {
					for(var j = 0; j < 8; j++){
						var baby = SkeletonUtils.clone(animals[i]);

		var material = new THREE.MeshLambertMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
		var copyMaterial = baby.getObjectByName('Dolphin001').material.clone();
						
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;

		baby.getObjectByName('Dolphin001').material = copyMaterial;

						if(j < 3 ){
							baby.userData.level = 'delta';
						} 
		
						if (2< j <6){
							baby.userData.level = 'gamma';
						}
		
						if (j == 6){
							baby.userData.level = 'beta';
						}
				
						if (j == 7){
							baby.userData.level = 'alpha';
						}

						baby.rotation.x = Math.random()*0.3;
						baby.rotation.z = Math.random()*0.3;
						baby.rotation.y = Math.random()*1.3;
						
						babys.push(baby);
						scene.add(baby);


						let babyMixer = new THREE.AnimationMixer( baby );
						mixer.push(babyMixer);
						const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'dolphin' );
						let babyAction = babyMixer.clipAction(babyWalk);
						babyAction.timeScale = Math.random()*0.8 + 1;
						babyAction.startAt = Math.random();
						animalMove.push(babyAction);

						renderer.render( scene, camera );
						}
				}
			}
		
	
			animals = animals.concat(babys);
	
		for(var p = 0; p < animals.length; p++){
			var newPosition = [];
			newPosition.push(Math.random() * 15);
			newPosition.push(Math.random() * 15);
			newPosition.push(-Math.random() * 5);
			move.push(newPosition);
		}
		

}




// Natural events
let earthquakeSound = new Audio('mp3/earthquake.mp3');
let earthquakeStarted = false;

function earthquakeStart(){
	eventLabel.setAttribute("src", "src/earthquake.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/earthquakeDead.svg");
	animalLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(41, 64, 46), rgb(68, 60, 26))';

	earthquakeStarted = true;

	
		earthquakeSound.play();
	
	

	
	for(var aa = 0; aa < 2; aa++){
		let a = Math.floor(Math.random()*(animalE.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalE[a].name == 'flyingfish' || animalE[a].name == 'dolphin' || animalE[a].name == 'manta') {
			var parentNum = animalE[a].children.length - 1;
			var mutant = animalE[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalE[a].children;
			var num = mutant.length - 1;
		}
		
		animalE[a].visible = false;
		
		dead[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(dead[aa]);

	}


}
function earthquakeStop(){
	let count = 15;
	let timer = setInterval(function () {
	count--;
	if (count < 0) {
		earthquakeSound.pause();
		earthquakeSound.load();
		earthquakeStarted = false;
		eventLabel.style.visibility = 'hidden'; 
		animalLabel.style.visibility = 'hidden'; 
		clearInterval(timer);
		document.body.style.background = defaultBackground;
		
		sphereOcean.position.x = 0;
		sphereOcean.position.y = 0;
		sphereOcean.position.z = 0;
		scene.getObjectByName("arctic").position.x = 0;
		scene.getObjectByName("arctic").position.y = 0;
		scene.getObjectByName("arctic").position.z = 0;
		scene.getObjectByName("grassland").position.x = 0;
		scene.getObjectByName("grassland").position.y = 0;
		scene.getObjectByName("grassland").position.z = 0;
		scene.getObjectByName("desert").position.x = 0;
		scene.getObjectByName("desert").position.y = 0;
		scene.getObjectByName("desert").position.z = 0;
		scene.getObjectByName("volcano").position.x = 0;
		scene.getObjectByName("volcano").position.y = 0;
		scene.getObjectByName("volcano").position.z = 0;

		
		for(var aa = 0; aa < 2; aa++){
			scene.remove(scene.getObjectByName('dead'));
		}

	}

}, 1000);
}

	// hurricane

	let hurricaneSound = new Audio('mp3/hurricane.mp3');
	function hurricaneStart(){
	eventLabel.setAttribute("src", "src/hurricane.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/hurricaneDead.svg");
	animalLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(61, 39, 80), rgb(47, 63, 114))';

	scene.getObjectByName("hurricane").visible = true;
	hurricane.play();
	hurricaneSound.play();

	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	console.log(animalgroup);
	for(var aa = 0; aa < 8; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}

		
		animalgroup[a].visible = false;
		
		dead[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(dead[aa]);

	}

	}

	function hurricaneStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
			hurricane.stop();
			scene.getObjectByName("hurricane").visible = false;
			hurricaneSound.pause();
			hurricaneSound.load();
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;

			for(var aa = 0; aa < 8; aa++){
				scene.remove(scene.getObjectByName('dead'));
			}
			
		}
	}, 1000);
	}

	// volcano eruption
	let volcanoSound = new Audio('mp3/volcano.mp3');
	function volcanoStart(){
	eventLabel.setAttribute("src", "src/volcano.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/volcanoDead.svg");
	animalLabel.style.visibility = 'visible'; 
	EimpactDrop.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(163, 131, 107), rgb(201, 101, 86))';


	scene.fog = new THREE.FogExp2( 0xCE4A21, 0.15 );

	volcanoSound.play();

	volcano.forEach( function ( clip ) {
		volcanoMixer.clipAction( clip ).play();
	} );

	
	
	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var g = 0; g < animalG.length; g++){
		animalgroup.push(animalG[g]);
	}
	for(var aa = 0; aa < 20; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}
		
		animalgroup[a].visible = false;
		
		dead[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(dead[aa]);

	}



	}

	function volcanoStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
			volcano.forEach( function ( clip ) {
				volcanoMixer.clipAction( clip ).stop();
			} );
			volcanoSound.pause();
			volcanoSound.load();
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			EimpactDrop.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;

			scene.fog = null;

			for(var aa = 0; aa < 20; aa++){
				scene.remove(scene.getObjectByName('dead'));
			}
			
	
		}
	}, 1000);
	}
	

	// wildfire
let wildfireSound = new Audio('mp3/rain.mp3');
let wildFire = [];

var fireMaterial = new THREE.ShaderMaterial( { 
	vertexShader:`
	uniform float uTime;
	varying vec3 vPosition;
	varying vec2 vUV;

vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0; 
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z); 

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

	void main(){

		vPosition =  vec3(position.x * 0.8, position.y * snoise(position)* 2.8, position.z * 0.8) * normal * snoise(normal) *2.2;
		vPosition.y += sin(uTime)*1.5;
		vUV = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
	}


	`,

	fragmentShader:`
	varying vec3 vPosition;
	varying vec2 vUV; 


	vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0; 
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z); 

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}


	void main(){
		gl_FragColor = vec4(0.7, 0.8 * vPosition.y * 8.5, 0.13, 0.8);
	}
	
	`,

			
} ); 

fireMaterial.uniforms.uTime = {value : 0};
var startFire;
var timeElapsed;
var fireStarted = false;

function wildfireStart(){
	document.body.style.background = 'linear-gradient(45deg, rgb(98, 74, 51), rgb(70, 34, 29))';
	eventLabel.setAttribute("src", "src/wildfire.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/wildfireDead.svg");
	animalLabel.style.visibility = 'visible'; 

	ambientLight.intensity = 0.5;
	scene.remove(directionalLight1);
	scene.remove(directionalLight2);
	scene.remove(hemisphereLight);
	fireStarted = true;

  for(var i = 0; i < 10; i++){
	var fire = new THREE.SphereGeometry( .2, 150, 150 ); 
	  
    var fireball = new THREE.Mesh( fire, fireMaterial ); 
	fireball.position.x = Math.random()*2.3 * 2 - 2.3;
	fireball.position.y = Math.random()*2.3 * 2 - 2.3;
	fireball.position.z = Math.sqrt(Math.pow(2.3, 2)-Math.pow(fireball.position.x, 2)-Math.pow(fireball.position.y, 2)) * Math.sign(Math.random()*2-1);
	
	wildFire.push(fireball);
	scene.add(fireball);
  }
  scene.fog = new THREE.FogExp2( 0xBE6D58, 0.2 );

  wildfireSound.play();

  
  var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var g = 0; g < animalG.length; g++){
		animalgroup.push(animalG[g]);
	}
	for(var b = 0; b < animalB.length; b++){
		animalgroup.push(animalB[b]);
	}
	for(var aa = 0; aa < 5; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}
		
		animalgroup[a].visible = false;
		
		dead[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(dead[aa]);

	}

	startFire = new Date();


}

function wildfireStop(){
	let count = 15;
	let timer = setInterval(function () {

	count--;


	if (count < 0) {
		eventLabel.style.visibility = 'hidden'; 
		animalLabel.style.visibility = 'hidden'; 

		ambientLight.intensity = 0.7;
		scene.add(directionalLight1);
		scene.add(directionalLight2);
		scene.add(hemisphereLight);

		fireStarted = false;

		for(var i = 0; i < 10; i++){
			scene.remove(wildFire[i]);
		}
		scene.fog = null;
		wildfireSound.pause();
		wildfireSound.load();
		clearInterval(timer);
		document.body.style.background = defaultBackground;

		for(var aa = 0; aa < 5; aa++){
			scene.remove(scene.getObjectByName('dead'));
		}

	}

}, 1000);
}

	// meteorstrike
	
	let meteorstrikeSound = new Audio('mp3/meteorstrike.mp3');
	function meteorstrikeStart(){
	eventLabel.setAttribute("src", "src/meteorstrike.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/meteorstrikeDead.svg");
	animalLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(4, 44, 12), rgb(11, 20, 83))';

	ambientLight.intensity = 0.5;
	scene.remove(directionalLight1);
	scene.remove(directionalLight2);
	scene.remove(hemisphereLight);

	scene.getObjectByName("meteorstrike").visible = true;

	meteorstrikeSound.play();

	meteorstrike.forEach( function ( clip ) {
		meteorstrikeMixer.clipAction( clip ).play();
	} );

	
	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var g = 0; g < animalG.length; g++){
		animalgroup.push(animalG[g]);
	}
	for(var b = 0; b < animalB.length; b++){
		animalgroup.push(animalB[b]);
	}
	for(var aaa = 0; aaa < animalA.length; aaa++){
		animalgroup.push(animalA[aaa]);
	}
	for(var aa = 0; aa < 8; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}
		
		animalgroup[a].visible = false;
		
		dead[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(dead[aa]);

	}
	

	}

	function meteorstrikeStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
			scene.getObjectByName("meteorstrike").visible = false;

			ambientLight.intensity = 0.7;
		scene.add(directionalLight1);
		scene.add(directionalLight2);
		scene.add(hemisphereLight);


			meteorstrike.forEach( function ( clip ) {
				meteorstrikeMixer.clipAction( clip ).stop();
			} );
			meteorstrikeSound.pause();
			meteorstrikeSound.load();
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;

			for(var aa = 0; aa < 8; aa++){
				scene.remove(scene.getObjectByName('dead'));
			}

		}
	}, 1000);
	}


// Weather events

	// Sandstorm
	let sandstormSound = new Audio('mp3/sandstorm.mp3');
	let sandstorming;
	let sandGroup = new THREE.Geometry();
	let sandCoordinate = [];
	let coordinateCount = 0;
	let sandstormStarted = false;
	function sandstormStart(){
	eventLabel.setAttribute("src", "src/sandstorm.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/sandstormGeneticChange.svg");
	animalLabel.style.visibility = 'visible'; 
	podLabel.setAttribute("src", "src/podActionSandstorm.svg");
	podLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(193, 193, 178), rgb(212, 192, 147))';

	
	sandstormSound.play();

	scene.fog = new THREE.FogExp2( 0xC29460, 0.3 );

	sandstormStarted = true;
	let sand;
    let x;
    let y;
    let z;

    for (var i = 0; i < 10000; i++){

		x = Math.floor(Math.random()*160)-80;
		y = Math.floor(Math.random()*160)-80;
		z = Math.floor(Math.random()*160)-80;
    

    sand = new THREE.Vector3(x, y, z);
    sandGroup.vertices.push(sand);
	sandCoordinate.push(Object.assign({}, sand));
    }
    
    let sandMaterial = new THREE.PointsMaterial({color: 0xBC952C, size: 0.2});
    sandstorming = new THREE.Points(sandGroup, sandMaterial);
    scene.add(sandstorming);

	for(var aa = 0; aa < 4; aa++){
		let a = Math.floor(Math.random()*(animalE.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalE[a].name == 'flyingfish' || animalE[a].name == 'dolphin' || animalE[a].name == 'manta') {
			var parentNum = animalE[a].children.length - 1;
			var mutant = animalE[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalE[a].children;
			var num = mutant.length - 1;
		}

		
		var copyMaterial = mutant[num].material.clone();
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;
		mutant[ mutant.length - 1].material = copyMaterial;

		geneticChange[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(geneticChange[aa]);

	}


	}

	function sandstormStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {

			for(var aa = 0; aa < 4; aa++){
				scene.remove(scene.getObjectByName('geneticChange'));
			}

			sandstormSound.pause();
			sandstormSound.load();
			sandstormStarted = false;
			scene.fog = null;
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			podLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;

			sandGroup.vertices.forEach(function(a){
				a.y = Math.floor(Math.random()*160)-80;
			});
			coordinateCount = 0;
			sandGroup.verticesNeedUpdate = true;
			scene.remove(sandstorming);
		}
	}, 1000);
	}

	// Snow
	let snowSound = new Audio('mp3/snow.mp3');
	let snowing;
	let snowGroup = new THREE.Geometry();
	let snowStarted = false;
	function snowStart(){
	eventLabel.setAttribute("src", "src/snow.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/snowGeneticChange.svg");
	animalLabel.style.visibility = 'visible'; 
	podLabel.setAttribute("src", "src/podActionSnow.svg");
	podLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(171, 158, 165), rgb(128, 157, 208))';

	snowStarted = true;
	let snowflake;
    let x;
    let y;
    let z;

    for (var i = 0; i < 10000; i++){

    x = Math.floor(Math.random()*160)-80;
    y = Math.floor(Math.random()*160)-80 + 60;
    z = Math.floor(Math.random()*160)-80;
    
    if(Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2)) < 30){
        x += Math.floor(Math.random()*20)+20;
        y += Math.floor(Math.random()*20)+20;
        z += Math.floor(Math.random()*20)+20;
    }

    snowflake = new THREE.Vector3(x, y, z);
    snowGroup.vertices.push(snowflake);
    }
    
    let snowMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.2});
    snowing = new THREE.Points(snowGroup, snowMaterial);
    scene.add(snowing);
	
	snowSound.play();


	
	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var aa = 0; aa < 8; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}

		
		var copyMaterial = mutant[num].material.clone();
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;
		mutant[ mutant.length - 1].material = copyMaterial;
		
		geneticChange[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(geneticChange[aa]);

	}


	}

	function snowStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
		
			for(var aa = 0; aa < 8; aa++){
				scene.remove(scene.getObjectByName('geneticChange'));
			}

			snowSound.pause();
			snowSound.load();
			snowStarted = false;
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			podLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;

			snowGroup.vertices.forEach(function(a){
				a.y = Math.floor(Math.random()*160)-80;
			});
			snowGroup.verticesNeedUpdate = true;
			scene.remove(snowing);
			scene.remove(scene.getObjectByName('geneticChange'));

		}
	}, 1000);
	}

	// rain
	let rainSound = new Audio('mp3/rain.mp3');
	let raining;
	let rainGroup = new THREE.Geometry();
	let rainStarted = false;

	function rainStart(){
	eventLabel.setAttribute("src", "src/rain.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/rainGeneticChange.svg");
	animalLabel.style.visibility = 'visible'; 
	podLabel.setAttribute("src", "src/podActionRain.svg");
	podLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(181, 165, 154), rgb(142, 193, 204))';

	rainStarted = true;
	let rainDrops;
    let x;
    let y;
    let z;


	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var g = 0; g < animalG.length; g++){
		animalgroup.push(animalG[g]);
	}
	for(var aa = 0; aa < 7; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}
		
		var copyMaterial = mutant[num].material.clone();
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;
		mutant[ mutant.length - 1].material = copyMaterial;
		
		geneticChange[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(geneticChange[aa]);

	}


    for (var i = 0; i < 10000; i++){

    x = Math.floor(Math.random()*160)-80;
    y = Math.floor(Math.random()*160)-80 + 60;
    z = Math.floor(Math.random()*160)-80;
    
    if(Math.sqrt(Math.pow(x,2)+Math.pow(y,2)+Math.pow(z,2)) < 30){
        x += Math.floor(Math.random()*20)+20;
        y += Math.floor(Math.random()*20)+20;
        z += Math.floor(Math.random()*20)+20;
    }

    rainDrops = new THREE.Vector3(x, y, z);
    rainGroup.vertices.push(rainDrops);
    }
    
    let rainMaterial = new THREE.PointsMaterial({color: 0xcccccc, size: 0.2});
    raining = new THREE.Points(rainGroup, rainMaterial);
    scene.add(raining);

	rainSound.play();



	}

	function rainStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
			rainStarted = false;

			for(var aa = 0; aa < 7; aa++){
				scene.remove(scene.getObjectByName('geneticChange'));
			}

			rainSound.pause();
			rainSound.load();
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			podLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;

			rainGroup.vertices.forEach(function(a){
				a.y = Math.floor(Math.random()*160)-80;
			});
			rainGroup.verticesNeedUpdate = true;
			scene.remove(raining);


		}
	}, 1000);
	}

	// wind
	let windSound = new Audio('mp3/wind.mp3');

	

	function windStart(){
	eventLabel.setAttribute("src", "src/wind.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/windGeneticChange.svg");
	animalLabel.style.visibility = 'visible'; 
	podLabel.setAttribute("src", "src/podActionWind.svg");
	podLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(223, 219, 247), rgb(234, 255, 246))';

	windSound.play();


	for (var ab = 0; ab < wind.length; ab++){
		wind[ab].play();
	}

	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var g = 0; g < animalG.length; g++){
		animalgroup.push(animalG[g]);
	}
	for(var b = 0; b < animalB.length; b++){
		animalgroup.push(animalB[b]);
	}
	for(var aa = 0; aa < 9; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}
		
		var copyMaterial = mutant[num].material.clone();
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;
		mutant[ mutant.length - 1].material = copyMaterial;
		
		geneticChange[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(geneticChange[aa]);

	}
	


	}

	function windStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
		
			for (var ab = 0; ab < wind.length; ab++){
				wind[ab].stop();
			}
			
			for(var aa = 0; aa < 9; aa++){
				scene.remove(scene.getObjectByName('geneticChange'));
			}
			

			for(var i = 0; i < scene.getObjectByName('Forest').children.length; i++){
				if(scene.getObjectByName('Forest').children[i].type == "Object3D"){
					scene.getObjectByName('Forest').children[i].visible = false;
				}
				
			}

			for(var i = 0; i < scene.getObjectByName('Lake').children.length; i++){
				if(scene.getObjectByName('Lake').children[i].type == "Object3D"){
					scene.getObjectByName('Lake').children[i].visible = false;
				}
				
			}

			windSound.pause();
			windSound.load();
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			podLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;
		}
	}, 1000);
	}

	// sun 0xFFFEDE

	let sunSound = new Audio('mp3/sun.mp3');
	const sunlight = new THREE.SpotLight(0xFFED88, 0.8, 5, Math.PI / 2, 0.8, 1);
	sunlight.target.position.set(0,0,0);
	sunlight.position.set(3,3,3);
	let sunshine = false;
	let sunCount = 0.0;
	let sunCountY = 0.0;
	let sunflip = false;

	function sunStart(){
	eventLabel.setAttribute("src", "src/sun.svg");
	eventLabel.style.visibility = 'visible'; 
	animalLabel.setAttribute("src", "src/sunGeneticChange.svg");
	animalLabel.style.visibility = 'visible'; 
	podLabel.setAttribute("src", "src/podActionSun.svg");
	podLabel.style.visibility = 'visible'; 
	document.body.style.background = 'linear-gradient(45deg, rgb(255, 223, 163), rgb(255, 198, 235))';

	ambientLight.intensity = 0.9;
	scene.remove(directionalLight1);
	scene.remove(directionalLight2);
	scene.remove(hemisphereLight);


	sunshine = true;
	scene.add(sunlight);
	scene.add(sunlight.target);


	sunSound.play();


	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var g = 0; g < animalG.length; g++){
		animalgroup.push(animalG[g]);
	}
	for(var b = 0; b < animalB.length; b++){
		animalgroup.push(animalB[b]);
	}
	for(var aaa = 0; aaa < animalA.length; aaa++){
		animalgroup.push(animalA[aaa]);
	}
	for(var aa = 0; aa < 7; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}
		
		var copyMaterial = mutant[num].material.clone();
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;
		mutant[ mutant.length - 1].material = copyMaterial;
		
		geneticChange[aa].position.set(mutant[0].position.x *1.008, mutant[0].position.y*1.008, mutant[0].position.z*1.008);
		scene.add(geneticChange[aa]);

	}

	}

	function sunStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
			sunshine = false;
			scene.remove(sunlight);

		ambientLight.intensity = 0.7;
		scene.add(directionalLight1);
		scene.add(directionalLight2);
		scene.add(hemisphereLight);

			sunSound.pause();
			sunSound.load();
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			podLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;
			sunCount = 0.0;


			for(var aa = 0; aa < 7; aa++){
				scene.remove(scene.getObjectByName('geneticChange'));
			}


	cc.style.visibility = 'visible';
	ccBuild.style.visibility = 'visible';

		}
	}, 1000);
	}


let loadingEnd = document.querySelector('#loading');
planetStateControl.disable = true;

let continents = [];
let animalE = [];
let animalD = [];
let animalG = [];
let animalB = [];
let animalA = [];
var rotateSpeed = 0.01;

manager.onLoad = function ( ) {
	loadingEnd.style.display = 'none';
	scene.add( spherePlanet );
	scene.add( sphereOcean );
	scene.getObjectByName("arctic").visible = true;
	scene.getObjectByName("grassland").visible = true;
	scene.getObjectByName("desert").visible = true;
	scene.getObjectByName("forest").visible = false;
	scene.getObjectByName("snowmountain").visible = false;
	scene.getObjectByName("lake").visible = false;
	scene.getObjectByName("valley").visible = false;
	scene.getObjectByName("volcano").visible = true;
	planetStateControl.disable = false;


	grow();



	for(var i = 0; i < animals.length; i++){
		if(animals[i].userData.level == 'epsilon'){
			animals[i].visible = true;
			animalE.push(animals[i]);
		}
		if(animals[i].userData.level == 'delta'){
			animals[i].visible = false;
			animalD.push(animals[i]);
		}
		if(animals[i].userData.level == 'gamma'){
			animals[i].visible = false;
			animalG.push(animals[i]);
		} 
		if (animals[i].userData.level == 'beta'){
			animals[i].visible = false;
			animalB.push(animals[i]);
		} 
		if(animals[i].userData.level == 'alpha'){
			animals[i].visible = false;
			animalA.push(animals[i]);
		}
	}

	var animalgroup = [];
	for(var e = 0; e < animalE.length; e++){
		animalgroup.push(animalE[e]);
	}
	for(var d = 0; d < animalD.length; d++){
		animalgroup.push(animalD[d]);
	}
	for(var g = 0; g < animalG.length; g++){
		animalgroup.push(animalG[g]);
	}
	for(var b = 0; b < animalB.length; b++){
		animalgroup.push(animalB[b]);
	}
	for(var Aa = 0; Aa < animalA.length; Aa++){
		animalgroup.push(animalA[Aa]);
	}
	for(var aa = 0; aa < 30; aa++){
		let a = Math.floor(Math.random()*(animalgroup.length - 1));
		var material = new THREE.MeshLambertMaterial({ color: highLevelAnimal[Math.floor(Math.random()*(highLevelAnimal.length - 1))] });
		if(animalgroup[a].name == 'flyingfish' || animalgroup[a].name == 'dolphin' || animalgroup[a].name == 'manta') {
			var parentNum = animalgroup[a].children.length - 1;
			var mutant = animalgroup[a].children[parentNum].children;
			var num = mutant.length - 1;
		} else {
			var mutant = animalgroup[a].children;
			var num = mutant.length - 1;
		}
		
		var copyMaterial = mutant[num].material.clone();
		copyMaterial.color.r = material.color.r;
		copyMaterial.color.g = material.color.g;
		copyMaterial.color.b = material.color.b;
		mutant[ mutant.length - 1].material = copyMaterial;
		

	}

	for(var i=0; i < animalMove.length; i++){
		animalMove[i].play();
	}

	// for(var m = 0; m < animals.length; m++){
	// 	animals[m].visible = true;
	// }



	animalAction();


	for(var n = 0; n < trees.length; n++){
		if(trees[n].name == 'treeForest'){
			trees[n].visible = true;
		} else if (trees[n].name == 'treeLake'){
			trees[n].visible = true;
		} else {
			trees[n].visible = true;
		}
	}

 continents.push(scene.getObjectByName("arctic").children);
 continents.push(scene.getObjectByName("grassland").children);
 continents.push(scene.getObjectByName("desert").children);
 continents.push(scene.getObjectByName("forest").children);
 continents.push(scene.getObjectByName("snowmountain").children);
 continents.push(scene.getObjectByName("lake").children);
 continents.push(scene.getObjectByName("valley").children);

 	
	scene.getObjectByName("forest").add(scene.getObjectByName("treeForest"));
	scene.getObjectByName("lake").add(scene.getObjectByName("treeLake"));
	scene.getObjectByName("valley").add(scene.getObjectByName("treeValley"));



// 	let count = 10;
// 	let timer = setInterval(function () {
// 	count--;

	
// 	if(count == 7){
// 		rotateSpeed = 0.2;
// 	}
	
// 	if(count == 6){
// 		rotateSpeed = 0.07;
// 		planetState.setAttribute("src", "src/beta.svg");
// 		volcanoAnalytics.setAttribute("src", "src/volcanoBeta.svg");
// 		ner.textContent = '3';
// 		habitatNum.textContent = '6';
// 		forestIcon.style.visibility = 'visible';
// 		snowmountainIcon.style.visibility = 'visible';
// 		lakeIcon.style.visibility = 'visible';
// 		valleyIcon.style.visibility = 'hidden';
// 		speciesNum.textContent = '18';
// 		speciesNum.style.marginLeft = '263px';
// 		mammalNum.textContent = '9';
// 		avesNum.textContent = '3';
// 		reptileNum.textContent = '3';
// 		insectNum.textContent = '0';
// 		scene.getObjectByName("lake").visible = true;
// 		for(var i = 0; i < animals.length; i++){
// 			if (animals[i].userData.level == 'beta'){
// 				animals[i].visible = true;
// 			} 
// 		}
// 	}

// 	if (count == 5){
// 		rotateSpeed = 0.05;
// 	}

// 	if (count == 4){
// 		rotateSpeed = 0.03;
// 	}

// 	if(count == 3){
// 		rotateSpeed = 0.01;
// 		planetState.setAttribute("src", "src/alpha.svg");
// 		volcanoAnalytics.setAttribute("src", "src/volcanoAlpha.svg");
// 		ner.textContent = '2';
// 		habitatNum.textContent = '7';
// 		forestIcon.style.visibility = 'visible';
// 		snowmountainIcon.style.visibility = 'visible';
// 		lakeIcon.style.visibility = 'visible';
// 		valleyIcon.style.visibility = 'visible';
// 		speciesNum.textContent = '21';
// 		speciesNum.style.marginLeft = '263px';
// 		mammalNum.textContent = '9';
// 		avesNum.textContent = '3';
// 		reptileNum.textContent = '3';
// 		insectNum.textContent = '3';
// 		scene.getObjectByName("valley").visible = true;
// 		for(var i = 0; i < animals.length; i++){
// 			if (animals[i].userData.level == 'alpha'){
// 				animals[i].visible = true;
// 			} 
// 		}
// 	}

// 	if (count == 2){
// 		rotateSpeed = 0.009;
// 	}

// 	if (count == 1){
// 		rotateSpeed = 0.0085;
// 	}

// 	if (count == 0){
// 		rotateSpeed = 0.008;
// 	cc.style.visibility = 'visible';
// 	ccBuild.style.visibility = 'visible';
// 		clearInterval(timer);
// 	}

// }, 1000);




};


planetStateControl.oninput = function(){
	// Epsilon - Earthquake - Sandstorm
	if(planetStateControl.value == 1){
	planetState.setAttribute("src", "src/epsilon.svg");
	volcanoAnalytics.setAttribute("src", "src/volcanoEpsilon.svg");
	ner.textContent = '8';
	habitatNum.textContent = '3';
	forestIcon.style.visibility = 'hidden';
	snowmountainIcon.style.visibility = 'hidden';
	lakeIcon.style.visibility = 'hidden';
	valleyIcon.style.visibility = 'hidden';
	speciesNum.textContent = '9';
	speciesNum.style.marginLeft = '270px';
	mammalNum.textContent = '6';
	avesNum.textContent = '0';
	reptileNum.textContent = '0';
	insectNum.textContent = '0';
	scene.getObjectByName("forest").visible = false;
	scene.getObjectByName("snowmountain").visible = false;
	scene.getObjectByName("lake").visible = false;
	scene.getObjectByName("valley").visible = false;
	

	for(var n = 0; n < trees.length; n++){
		if(trees[n].name == 'treeForest'){
			trees[n].visible = false;
		} else if (trees[n].name == 'treeLake'){
			trees[n].visible = false;
		} else {
			trees[n].visible = false;
		}
	}

	for(var i = 0; i < animals.length; i++){
		if(animals[i].userData.level == 'epsilon'){
			animals[i].visible = true;
		}
		if(animals[i].userData.level == 'delta'){
			animals[i].visible = false;
		}
		if(animals[i].userData.level == 'gamma'){
			animals[i].visible = false;
		} 
		if (animals[i].userData.level == 'beta'){
			animals[i].visible = false;
		} 
		if(animals[i].userData.level == 'alpha'){
			animals[i].visible = false;
		}
	}

	let count = 36;
	let timer = setInterval(function () {
	count--;
	if (count == 33) {
		earthquakeStart();
		earthquakeStop();
	} 
	if(count == 15){
		sandstormStart();
		sandstormStop();
	}

	if (count == 0){
		clearInterval(timer);
	}

}, 1000);


	} else if(planetStateControl.value == 2){
		planetState.setAttribute("src", "src/delta.svg");
		volcanoAnalytics.setAttribute("src", "src/volcanoDelta.svg");
		ner.textContent = '5';
		habitatNum.textContent = '4';
		forestIcon.style.visibility = 'visible';
		snowmountainIcon.style.visibility = 'hidden';
		lakeIcon.style.visibility = 'hidden';
		valleyIcon.style.visibility = 'hidden';
		speciesNum.textContent = '12';
		speciesNum.style.marginLeft = '263px';
		mammalNum.textContent = '6';
		avesNum.textContent = '3';
		reptileNum.textContent = '0';
		insectNum.textContent = '0';
	// Delta - Hurricane - Snow
		scene.getObjectByName("forest").visible = true;
		scene.getObjectByName("snowmountain").visible = false;
		scene.getObjectByName("lake").visible = false;
		scene.getObjectByName("valley").visible = false;
	for(var n = 0; n < trees.length; n++){
		if(trees[n].name == 'treeForest'){
			trees[n].visible = true;
		} else if (trees[n].name == 'treeLake'){
			trees[n].visible = false;
		} else {
			trees[n].visible = false;
		}
	}

	for(var i = 0; i < animals.length; i++){
		if(animals[i].userData.level == 'epsilon'){
			animals[i].visible = true;
		}
		if(animals[i].userData.level == 'delta'){
			animals[i].visible = true;
		}
		if(animals[i].userData.level == 'gamma'){
			animals[i].visible = false;
		} 
		if (animals[i].userData.level == 'beta'){
			animals[i].visible = false;
		} 
		if(animals[i].userData.level == 'alpha'){
			animals[i].visible = false;
		}
	}




	let count = 36;
	let timer = setInterval(function () {
	count--;
	if (count == 33) {
		hurricaneStart();
		hurricaneStop();
	} 
	if(count == 15){
		snowStart();
		snowStop();
	}
	if (count == 0){
		clearInterval(timer);
	}
	}, 1000);

	} else if(planetStateControl.value == 3){
		planetState.setAttribute("src", "src/gamma.svg");
		volcanoAnalytics.setAttribute("src", "src/volcanoGamma.svg");
		ner.textContent = '4';
		habitatNum.textContent = '5';
		forestIcon.style.visibility = 'visible';
		snowmountainIcon.style.visibility = 'visible';
		lakeIcon.style.visibility = 'hidden';
		valleyIcon.style.visibility = 'hidden';
		speciesNum.textContent = '15';
		speciesNum.style.marginLeft = '263px';
		mammalNum.textContent = '9';
		avesNum.textContent = '3';
		reptileNum.textContent = '0';
		insectNum.textContent = '0';
	// Gamma - Volcano eruption - Rain
		scene.getObjectByName("forest").visible = true;
		scene.getObjectByName("snowmountain").visible = true;
		scene.getObjectByName("lake").visible = false;
		scene.getObjectByName("valley").visible = false;
		
	for(var n = 0; n < trees.length; n++){
		if(trees[n].name == 'treeForest'){
			trees[n].visible = true;
		} else if (trees[n].name == 'treeLake'){
			trees[n].visible = false;
		} else {
			trees[n].visible = false;
		}
	}

	for(var i = 0; i < animals.length; i++){
		if(animals[i].userData.level == 'epsilon'){
			animals[i].visible = true;
		}
		if(animals[i].userData.level == 'delta'){
			animals[i].visible = true;
		}
		if(animals[i].userData.level == 'gamma'){
			animals[i].visible = true;
		} 
		if (animals[i].userData.level == 'beta'){
			animals[i].visible = false;
		} 
		if(animals[i].userData.level == 'alpha'){
			animals[i].visible = false;
		}
	}


	let count = 36;
	let timer = setInterval(function () {
	count--;
	if (count == 33) {
		volcanoStart();
		volcanoStop();
	} 
	
	if(count == 15){
		rainStart();
		rainStop();
	}

	if (count == 0){
		clearInterval(timer);
	}

	}, 1000);


	} else if (planetStateControl.value == 4){
		planetState.setAttribute("src", "src/beta.svg");
		volcanoAnalytics.setAttribute("src", "src/volcanoBeta.svg");
		ner.textContent = '3';
		habitatNum.textContent = '6';
		forestIcon.style.visibility = 'visible';
		snowmountainIcon.style.visibility = 'visible';
		lakeIcon.style.visibility = 'visible';
		valleyIcon.style.visibility = 'hidden';
		speciesNum.textContent = '18';
		speciesNum.style.marginLeft = '263px';
		mammalNum.textContent = '9';
		avesNum.textContent = '3';
		reptileNum.textContent = '3';
		insectNum.textContent = '0';
	// Beta - WildFire - Windy
		scene.getObjectByName("forest").visible = true;
		scene.getObjectByName("snowmountain").visible = true;
		scene.getObjectByName("lake").visible = true;
		scene.getObjectByName("valley").visible = false;
		for(var n = 0; n < trees.length; n++){
			if(trees[n].name == 'treeForest'){
				trees[n].visible = true;
			} else if (trees[n].name == 'treeLake'){
				trees[n].visible = true;
			} else {
				trees[n].visible = false;
			}
		}


	for(var i = 0; i < animals.length; i++){
		if(animals[i].userData.level == 'epsilon'){
			animals[i].visible = true;
		}
		if(animals[i].userData.level == 'delta'){
			animals[i].visible = true;
		}
		if(animals[i].userData.level == 'gamma'){
			animals[i].visible = true;
		} 
		if (animals[i].userData.level == 'beta'){
			animals[i].visible = true;
		} 
		if(animals[i].userData.level == 'alpha'){
			animals[i].visible = false;
		}
	}


	let count = 36;
	let timer = setInterval(function () {
	count--;
	if (count == 33) {
		wildfireStart();
		wildfireStop();
	} 
	
	if(count == 15){

		windStart();
		windStop();

	}

	if (count == 0){
		clearInterval(timer);
	}

}, 1000);

	} else {
		planetState.setAttribute("src", "src/alpha.svg");
		volcanoAnalytics.setAttribute("src", "src/volcanoAlpha.svg");
		ner.textContent = '2';
		habitatNum.textContent = '7';
		forestIcon.style.visibility = 'visible';
		snowmountainIcon.style.visibility = 'visible';
		lakeIcon.style.visibility = 'visible';
		valleyIcon.style.visibility = 'visible';
		speciesNum.textContent = '21';
		speciesNum.style.marginLeft = '263px';
		mammalNum.textContent = '9';
		avesNum.textContent = '3';
		reptileNum.textContent = '3';
		insectNum.textContent = '3';
	// Alpha - Meteorstrike - Sunny
		scene.getObjectByName("forest").visible = true;
		scene.getObjectByName("snowmountain").visible = true;
		scene.getObjectByName("lake").visible = true;
		scene.getObjectByName("valley").visible = true;
		for(var n = 0; n < trees.length; n++){
			if(trees[n].name == 'treeForest'){
				trees[n].visible = true;
			} else if (trees[n].name == 'treeLake'){
				trees[n].visible = true;
			} else {
				trees[n].visible = true;
			}
		}

		for(var i = 0; i < animals.length; i++){
			if(animals[i].userData.level == 'epsilon'){
				animals[i].visible = true;
			}
			if(animals[i].userData.level == 'delta'){
				animals[i].visible = true;
			}
			if(animals[i].userData.level == 'gamma'){
				animals[i].visible = true;
			} 
			if (animals[i].userData.level == 'beta'){
				animals[i].visible = true;
			} 
			if(animals[i].userData.level == 'alpha'){
				animals[i].visible = true;
			}
		}


	let count = 36;
	let timer = setInterval(function () {
	count--;
	if (count == 33) {
		meteorstrikeStart();
		meteorstrikeStop();
	} 
	
	if(count == 15){
		sunStart();
		sunStop();
	}

	if (count == 0){
		clearInterval(timer);
	}

}, 1000);



	}
}

//volcano analytics + continent customization

const raycaster = new THREE.Raycaster(); 
const pointer = new THREE.Vector2(); 
var mouseLocation;
let source = new THREE.Vector3();
// let mediator = new THREE.Vector3();
// let target = new THREE.Vector3();
let picked = false;
let pickedContinent;

var ccStart = false;

ccBuild.onclick = function(){
	ccStart = true;
	cc.style.visibility = 'hidden';
	ccBuild.style.visibility = 'hidden';
	ccTip.style.visibility = 'visible';
	ccFinish.style.visibility = 'visible';
	document.body.style.background = 'linear-gradient(45deg, rgb(0, 186, 108), rgb(0, 167, 206))';
}

ccFinish.onclick = function(){
	ccStart = false;
	cc.style.visibility = 'visible';
	ccBuild.style.visibility = 'visible';
	ccTip.style.visibility = 'hidden';
	ccFinish.style.visibility = 'hidden';
	document.body.style.background = defaultBackground;
}


function onPointerMove( event ) { 
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1; 
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1; 


	if(picked){

	
	

	if(pickedContinent == "Desert"){
		

		var continentTransform = scene.getObjectByName(pickedContinent).parent.children;
		for(var i = 0; i < continentTransform.length; i++){
			if(continentTransform[i].type != 'Object3D' ){
				continentTransform[i].rotateZ(-pointer.x * 1.2 * Math.PI / 180);
				continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), pointer.x * Math.PI / 180 );
				continentTransform[i].rotateX(-pointer.y * 0.4 * Math.PI / 180);
				continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), pointer.y * 0.7 * Math.PI / 180 );
			} else {
				var slot = animals.indexOf(continentTransform[i]);
				move[slot][0] += pointer.y * 0.7; 
				move[slot][1] += pointer.x; 
			}
			
		}



	} else if (pickedContinent == "Valley"){
		var continentTransform = scene.getObjectByName(pickedContinent).parent.children;
		for(var i = 0; i < continentTransform.length; i++){
			if(continentTransform[i].type != 'Object3D' ){
			continentTransform[i].rotateZ(pointer.x * Math.PI / 180);
			continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), pointer.x * Math.PI / 180 );
			continentTransform[i].rotateX(pointer.y * 0.5 * Math.PI / 180);
			continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), pointer.y * 0.7 * Math.PI / 180 );
			} else {
				var slot = animals.indexOf(continentTransform[i]);
				move[slot][0] += pointer.y * 0.7; 
				move[slot][1] += pointer.x; 
			}
		}


	} else if (pickedContinent == "Arctic"){
		
		var continentTransform = scene.getObjectByName(pickedContinent).parent.children;
		for(var i = 0; i < continentTransform.length; i++){
			if(continentTransform[i].type != 'Object3D' ){
			continentTransform[i].rotateZ(-pointer.x * 1.2 * Math.PI / 180);
			continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), pointer.x * Math.PI / 180 );
			continentTransform[i].rotateX(-pointer.y * 0.6 * Math.PI / 180);
			continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), pointer.y * 0.7 * Math.PI / 180 );
			} else {
				var slot = animals.indexOf(continentTransform[i]);
				move[slot][0] += pointer.y * 0.7; 
				move[slot][1] += pointer.x; 
			}
		}


	} else if (pickedContinent == "Snow_mountain"){


		var continentTransform = scene.getObjectByName(pickedContinent).parent.children;
		for(var i = 0; i < continentTransform.length; i++){
			continentTransform[i].rotateY(pointer.x * Math.PI / 180);
			continentTransform[i].rotateX(pointer.y * 0.3 * Math.PI / 180);
		}

	} else {

		var continentTransform = scene.getObjectByName(pickedContinent).parent.children;
		for(var i = 0; i < continentTransform.length; i++){
			if(continentTransform[i].type != 'Object3D' ){
			continentTransform[i].rotateZ(-pointer.x * Math.PI / 180);
			continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), pointer.x * Math.PI / 180 );
			continentTransform[i].rotateX(-pointer.y * 0.5 * Math.PI / 180);
			continentTransform[i].position.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), -pointer.y * 0.7 * Math.PI / 180 );
			} else {
				var slot = animals.indexOf(continentTransform[i]);
				move[slot][0] += -pointer.y * 0.7; 
				move[slot][1] += pointer.x; 
			}
		}


	}




	
	

	renderer.render( scene, camera ); 

	}

	} 
	


window.addEventListener( 'pointermove', onPointerMove ); 


window.addEventListener('pointerdown', event =>{
	mouseLocation = pointer.x;

	});
	
window.addEventListener('pointerup', event =>{
	raycaster.setFromCamera( pointer, camera ); 
	const intersects = raycaster.intersectObjects( scene.getObjectByName("volcano").children ); 



	if(pointer.x == mouseLocation && picked == false){
	
	if(intersects.length > 0){
		volcanoAnalytics.style.visibility = 'visible';
		close.style.visibility = 'visible';
		renderer.render( scene, camera ); 
	} 


	let continentIntersect = [];

	if(ccStart){

	if( raycaster.intersectObjects( continents[0] ).length > 0 ){
		continentIntersect.push(raycaster.intersectObjects( continents[0] ));
	}

	if( raycaster.intersectObjects( continents[1] ).length > 0 ){
		continentIntersect.push(raycaster.intersectObjects( continents[1] ));
	}
	if( raycaster.intersectObjects( continents[2] ).length > 0 ){
		continentIntersect.push(raycaster.intersectObjects( continents[2] ));
	}
	if( raycaster.intersectObjects( continents[3] ).length > 0 ){
		continentIntersect.push(raycaster.intersectObjects( continents[3] ));
	}
	if( raycaster.intersectObjects( continents[4] ).length > 0 ){
		continentIntersect.push(raycaster.intersectObjects( continents[4] ));
	}
	if( raycaster.intersectObjects( continents[5] ).length > 0 ){
		continentIntersect.push(raycaster.intersectObjects( continents[5] ));
	}
	if( raycaster.intersectObjects( continents[6] ).length > 0 ){
		continentIntersect.push(raycaster.intersectObjects( continents[6] ));
	}

	}

	
	if(continentIntersect.length > 0){
		picked = true;
		source = continentIntersect[0][0].point;
		pickedContinent = continentIntersect[0][0].object.name;

		return;
		
	}

	}



	if (picked){
		picked = false;
		pickedContinent = '';
	}
	
	
	
	});

	close.onclick = function(){
		volcanoAnalytics.style.visibility = 'hidden';
		close.style.visibility = 'hidden';
	}




const controls = new OrbitControls( camera, renderer.domElement );

    //Disable zooming
    controls.enableZoom = false;

camera.position.z = 5;

controls.update();


let rotateHandle = 0;




function animate() {
	
	// if(rotateSpeed > 0.1){
	// 	rotateSpeed -= 0.0013;
	// } 

	// if(rotateSpeed > 0.01 && rotateSpeed < 0.1){
	// 	rotateSpeed -= 0.0001;
	// }

	// if(rotateSpeed > 0.001 && rotateSpeed < 0.01){
	// 	rotateSpeed -= 0.00002;
	// }
	

	requestAnimationFrame( animate );
	controls.update();

	const delta = clock.getDelta();

	fetch( 'https://api.thingspeak.com/channels/2244255/feeds.json?api_key=2BZD7I9T5XFKHJBK&results=2')
	.then (response => {
	return response.json( );
	})
	.then (feeds => {
	bubbleAction = feeds.feeds[1];
	});




	if(bubbleAction.entry_id > history.entry_id){
		if (bubbleAction.field1 == "sun"){
			sunStart();
			sunStop();
		}

	history = Object.assign({}, bubbleAction);


	}

	if(fireStarted){
		timeElapsed = new Date();
		fireMaterial.uniforms.uTime = ( startFire.getTime() - timeElapsed.getTime() ) / 10000 / 2;
		for(var w = 0; w < wildFire.length; w++){
			wildFire[w].rotation.y += 1;
		}
	
	}
	

	rotateHandle += 3;
	if(rotateHandle == 360){
		rotateHandle = 0;
	}

	planetStateControl.style.setProperty("--thumb-rotate", rotateHandle.toString() + 'deg');

    if (mixer.length > 0){
        mixer.forEach(function(a){
            a.update(delta);
        }
        );
    }


	if(earthquakeStarted){
        if((sphereOcean.position.x < 0.1) || (sphereOcean.position.x == -0.1)){
            sphereOcean.position.x += 0.025;
            sphereOcean.position.y += 0.025;
            sphereOcean.position.z += 0.025;
			scene.getObjectByName("arctic").position.x += 0.025;
            scene.getObjectByName("arctic").position.y += 0.025;
            scene.getObjectByName("arctic").position.z += 0.025;
			scene.getObjectByName("grassland").position.x += 0.025;
            scene.getObjectByName("grassland").position.y += 0.025;
            scene.getObjectByName("grassland").position.z += 0.025;
			scene.getObjectByName("desert").position.x += 0.025;
            scene.getObjectByName("desert").position.y += 0.025;
            scene.getObjectByName("desert").position.z += 0.025;
			scene.getObjectByName("forest").position.x += 0.025;
            scene.getObjectByName("forest").position.y += 0.025;
            scene.getObjectByName("forest").position.z += 0.025;
			scene.getObjectByName("volcano").position.x += 0.025;
            scene.getObjectByName("volcano").position.y += 0.025;
            scene.getObjectByName("volcano").position.z += 0.025;
        }else{
            sphereOcean.position.x -= 0.025;
            sphereOcean.position.y -= 0.025;
            sphereOcean.position.z -= 0.025;
			scene.getObjectByName("arctic").position.x -= 0.025;
            scene.getObjectByName("arctic").position.y -= 0.025;
            scene.getObjectByName("arctic").position.z -= 0.025;
			scene.getObjectByName("grassland").position.x -= 0.025;
            scene.getObjectByName("grassland").position.y -= 0.025;
            scene.getObjectByName("grassland").position.z -= 0.025;
			scene.getObjectByName("desert").position.x -= 0.025;
            scene.getObjectByName("desert").position.y -= 0.025;
            scene.getObjectByName("desert").position.z -= 0.025;
			scene.getObjectByName("forest").position.x -= 0.025;
            scene.getObjectByName("forest").position.y -= 0.025;
            scene.getObjectByName("forest").position.z -= 0.025;
			scene.getObjectByName("volcano").position.x -= 0.025;
            scene.getObjectByName("volcano").position.y -= 0.025;
            scene.getObjectByName("volcano").position.z -= 0.025;
        }
        sphereOcean.verticesNeedUpdate = true;
		scene.getObjectByName("arctic").verticesNeedUpdate = true;
		scene.getObjectByName("grassland").verticesNeedUpdate = true;
		scene.getObjectByName("desert").verticesNeedUpdate = true;
    }


	if(rainStarted){
        rainGroup.vertices.forEach(
            function(a){
                a.y -= Math.random()*1;
                if(Math.sqrt(Math.pow(a.x,2)+Math.pow(a.y,2)+Math.pow(a.z,2)) < 30){
                    a.y -= 30;
                }
            }
        );
        rainGroup.verticesNeedUpdate = true;
        
    }

	if(sandstormStarted){

		sandGroup.rotateY(delta*4);

        // sandGroup.verticesNeedUpdate = true;
    }

	if(snowStarted){
        snowGroup.vertices.forEach(
            function(a){
                a.y -= Math.random()*1;
                if(Math.sqrt(Math.pow(a.x,2)+Math.pow(a.y,2)+Math.pow(a.z,2)) < 30){
                    a.y -= 30;
                }
            }
        );
        snowGroup.verticesNeedUpdate = true;
        
    }

	if(sunshine){
		sunlight.position.x = Math.sqrt(18)* Math.sin(sunCount * Math.PI);
		sunlight.position.z = Math.sqrt(18)* Math.cos(sunCount * Math.PI);
		sunlight.position.y = Math.sqrt(18)* Math.sin(sunCountY * Math.PI);

		sunCount += 0.09;
		sunCountY += 0.009;
	}

	for(var l = 0; l<geneticChange.length; l++){
		geneticChange[l].rotation.y += 0.1;
	}

	for(var m = 0; m<dead.length; m++){
		dead[m].rotation.y += 0.1;
	}


	for (var p = 0; p < animals.length; p++){
		if(animals[p].name != 'flyingfish' && animals[p].name != 'manta' && animals[p].name != 'dolphin'){
			animals[p].position.applyAxisAngle( new THREE.Vector3( 1, 0, 0 ), move[p][0] * Math.PI / 180 );
			animals[p].position.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), move[p][1] * Math.PI / 180 );
			animals[p].position.applyAxisAngle( new THREE.Vector3( 0, 1, 0 ), move[p][2] * Math.PI / 180 );
		}
	}

	// scene.rotation.y -= rotateSpeed;

	renderer.render( scene, camera );
}

animate();