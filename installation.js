import * as THREE from '../../three.module.js';
import { OrbitControls } from '../../OrbitControls.js';
import { GLTFLoader } from '../../GLTFLoader.js';
import {SkeletonUtils} from '../../SkeletonUtils.js';

const clock = new THREE.Clock();

let theme = new Audio('mp3/theme.mp3');
theme.play();
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

console.log(history);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const xAxis = new THREE.Vector3(1,0,0);
const yAxis = new THREE.Vector3(0,1,0);
const zAxis = new THREE.Vector3(0,0,1);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.99);
scene.add(ambientLight);
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.1);
scene.add(hemisphereLight);
const directionalLight1 = new THREE.DirectionalLight(0xFFFAA5, 0.1);
directionalLight1.target.position.set(0,0,0);
directionalLight1.position.set(3,3,3);
scene.add(directionalLight1);
scene.add(directionalLight1.target);


let backdrop = document.querySelector('#backdrop');
let planetStateControl = document.querySelector('#planetStateControl');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.style.position = 'absolute';
document.body.insertBefore( renderer.domElement, planetStateControl);
renderer.setClearColor(0x000000, 0.0);


const planet = new THREE.SphereGeometry( 2, 80, 80 ); 
const materialPlanet = new THREE.MeshLambertMaterial( { color: '#31598C' } ); 
const spherePlanet = new THREE.Mesh( planet, materialPlanet ); 
const ocean = new THREE.SphereGeometry( 2.28, 80, 80 ); 
const materialOcean = new THREE.MeshLambertMaterial( { color: '#8FD6ED', transparent:true, opacity:0.98 } ); 
const sphereOcean = new THREE.Mesh( ocean, materialOcean ); 

let defaultBackground = 'linear-gradient(45deg, rgb(255, 255, 250), rgb(219, 245, 254))';
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

speciesNum.style.marginLeft = '270px';
forestIcon.style.visibility = 'hidden';
snowmountainIcon.style.visibility = 'hidden';
lakeIcon.style.visibility = 'hidden';
valleyIcon.style.visibility = 'hidden';

const lowLevelAnimal = ['#E9F6AD', '#F1CFCB', '#9DD2E9', '#FBC7ED', '#FDDFAE'];


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
	for(var i = 0; i < animals.length; i++){
		let copyGene = SkeletonUtils.clone(geneticChangeMesh);
		copyGene.position.set(animals[Math.floor(Math.random()* (animals.length - 1))].children[0].position.x *1.008, animals[Math.floor(Math.random()* (animals.length - 1))].children[0].position.y*1.008, animals[Math.floor(Math.random()* (animals.length - 1))].children[0].position.z*1.008);
		geneticChange.push(copyGene);
	}

	for(var j = 0; j < animals.length; j++){
		let copyDead = SkeletonUtils.clone(deadMesh);
		copyDead.position.set(animals[Math.floor(Math.random()* (animals.length - 1))].children[0].position.x*1.008, animals[Math.floor(Math.random()* (animals.length - 1))].children[0].position.y*1.008, animals[Math.floor(Math.random()* (animals.length - 1))].children[0].position.z*1.008);
		dead.push(copyDead);
	}
}



let animals = [];
let animalMove = [];
let trees = [];
let wind = [];

const loader = new GLTFLoader(manager);


loader.load(
    'glb/manta.glb',
    function (gltf){
        const animal = gltf.scene;
		animal.visible = false;

		var material = new THREE.MeshLambertMaterial({
          color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))]
        });

		animal.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
            child.material = material;
        }
    });

        scene.add(animal);

		gltf.scene.animations = gltf.animations;
		animal.name = 'manta';
		animal.userData.level = 'epsilon';

		
		

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

