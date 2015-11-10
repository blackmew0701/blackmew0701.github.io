/**
* Define three types of scenes. Flow chart shown below: 
*             start            game over
*  startScene -----> gameScene ---------> endScene
*                              <---------
*                                restart
*
*  domElement.id of these three scenes are:
*    startScene: "menuScene-output"
*    gameScene: "gameScene-output"
*    endScene: "menuScene-output"
*/
window.onload = startScene;

function startScene(){
	start = document.createElement("input");
	start.type = "button";
	start.onclick = gameScene;
	start.value = "Start";
    start.id = "menuScene-output";
	/*start.style.margin= "auto";
	start.style.position= "absolute";
	start.style.top= 0; 
	start.style.left= 1; 
	start.style.bottom= 0; 
	start.style.right= 1;*/
	// add startScene to the html element
	document.getElementById("WebGL-output").appendChild(start);
}

function gameScene(){
	/* Debug use 
	var stats = initStats();*/
	
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    // position and point the camera to the center of the scene
    camera.position.x = -10;
    camera.position.y = 10;
    camera.position.z = 40;
    camera.lookAt(scene.position);
    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.shadowMapEnabled = true;
	
	
    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    // add spotlight for the shadows
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);
	
	/* Debug use 
	var sphere1 = new THREE.SphereGeometry(0.1,20,20);
	var material1 =  new THREE.MeshLambertMaterial({color: 0xff0000, shading:THREE.SmoothShading});
	var s = new THREE.Mesh(sphere1, material1);
	s.position.x = -30;
    s.position.y = 0;
	s.position.z = 0;
	scene.add(s);*/
	
	
	renderer.domElement.id = "gameScene-output";
	
	// Change scene from startScene/endScene to gameScene
	oldScene = document.getElementById("menuScene-output");
	
	document.getElementById("WebGL-output").replaceChild(renderer.domElement,oldScene);
	
	model = new Jumpjump(scene);
	model.init();
	createEventListeners();
	//renderer.render(scene, camera);
	render();
	
    function render() {
		renderer.render(scene, camera);
        /* Debug use 
		stats.update();*/
		if(!model.update()){
			endScene(model.score);
		}
        // render using requestAnimationFrame
        requestAnimationFrame(render);
		
        
    }
	
	function createEventListeners(){

	     //domElement = document.getElementById("WebGL-output");
         domElement = document.documentElement;
		 function mouseMoveListener(event){
			 if (event.buttons) { 
			     console.log(event.movementX);
				 scene.rotation.y+=event.movementX*0.001;
				 //scene.rotation.x+=event.movementY*0.001;
			 } 
	     }

	     function keyDownListener( event ) {
	         
			 switch( event.keyCode ) {			  
				  case 32: /* space */  
					  model.jump = true;
					  break;			  
			 }
	     } 
		 domElement.addEventListener("mousemove",mouseMoveListener,false);
	     domElement.addEventListener("keydown",keyDownListener,false);
	     domElement.setAttribute("tabindex", 0);
	 }
	 
	/* Debug use */
    function initStats() {

        var stats = new Stats();

        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '210px';
        stats.domElement.style.top = '0px';

        document.getElementById("Stats-output").appendChild(stats.domElement);

        return stats;
    }
	
	
}


function endScene(score){
	end = document.createElement("input");
	end.type = "button";
	end.onclick = gameScene;
	end.value = "Game over! your score is "+score+". press to restart";
    end.id = "menuScene-output";
	// Change scene from gameScene to endScene
	oldScene = document.getElementById("gameScene-output");
	//$("#gameScene-output").remove();
	//console.log(oldScene);
	document.getElementById("WebGL-output").removeChild(oldScene);
	document.getElementById("WebGL-output").appendChild(end);
}