loader.load(
    'glb/arcticAnimals.glb',
    function (gltf){
        const wolf = gltf.scene.getObjectByName('wolf');
		wolf.visible = false;
		const fox = gltf.scene.getObjectByName('fox');
		fox.visible = false;
        

		wolf.name = 'wolf';
		wolf.userData.level = 'epsilon';
		wolf.userData.continent = 'arctic';
		wolf.animations = THREE.AnimationClip.findByName( gltf.animations, 'wolf' );
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

// var wolfs = new THREE.AnimationObjectGroup();
// var mesh;

// loader.load(
// 	'glb/wolf.glb',
// 	function(gltf){
// 		new Array(5).fill(null).map((d, i) => {

//       mesh = gltf.scene;

// 	  var material = new THREE.MeshLambertMaterial({
//           color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))]
//         });

// 		mesh.traverse(function(child) {
//         if (child instanceof THREE.Mesh) {
//             child.material = material;
//         }
//     });


// 	  	// mesh.position.x *= Math.random()*0.2 + 0.7;
// 		// mesh.position.z *= Math.random()*0.2 + 0.8;
// 		// mesh.position.y *= Math.random()* 0.3 + 1;
// 		// mesh.rotateY = Math.random() * 10 * Math.PI/180;
      
//       wolfs.add(mesh);
// 	  animals.push(mesh);
// 	  mesh.name = 'wolf';
// 	  mesh.userData.level = 'epsilon';
// 	  mesh.userData.continent = 'arctic';
//       scene.add(mesh);

// 	  wolfs.uncache(mesh);

//     });

//     let wolfMixer = new THREE.AnimationMixer(wolfs);
// 	mixer.push(wolfMixer);
//     var wolfWalk = THREE.AnimationClip.findByName( gltf.animations, 'wolf' );
//     animalMove.push(wolfMixer.clipAction(wolfWalk));
//   }
	
// );


loader.load(
    'glb/grasslandAnimals.glb',
    function (gltf){
        const cow = gltf.scene.getObjectByName('cow');
		cow.visible = false;
		const goat = gltf.scene.getObjectByName('goat');
		goat.visible = false;
        

		cow.name = 'cow';
		cow.userData.level = 'epsilon';
		cow.userData.continent = 'grassland';
		cow.animations = THREE.AnimationClip.findByName( gltf.animations, 'cow' );
		scene.add(cow);

		let cowMixer = new THREE.AnimationMixer( cow );
		mixer.push(cowMixer);
		const cowWalk = THREE.AnimationClip.findByName( gltf.animations, 'cow' );
		animalMove.push(cowMixer.clipAction(cowWalk));
		animals.push(cow);

		goat.name = 'goat';
		goat.userData.level = 'epsilon';
		goat.userData.continent = 'grassland';
		goat.animations = THREE.AnimationClip.findByName( gltf.animations, 'goat' );
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
        

		tiger.name = 'tiger';
		tiger.userData.level = 'epsilon';
		tiger.userData.continent = 'desert';
		tiger.animations = THREE.AnimationClip.findByName( gltf.animations, 'tiger' );
		scene.add(tiger);

		let tigerMixer = new THREE.AnimationMixer( tiger );
		mixer.push(tigerMixer);
		const tigerWalk = THREE.AnimationClip.findByName( gltf.animations, 'tiger' );
		animalMove.push(tigerMixer.clipAction(tigerWalk));
		animals.push(tiger);

		giraffe.name = 'giraffe';
		giraffe.userData.level = 'epsilon';
		giraffe.userData.continent = 'desert';
		giraffe.animations = THREE.AnimationClip.findByName( gltf.animations, 'giraffe' );
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
        

		paradise.name = 'paradise';
		paradise.userData.level = 'delta';
		paradise.userData.continent = 'forest';
		paradise.animations = THREE.AnimationClip.findByName( gltf.animations, 'paradise' );
		scene.add(paradise);

		let paradiseMixer = new THREE.AnimationMixer( paradise );
		mixer.push(paradiseMixer);
		const paradiseWalk = THREE.AnimationClip.findByName( gltf.animations, 'paradise' );
		animalMove.push(paradiseMixer.clipAction(paradiseWalk));
		animals.push(paradise);

		hummingbird.name = 'hummingbird';
		hummingbird.userData.level = 'delta';
		hummingbird.userData.continent = 'forest';
		hummingbird.animations = THREE.AnimationClip.findByName( gltf.animations, 'hummingbird' );
		scene.add(hummingbird);

		let hummingbirdMixer = new THREE.AnimationMixer(hummingbird );
		mixer.push(hummingbirdMixer);
		const hummingbirdWalk = THREE.AnimationClip.findByName( gltf.animations, 'hummingbird' );
		animalMove.push(hummingbirdMixer.clipAction(hummingbirdWalk));
		animals.push(hummingbird);


		eagle.name = 'eagle';
		eagle.userData.level = 'delta';
		eagle.userData.continent = 'forest';
		eagle.animations = THREE.AnimationClip.findByName( gltf.animations, 'eagle' );
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
        

		polarbear.name = 'polarbear';
		polarbear.userData.level = 'gamma';
		polarbear.userData.continent = 'snowmountain';
		polarbear.animations = THREE.AnimationClip.findByName( gltf.animations, 'polarbear' );
		scene.add(polarbear);

		let polarbearMixer = new THREE.AnimationMixer( polarbear );
		mixer.push(polarbearMixer);
		const polarbearWalk = THREE.AnimationClip.findByName( gltf.animations, 'polarbear' );
		animalMove.push(polarbearMixer.clipAction(polarbearWalk));
		animals.push(polarbear);

		squirrel.name = 'squirrel';
		squirrel.userData.level = 'gamma';
		squirrel.userData.continent = 'snowmountain';
		squirrel.animations = THREE.AnimationClip.findByName( gltf.animations, 'squirrel' );
		scene.add(squirrel);

		let squirrelMixer = new THREE.AnimationMixer(squirrel );
		mixer.push(squirrelMixer);
		const squirrelWalk = THREE.AnimationClip.findByName( gltf.animations, 'squirrel' );
		animalMove.push(squirrelMixer.clipAction(squirrelWalk));
		animals.push(squirrel);


		elephant.name = 'elephant';
		elephant.userData.level = 'gamma';
		elephant.userData.continent = 'snowmountain';
		elephant.animations = THREE.AnimationClip.findByName( gltf.animations, 'elephant' );
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
        

		lizard.name = 'lizard';
		lizard.userData.level = 'beta';
		lizard.userData.continent = 'lake';
		lizard.animations = THREE.AnimationClip.findByName( gltf.animations, 'lizard' );
		scene.add(lizard);

		let lizardMixer = new THREE.AnimationMixer( lizard );
		mixer.push(lizardMixer);
		const lizardWalk = THREE.AnimationClip.findByName( gltf.animations, 'lizard' );
		animalMove.push(lizardMixer.clipAction(lizardWalk));
		animals.push(lizard);

		frog.name = 'frog';
		frog.userData.level = 'beta';
		frog.userData.continent = 'lake';
		frog.animations = THREE.AnimationClip.findByName( gltf.animations, 'frog' );
		scene.add(frog);

		let frogMixer = new THREE.AnimationMixer(frog );
		mixer.push(frogMixer);
		const frogWalk = THREE.AnimationClip.findByName( gltf.animations, 'frog' );
		animalMove.push(frogMixer.clipAction(frogWalk));
		animals.push(frog);


		turtle.name = 'turtle';
		turtle.userData.level = 'beta';
		turtle.userData.continent = 'lake';
		turtle.animations = THREE.AnimationClip.findByName( gltf.animations, 'turtle' );
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
        

		butterfly.name = 'butterfly';
		butterfly.userData.level = 'alpha';
		butterfly.userData.continent = 'valley';
		butterfly.animations = THREE.AnimationClip.findByName( gltf.animations, 'butterfly' );
		scene.add(butterfly);

		let butterflyMixer = new THREE.AnimationMixer( butterfly );
		mixer.push(butterflyMixer);
		const butterflyWalk = THREE.AnimationClip.findByName( gltf.animations, 'butterfly' );
		animalMove.push(butterflyMixer.clipAction(butterflyWalk));
		animals.push(butterfly);

		bee.name = 'bee';
		bee.userData.level = 'alpha';
		bee.userData.continent = 'valley';
		bee.animations = THREE.AnimationClip.findByName( gltf.animations, 'bee' );
		scene.add(bee);

		let beeMixer = new THREE.AnimationMixer(bee );
		mixer.push(beeMixer);
		const beeWalk = THREE.AnimationClip.findByName( gltf.animations, 'bee' );
		animalMove.push(beeMixer.clipAction(beeWalk));
		animals.push(bee);


		dragonfly.name = 'dragonfly';
		dragonfly.userData.level = 'alpha';
		dragonfly.userData.continent = 'valley';
		dragonfly.animations = THREE.AnimationClip.findByName( gltf.animations, 'dragonfly' );
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

function grow(){
	let foxNum = 8;
	let wolfNum = 5;
	let cowNum = 6;
	let goatNum = 4;

	console.log(animals);
		for(var i = 0; i < animals.length; i++){
			if(animals[i].name == 'fox'){
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

				// baby.traverse(
				// 	function(node){
				// 		if(node.isMesh){
				// 			node.material = new THREE.MeshBasicMaterial({ color: lowLevelAnimal[Math.floor(Math.random()*(lowLevelAnimal.length - 1))] });
				// 		}
				// 	}
				//  );

					baby.position.x *= Math.random()*0.2 + 0.7;
					baby.position.z *= Math.random()*0.2 + 0.8;
					baby.position.y *= Math.random()* 0.2 + 1;

				
				babys.push(baby);
				scene.getObjectByName('arctic').add(baby);
				renderer.render( scene, camera );


				// let babyMixer = new THREE.AnimationMixer( baby );
				// mixer.push(babyMixer);
				// const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'fox' );
				// let babyAction = babyMixer.clipAction(babyWalk);
				// animalMove.push(babyAction);

				}

			


			} else if (animals[i].name == 'wolf'){
				// for(var j = 0; j < 5; j++){
				// var baby = SkeletonUtils.clone(animals[i]);

				// baby.userData.continent = 'arctic';


				// if(j < 2){
				// 	baby.userData.level = 'delta';
				// } 

				// if (j == 2){
				// 	baby.userData.level = 'gamma';
				// }

				// if (j == 3){
				// 	baby.userData.level = 'beta';
				// }
		
				// if (j == 4){
				// 	baby.userData.level = 'alpha';
				// }

				// baby.position.x *= Math.random()*0.2 + 0.7;
				// baby.position.z *= Math.random()*0.2 + 0.8;
				// baby.position.y *= Math.random()* 0.3 + 1;


				// babys.push(baby);
				// scene.getObjectByName('arctic').add(baby);
				// renderer.render( scene, camera );
				// }
				
				} else if (animals[i].name == 'cow'){
					for(var j = 0; j < 6; j++){
						var baby = SkeletonUtils.clone(animals[i]);

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

					baby.position.x *= Math.random()*0.2 + 0.8;
					baby.position.z *= Math.random()*0.2 + 0.8;
					baby.position.y *= Math.random()* 0.3 + 1;


						babys.push(baby);
						scene.getObjectByName('grassland').add(baby);
						renderer.render( scene, camera );

						}

				} else if (animals[i].name == 'goat'){
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

					baby.position.x *= Math.random()*0.1 + 1;
					baby.position.z *= Math.random()*0.1 + 0.8;
					baby.position.y *= Math.random()* 0.1 + 1;

						babys.push(baby);
						scene.getObjectByName('grassland').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'tiger'){
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

					baby.position.x *= Math.random()*0.1 + 1;
					baby.position.z *= Math.random()*0.2 + 0.9;
					baby.position.y *= Math.random()* 0.1 + 0.9;

						babys.push(baby);
						scene.getObjectByName('desert').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'giraffe'){
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

					baby.position.x *= Math.random()*0.1 + 0.8;
					baby.position.z *= Math.random()*0.2 + 1;
					baby.position.y *= Math.random()* 0.1 + 1.05;

						babys.push(baby);
						scene.getObjectByName('desert').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'paradise'){
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

					baby.position.x *= Math.random()*0.2 + 0.8;
					baby.position.z *= Math.random()*0.2 + 0.9;
					baby.position.y *= Math.random()* 0.7 + 1.5;

						babys.push(baby);
						scene.getObjectByName('forest').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'eagle'){
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

					baby.position.x *= Math.random()*0.2 + 0.8;
					baby.position.z *= Math.random()*0.1 + 0.85;
					baby.position.y *= Math.random()* 0.7 + 1.5;

						babys.push(baby);
						scene.getObjectByName('forest').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'hummingbird'){
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

					baby.position.x *= Math.random()*0.2 + 0.8;
					baby.position.z *= Math.random()*0.1 + 0.85;
					baby.position.y *= Math.random()* 0.7 + .5;
						

						babys.push(baby);
						scene.getObjectByName('forest').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'elephant'){
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
					
						if (j < 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 2){
							baby.userData.level = 'alpha';
						}

					baby.position.x *= Math.random()*0.7 + 0.8;
					baby.position.z *= Math.random()*0.8 + 0.3;
					baby.position.y *= Math.random()* 0.01 + 0.98;

						babys.push(baby);
						scene.getObjectByName('snowmountain').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'squirrel'){
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
					
						if (j < 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 2){
							baby.userData.level = 'alpha';
						}

					baby.position.x *= Math.random()*0.7 + 0.8;
					baby.position.z *= Math.random()*0.8 + 0.2;
					baby.position.y *= Math.random()* 0.01 + 0.97;

						babys.push(baby);
						scene.getObjectByName('snowmountain').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'polarbear'){
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if (j < 2){
							baby.userData.level = 'beta';
						}
				
						if (j == 2){
							baby.userData.level = 'alpha';
						}

					baby.position.x *= Math.random()*0.7 + 0.8;
					baby.position.z *= Math.random()*0.8 + 0.3;
					baby.position.y *= Math.random()* 0.01 + 0.97;

						babys.push(baby);
						scene.getObjectByName('snowmountain').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'lizard'){
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						
						if (j > 0){
							baby.userData.level = 'alpha';
						}

					baby.position.x *= Math.random()*0.08 + 0.9;
					baby.position.z *= Math.random()*0.7 + 0.5;
					baby.position.y *= Math.random()* 0.7 + 0.97;

						babys.push(baby);
						scene.getObjectByName('arctic').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'frog'){
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if (j > 1){
							baby.userData.level = 'alpha';
						}

					baby.position.x *= Math.random()*0.08 + 1;
					baby.position.z *= Math.random()*0.8 + 0.3;
					baby.position.y *= Math.random()* 0.9 - 0.1;

						babys.push(baby);
						scene.getObjectByName('arctic').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'turtle'){
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
						if (j > 0){
							baby.userData.level = 'alpha';
						}

					baby.position.x *= Math.random()*0.07 + 0.9;
					baby.position.z *= Math.random()*0.8 + 0.3;
					baby.position.y *= Math.random()* 0.9 + 0.97;

						babys.push(baby);
						scene.getObjectByName('arctic').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'butterfly'){
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
					baby.position.x *= Math.random()*0.2 + 0.8;
					baby.position.z *= Math.random()*0.1 + 0.95;
					baby.position.y *= Math.random()* 0.9 + 0.5;

						babys.push(baby);
						scene.getObjectByName('arctic').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'bee'){
					for(var j = 0; j < 4; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
					baby.position.x *= Math.random()*0.2 + 1;
					baby.position.z *= Math.random()*0.1 + 0.95;
					baby.position.y *= Math.random()* 0.5 + 0.97;

						babys.push(baby);
						scene.getObjectByName('arctic').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'dragonfly'){
					for(var j = 0; j < 3; j++){
						var baby = SkeletonUtils.clone(animals[i]);
						
					baby.position.x *= Math.random()*0.2 + 0.9;
					baby.position.z *= Math.random()*0.2 + 1.2;
					baby.position.y *= Math.random()* 0.5 + 0.6;

						babys.push(baby);
						scene.getObjectByName('arctic').add(baby);
						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'manta'){
					for(var j = 0; j < 7; j++){
						var baby = SkeletonUtils.clone(animals[i]);


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
						
						baby.rotation.x = Math.random()*1;
						baby.rotation.z = Math.random()*1.3;
						baby.rotation.y = Math.random()*0.6-0.3;

						babys.push(baby);
						scene.add(baby);


				let babyMixer = new THREE.AnimationMixer( baby );
				mixer.push(babyMixer);
				const babyWalk = THREE.AnimationClip.findByName( animals[i].animations, 'manta' );
				let babyAction = babyMixer.clipAction(babyWalk);
				animalMove.push(babyAction);

						renderer.render( scene, camera );
						}
				} else if (animals[i].name == 'flyingfish'){
					for(var j = 0; j < 6; j++){
						var baby = SkeletonUtils.clone(animals[i]);

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
				animalMove.push(babyAction);

						renderer.render( scene, camera );
						}
				} else {
					for(var j = 0; j < 8; j++){
						var baby = SkeletonUtils.clone(animals[i]);

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
						animalMove.push(babyAction);

						renderer.render( scene, camera );
						}
				}
			}
		
	
			animals = animals.concat(babys);
	
		


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

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));

	scene.add(dead[a]);
	scene.add(dead[b]);

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

		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
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

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));
	let e = Math.floor(Math.random()*(animals.length - 1));
	let f = Math.floor(Math.random()*(animals.length - 1));
	let g = Math.floor(Math.random()*(animals.length - 1));
	let h = Math.floor(Math.random()*(animals.length - 1));

	scene.add(dead[a]);
	scene.add(dead[b]);
	scene.add(dead[c]);
	scene.add(dead[d]);
	scene.add(dead[e]);
	scene.add(dead[f]);
	scene.add(dead[g]);
	scene.add(dead[h]);

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

		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
			
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

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));
	let e = Math.floor(Math.random()*(animals.length - 1));
	let f = Math.floor(Math.random()*(animals.length - 1));
	let g = Math.floor(Math.random()*(animals.length - 1));
	let h = Math.floor(Math.random()*(animals.length - 1));
	let i = Math.floor(Math.random()*(animals.length - 1));
	let j = Math.floor(Math.random()*(animals.length - 1));
	let k = Math.floor(Math.random()*(animals.length - 1));
	let l = Math.floor(Math.random()*(animals.length - 1));
	let m = Math.floor(Math.random()*(animals.length - 1));
	let n = Math.floor(Math.random()*(animals.length - 1));
	let o = Math.floor(Math.random()*(animals.length - 1));
	let p = Math.floor(Math.random()*(animals.length - 1));
	let q = Math.floor(Math.random()*(animals.length - 1));
	let r = Math.floor(Math.random()*(animals.length - 1));

	scene.add(dead[a]);
	scene.add(dead[b]);
	scene.add(dead[c]);
	scene.add(dead[d]);
	scene.add(dead[e]);
	scene.add(dead[f]);
	scene.add(dead[g]);
	scene.add(dead[h]);
	scene.add(dead[i]);
	scene.add(dead[j]);
	scene.add(dead[k]);
	scene.add(dead[l]);
	scene.add(dead[m]);
	scene.add(dead[n]);
	scene.add(dead[o]);
	scene.add(dead[p]);
	scene.add(dead[q]);
	scene.add(dead[r]);



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


		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
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
	scene.remove(hemisphereLight);
	fireStarted = true;

  for(var i = 0; i < 10; i++){
	var fire = new THREE.SphereGeometry( .2, 150, 150 ); 
    // var fireMaterial = new THREE.MeshStandardMaterial( { color: '#FF7D5C', emissive: '#FF7D5C' , emissiveIntensity: 0.8} ); 
	  
    var fireball = new THREE.Mesh( fire, fireMaterial ); 
	fireball.position.x = Math.random()*2.3 * 2 - 2.3;
	fireball.position.y = Math.random()*2.3 * 2 - 2.3;
	fireball.position.z = Math.sqrt(Math.pow(2.3, 2)-Math.pow(fireball.position.x, 2)-Math.pow(fireball.position.y, 2)) * Math.sign(Math.random()*2-1);
	
	wildFire.push(fireball);
	scene.add(fireball);
  }
  scene.fog = new THREE.FogExp2( 0xBE6D58, 0.2 );
  wildfireSound.play();

  let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));
	let e = Math.floor(Math.random()*(animals.length - 1));

	scene.add(dead[a]);
	scene.add(dead[b]);
	scene.add(dead[c]);
	scene.add(dead[d]);
	scene.add(dead[e]);

	startFire = new Date();

	console.log(scene);

}

function wildfireStop(){
	let count = 15;
	let timer = setInterval(function () {

	count--;


	if (count < 0) {
		eventLabel.style.visibility = 'hidden'; 
		animalLabel.style.visibility = 'hidden'; 

		ambientLight.intensity = 0.99;
		scene.add(directionalLight1);
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

		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
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
	scene.remove(hemisphereLight);

	scene.getObjectByName("meteorstrike").visible = true;
	meteorstrikeSound.play();
	meteorstrike.forEach( function ( clip ) {
		meteorstrikeMixer.clipAction( clip ).play();
	} );

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));
	let e = Math.floor(Math.random()*(animals.length - 1));
	let f = Math.floor(Math.random()*(animals.length - 1));
	let g = Math.floor(Math.random()*(animals.length - 1));
	let h = Math.floor(Math.random()*(animals.length - 1));

	scene.add(dead[a]);
	scene.add(dead[b]);
	scene.add(dead[c]);
	scene.add(dead[d]);
	scene.add(dead[e]);
	scene.add(dead[f]);
	scene.add(dead[g]);
	scene.add(dead[h]);

	}

	function meteorstrikeStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
			scene.getObjectByName("meteorstrike").visible = false;

			ambientLight.intensity = 0.99;
		scene.add(directionalLight1);
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

		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));
		scene.remove(scene.getObjectByName('dead'));

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

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));

	scene.add(geneticChange[a]);
	scene.add(geneticChange[b]);
	scene.add(geneticChange[c]);
	scene.add(geneticChange[d]);


	}

	function sandstormStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {

		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));

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

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));

	scene.add(geneticChange[a]);
	scene.add(geneticChange[b]);
	scene.add(geneticChange[c]);


	}

	function snowStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
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

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));
	let e = Math.floor(Math.random()*(animals.length - 1));
	let f = Math.floor(Math.random()*(animals.length - 1));
	let g = Math.floor(Math.random()*(animals.length - 1));

	scene.add(geneticChange[a]);
	scene.add(geneticChange[b]);
	scene.add(geneticChange[c]);
	scene.add(geneticChange[d]);
	scene.add(geneticChange[e]);
	scene.add(geneticChange[f]);
	scene.add(geneticChange[g]);

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

		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));

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

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));
	let e = Math.floor(Math.random()*(animals.length - 1));
	let f = Math.floor(Math.random()*(animals.length - 1));
	let g = Math.floor(Math.random()*(animals.length - 1));
	let h = Math.floor(Math.random()*(animals.length - 1));
	let i = Math.floor(Math.random()*(animals.length - 1));

	scene.add(geneticChange[a]);
	scene.add(geneticChange[b]);
	scene.add(geneticChange[c]);
	scene.add(geneticChange[d]);
	scene.add(geneticChange[e]);
	scene.add(geneticChange[f]);
	scene.add(geneticChange[g]);
	scene.add(geneticChange[h]);
	scene.add(geneticChange[i]);
	


	}

	function windStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
		
			for (var ab = 0; ab < wind.length; ab++){
				wind[ab].stop();
			}
			
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));

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
	scene.remove(hemisphereLight);


	sunshine = true;
	scene.add(sunlight);
	scene.add(sunlight.target);
	sunSound.play();

	let a = Math.floor(Math.random()*(animals.length - 1));
	let b = Math.floor(Math.random()*(animals.length - 1));
	let c = Math.floor(Math.random()*(animals.length - 1));
	let d = Math.floor(Math.random()*(animals.length - 1));
	let e = Math.floor(Math.random()*(animals.length - 1));
	let f = Math.floor(Math.random()*(animals.length - 1));
	let g = Math.floor(Math.random()*(animals.length - 1));

	scene.add(geneticChange[a]);
	scene.add(geneticChange[b]);
	scene.add(geneticChange[c]);
	scene.add(geneticChange[d]);
	scene.add(geneticChange[e]);
	scene.add(geneticChange[f]);
	scene.add(geneticChange[g]);

	}

	function sunStop(){
		let count = 15;
		let timer = setInterval(function () {
		count--;
		if (count < 0) {
			sunshine = false;

		ambientLight.intensity = 0.99;
		scene.add(directionalLight1);
		scene.add(hemisphereLight);

			sunSound.pause();
			sunSound.load();
			eventLabel.style.visibility = 'hidden'; 
			animalLabel.style.visibility = 'hidden'; 
			podLabel.style.visibility = 'hidden'; 
			clearInterval(timer);
			document.body.style.background = defaultBackground;
			sunCount = 0.0;


		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));
		scene.remove(scene.getObjectByName('geneticChange'));

		}
	}, 1000);
	}