function Jumpjump(scene){
	this.widthBound = 50; // From center of the screen
	this.heightBound = 40; // From center of the screen
	this.scene = scene;
	this.player;
	this.jumpTrigger = false; // trigger of jump action
	this.jumping = false; // current state of the player: jump or stand on a board 
	this.jumpStep;
	this.jumpOriginX;
	this.jumpOriginY;
	this.frameCount = 0;
	this.boardsFrame = 200; // speed of generating new floating boards
	this.boardsMove = 0.15; // speed of moving floating boards
	this.starFrame = 120; // speed of generating new stars
	this.starMove = 0.3; // speed of moving stars
	this.score = 0;
	this.boards = [];
	this.floating_boards = [];
	this.fatal_boards = [];
	this.stars = [];
	
}
Jumpjump.prototype.constructor = Jumpjump;
Jumpjump.prototype.init = function(){
	this.player = createPlayer();
	this.scene.add(this.player);
	
	for (var i = 0; i < 4; i++) {
		var floating_board = createFloatingBoard(20*(i-2), -this.player.radius, 0);
        this.scene.add(floating_board);
        this.floating_boards.push(floating_board);
		this.boards.push(floating_board);
	}
	
}
Jumpjump.prototype.update = function(){
	// Add new floating boards
	if(this.frameCount % this.boardsFrame == 0){
		var floating_board = createFloatingBoard(this.widthBound, rand(30)-16, 0);
		this.scene.add(floating_board);
		this.floating_boards.push(floating_board);
		this.boards.push(floating_board);
	}
	
	// Add new fatal boards
	if((this.frameCount+110) % (this.boardsFrame*2) == 0){
		var fatal_board = createFatalBoard(this.widthBound, rand(30)-16, 0);
		this.scene.add(fatal_board);
		this.fatal_boards.push(fatal_board);
		this.boards.push(fatal_board);
	}
	
	
	// Add new stars
	if((this.frameCount-50) % this.boardsFrame == 0){
		var star = createStar(this.widthBound, rand(30)-15, 0); 
		this.scene.add(star);
		this.stars.push(star);
	}
	
	// Move boards
	for (var i=0; i<this.boards.length; i++){
		var board = this.boards[i];
		board.position.x -= this.boardsMove;
	}
	
	for (var i=0; i<this.stars.length; i++){
		var star = this.stars[i];
		// Move stars
		star.position.x -= this.starMove;
		
		// Out of screen, remove the star from scene
		if (star.position.x < -this.widthBound){
			this.scene.remove(star);
			this.stars.splice(i,1);
			//console.log(this.stars);
		}
		
		// Player collects the star, add score
		if (intersect(this.player, star)){
			this.scene.remove(star);
			this.stars.splice(i,1);
			this.score += 100;
		}
	}
	
	for (var i=0; i<this.floating_boards.length; i++){
		var floating_board = this.floating_boards[i];
		
		// Out of screen, remove the floating board from scene
		if (floating_board.position.x < -this.widthBound){
			this.scene.remove(floating_board);
			this.floating_boards.splice(i,1);
		}
	
	    // Player steps on the floating board
		if (stepOn(this.player, floating_board)){
			this.jumping = false;
			
			this.player.position.x -= this.boardsMove;
			this.player.position.y = this.player.radius + floating_board.position.y + floating_board.height/2;
		}
	}
	
	for (var i=0; i<this.fatal_boards.length; i++){
		var fatal_board = this.fatal_boards[i];
		
		// Out of screen, remove the fatal board from scene
		if (fatal_board.position.x < -this.widthBound){
			this.scene.remove(fatal_board);
			this.fatal_boards.splice(i,1);
		}
		
		// If player steps on the fatal board, then game over
		if (stepOn(this.player, fatal_board)){
			return false;
		}
	}
	
	
	
	//  Player start to jump, reset parameters
    if(this.jump){
    	this.jump = false;
		this.jumpStep = 0;
		this.jumpOriginX = this.player.position.x;
		this.jumpOriginY = this.player.position.y;
		this.jumping = true;
    }
	
	if(this.jumping){
		this.jumpStep += 0.05;
		// Jump model is a parabolic function
		this.player.position.x = this.jumpOriginX + this.jumpStep;
		this.player.position.y = this.jumpOriginY - 11*(this.jumpStep-1)*(this.jumpStep-1) + 11
	}
	
	this.frameCount++; 
	// compute score  score++;
	if(this.frameCount % 30 == 0){
		this.score++;
	}
	
	// if player is out of bound, then game over
	if (this.player.position.x <= -this.widthBound+4 ||
	    this.player.position.x >= this.widthBound ||
		this.player.position.y <= -this.heightBound ||
		this.player.position.y >= this.heightBound){
		return false;
	}
	return true;
}

function createPlayer(){
	var radius = 2.5;
	var sphere = new THREE.SphereGeometry(radius,20,20);
	var material =  new THREE.MeshLambertMaterial({color: 0xffff00, shading:THREE.SmoothShading});
	var player = new THREE.Mesh(sphere, material);
	player.radius = radius;
	//avatar.traverse(function (e) {
	  //              e.castShadow = true
		//});
	player.name="player";
	player.position.y = 0;
	return player;
}

function createFloatingBoard(x, y, z){
	var width = 8;
	var height = 2;
	var depth = 6;
	var boardGeometry = new THREE.BoxGeometry(width, height, depth);
	var boardMaterial = new THREE.MeshLambertMaterial({color:0x0000ff}); //,transparent:true,opacity:0.5, wireframe: true
	var board = new THREE.Mesh(boardGeometry, boardMaterial);
	board.position.x = x;
	board.position.y = y;
	board.position.z = z;
	board.width = width;
	board.height = height;
	board.depth = depth;
	return board;
}

function createFatalBoard(x, y, z){
	var width = 8;
	var height = 2;
	var depth = 6;
	var boardGeometry = new THREE.BoxGeometry(width, height, depth);
	var boardMaterial = new THREE.MeshLambertMaterial({color:0x00ff00,emissive:0x225522,transparent:true,opacity:0.7}); //,transparent:true,opacity:0.7
	var board = new THREE.Mesh(boardGeometry, boardMaterial);
	board.position.x = x;
	board.position.y = y;
	board.position.z = z;
	board.width = width;
	board.height = height;
	board.depth = depth;
	return board;
}

function createStar(x, y, z){
	var radius = 2.5;
	var starGeometry = new THREE.OctahedronGeometry(radius);
	var starMaterial = new THREE.MeshLambertMaterial({color:0xee4400});//,transparent:true,opacity:0.7
	var star = new THREE.Mesh(starGeometry, starMaterial);
	star.position.x = x;
	star.position.y = y;
	star.position.z = z;
	star.radius = radius;
	return star;
}

function stepOn(player, board){
	return player.position.x > board.position.x - board.width/2 && 
	       player.position.x < board.position.x + board.width/2 && 
	       player.position.y - player.radius <= board.position.y + board.height/2 &&
	       player.position.y - player.radius > board.position.y - board.height/2;
}

function intersect(player, star) {
	return player.position.x - player.radius < star.position.x + star.radius/2 && 
	       star.position.x - star.radius/2 < player.position.x + player.radius &&
           player.position.y - player.radius < star.position.y + star.radius/2 && 
	       star.position.y - star.radius/2 < player.position.y + player.radius;
}

function rand(num){	return Math.floor(Math.random() * num);	}