let loadingEnd = document.querySelector('#loading');
planetStateControl.disable = true;



manager.onLoad = function ( ) {
	loadingEnd.style.display = 'none';
	scene.add( spherePlanet );
	scene.add( sphereOcean );
	scene.getObjectByName("arctic").visible = true;
	scene.getObjectByName("grassland").visible = true;
	scene.getObjectByName("desert").visible = true;
	scene.getObjectByName("forest").visible = true;
	scene.getObjectByName("snowmountain").visible = true;
	scene.getObjectByName("lake").visible = true;
	scene.getObjectByName("valley").visible = true;
	scene.getObjectByName("volcano").visible = true;
	planetStateControl.disable = false;

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


	// grow();

	console.log(animalMove);
	console.log(animals);

	
	
	for(var i=0; i < animalMove.length; i++){
		animalMove[i].play();
	}

	for(var m = 0; m < animals.length; m++){
		animals[m].visible = true;
	}





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

// 	let count = 36;
// 	let timer = setInterval(function () {
// 	count--;
// 	if (count == 33) {
// 		earthquakeStart();
// 		earthquakeStop();
// 	} 
// 	if(count == 15){
// 		sandstormStart();
// 		sandstormStop();
// 	}

// 	if (count == 0){
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

//volcano analytics

const raycaster = new THREE.Raycaster(); 
const pointer = new THREE.Vector2(); 
var mouseLocation;
let source = new THREE.Vector3();
let target = new THREE.Vector3();
let picked = false;
let pickedContinent;
let drop = false;

console.log(scene);

function onPointerMove( event ) { 
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1; 
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1; 

	// if(picked){
	// const continentTarget = raycaster.intersectObjects( scene.getObjectByName("arctic") );
	// console.log(continentTarget);
	// target = continentTarget[0].point;

	// let rotate1 = Math.acos( ( (target.x - 0)*( (target.y - source.y)/source.y * source.x + source.x - 0) + (target.y - target.y)*(source.y - target.y) + (target.z - 0)*( (target.y - source.y)/source.y * source.z + source.z - 0 ) ) 
	// / Math.sqrt(Math.pow(target.x - 0, 2) + Math.pow(target.y - target.y, 2) + Math.pow(target.z - 0, 2)) / Math.sqrt( Math.pow((target.y - source.y)/source.y * source.x + source.x - 0, 2) + Math.pow(source.y - target.y, 2) + Math.pow((target.y - source.y)/source.y * source.z + source.z - 0, 2) ) );

	// scene.getObjectByName(pickedContinent).rotateY(rotate1);
	
	// let flip;
	// if(target.z > 0){
	// 	flip = 1;
	// } else {
	// 	flip = -1;
	// }


	// var axis = new THREE.Vector3( 0, 1, 0 );
	// var angle = rotate1 * Math.PI / 180;
	// source.applyAxisAngle( axis, angle );

	// let rotate2 = Math.acos( ( (source.x - source.x) * (source.x - source.x) + (source.y - 0) * (target.y - 0) + (source.z - 0) * (flip * Math.sqrt(Math.sqrt(Math.pow(target.x,2) + Math.pow(target.z,2)) - Math.pow(target.y,2)) - 0) ) 
	// / Math.sqrt(Math.pow(source.x - source.x,2) + Math.pow(source.y - 0,2) + Math.pow(source.z - 0,2)) / Math.sqrt(Math.pow(source.x - source.x,2) + Math.pow(target.y - 0,2) + Math.pow(flip * Math.sqrt(Math.sqrt(Math.pow(target.x,2) + Math.pow(target.z,2)) - Math.pow(target.y,2)) - 0,2)) );

	// scene.getObjectByName(pickedContinent).rotateX(rotate2);


	// let rotate3 = Math.acos( (  (target.x - 0)  *  (source.x - 0)  + (target.y - target.y)  *  (target.y - target.y)  +  (target.z - 0)  *  (flip * Math.sqrt(Math.sqrt(Math.pow(target.x,2) + Math.pow(target.z,2)) - Math.pow(target.y,2)) - 0)  ) 
	// / Math.sqrt(Math.pow(target.x - 0,2) + Math.pow(target.y - target.y,2) + Math.pow(target.z - 0,2)) / Math.sqrt( Math.pow(source.x - 0,2) + Math.pow(target.y - target.y,2) + Math.pow(flip * Math.sqrt(Math.sqrt(Math.pow(target.x,2) + Math.pow(target.z,2)) - Math.pow(target.y,2)) - 0,2)) );

	// scene.getObjectByName(pickedContinent).rotateY(rotate3);


	// renderer.render( scene, camera ); 

	// }

	} 
	
window.addEventListener( 'pointermove', onPointerMove ); 
window.addEventListener('pointerdown', event =>{
	mouseLocation = pointer.x;

	// const continentIntersect = raycaster.intersectObjects( scene.getObjectByName("arctic") );
	// if(continentIntersect.length>0){
	// 	picked = true;
	// 	source = continentIntersect[0].point;
	// 	pickedContinent = continentIntersect[0].object.name;
	// }

	// if (picked){
	// 	drop = true;
	// 	picked = false;
	// }


	});
	
window.addEventListener('pointerup', event =>{
	raycaster.setFromCamera( pointer, camera ); 
	const intersects = raycaster.intersectObjects( scene.getObjectByName("volcano").children ); 

	if(pointer.x == mouseLocation){
	
	if(intersects.length > 0){
		volcanoAnalytics.style.visibility = 'visible';
		close.style.visibility = 'visible';
	} 
	}


	
	renderer.render( scene, camera ); 
	
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


	// console.log("bubbleAction: ");
	// console.log(bubbleAction);
	// console.log("history: ");
	// console.log(history);

	if(bubbleAction.entry_id > history.entry_id){
		console.log("detected bubble actions");
		console.log(bubbleAction);
		console.log(history);
		if (bubbleAction.field1 == "sun"){
			sunStart();
			sunStop();
		}

	history = Object.assign({}, bubbleAction);

	console.log(history);

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
                    a.y -= 60;
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
                    a.y -= 60;
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

	scene.rotation.y -= 0.01;

	renderer.render( scene, camera );
}

animate();