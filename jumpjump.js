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
	img = document.createElement("input");
	img.type = "image";
	img.src = "assets/open.png";
	img.id = "menuScene-output";

	createEventListeners();

	function createEventListeners(){
		domElement = document.documentElement;

		function keyDownListener() {
			gameScene();
		}

		domElement.addEventListener("keydown",keyDownListener,false);
		domElement.setAttribute("tabindex", 0);
	}
	
	// add startScene to the html element
	document.getElementById("WebGL-output").appendChild(img);
}

function gameScene(){
    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();   
    
    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000000);
    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 50;
    camera.lookAt(scene.position);
	
    // create a render and set the size
    var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    //renderer.setClearColor(new THREE.Color(0xaaaaff, 1.0));
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

    var hemiLight = new THREE.HemisphereLight( 0x0000ff, 0xff0000, 0.6);
    hemiLight.position.set(0,500,0);
	scene.add(hemiLight);

	var lava = THREE.ImageUtils.loadTexture("assets/lava.jpg");
    lava.wrapS = THREE.RepeatWrapping;
    lava.wrapT = THREE.RepeatWrapping;
    lava.repeat.set(1.0, 0.8);

    var planeGeometry = new THREE.BoxGeometry(1000, 200, 20, 20);
    var planeMaterial = new THREE.MeshLambertMaterial({map: lava});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial );
    plane.receiveShadow = true;

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = -42;
    plane.position.z = 0;
	
    scene.add(plane);

    var box = new THREE.BoxGeometry(110, 80, 20);
	var boxmaterial = new THREE.MeshLambertMaterial({color:0xcccccc});
	var spikeboard = new THREE.Mesh(box, boxmaterial);
	spikeboard.rotation.y = -0.5 * Math.PI;
	spikeboard.position.x = -60;
	spikeboard.position.y = 0;
	spikeboard.position.z = 0;
	spikeboard.receiveShadow = true;

	function getPoints() {
        var points = [];
        for (var i = 0; i < 49; i+=8) {
        	for (var j = 0; j < 30; j+=8){
				var z = -10;
                var x = 50 - 2 * i;
                var y = 30 - 2 * j;
				points.push(new THREE.Vector3(x, y, z));
        	}
        }
        return points;
    }

    var spikes = [];
    var points = getPoints();

    points.forEach(function (point) {
		var tetrahedronGeometry = new THREE.TetrahedronGeometry(4,0);
		var tetrahedronMaterial = boxmaterial;
		var spike = new THREE.Mesh(tetrahedronGeometry, tetrahedronMaterial);
        spike.rotation.x = -0.3 * Math.PI;
        spike.position.copy(point);
		spikeboard.add(spike);
        spikes.push(spike);
    });

	spikeboard.position.z = -50;
	scene.add(spikeboard);
	
	var pointColor = "#ffffff";
    var spotLight2 = new THREE.DirectionalLight(pointColor);
	spotLight2.position.set(30, 10, -50);
	spotLight2.castShadow = true;
	spotLight2.shadowCameraNear = 0.1;
	spotLight2.shadowCameraFar = 1000;
	spotLight2.shadowCameraFov = 500;
	spotLight2.target = plane;
	spotLight2.distance = 0;
	spotLight2.shadowCameraNear = 2;
	spotLight2.shadowCameraFar = 400;
	spotLight2.shadowCameraLeft = -200;
	spotLight2.shadowCameraRight = 200;
	spotLight2.shadowCameraTop = 200;
	spotLight2.shadowCameraBottom = -200;
	spotLight2.shadowMapWidth = 2048;
	spotLight2.shadowMapHeight = 2048;
	scene.add(spotLight2);


	var cubeCamera = new THREE.CubeCamera( 1, 100000, 128 );
	scene.add( cubeCamera );
	var chromeMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: cubeCamera.renderTarget, emissive: 'gray' } );

	var ball = new THREE.Mesh( new THREE.SphereGeometry(10,32,32), chromeMaterial );
	ball.position.y = 0;

	var starImage = THREE.ImageUtils
            .loadTexture('assets/sky.jpg');
	starImage.magFilter = THREE.NearestFilter;
	starImage.minFilter = THREE.LinearMipMapLinearFilter;
	starImage.wrapS = starImage.wrapT = THREE.RepeatWrapping;	
	
	var skyboxMaterial = new THREE.MeshBasicMaterial({color:0xffffff, map:starImage});
	var skybox = new THREE.Mesh(new THREE.SphereGeometry(200,32,32), skyboxMaterial);

	skybox.scale.x = -1;  // turn it inside out..
	skybox.rotation.y = 0.5 * Math.PI;
	skybox.position.y = - 50;

	var background = new THREE.Mesh (new THREE.PlaneGeometry(innerWidth,innerHeight), skyboxMaterial);
	background.position.z = -800;

	scene.add(skybox);
	
	renderer.domElement.id = "gameScene-output";
	
	// Change scene from startScene/endScene to gameScene
	var oldScene = document.getElementById("menuScene-output");
	document.getElementById("WebGL-output").removeChild(oldScene);
	document.getElementById("WebGL-output").appendChild(renderer.domElement);
	
	model = new Jumpjump(scene, cubeCamera, chromeMaterial, renderer);
	model.init();
	createEventListeners();
	render();
	
    function render() {
		renderer.render(scene, camera);
		if(!model.update()){
			endScene(model.score);
		}
		requestAnimationFrame(render);
    }
	
	function createEventListeners(){
	    domElement = document.documentElement;
		 function mouseMoveListener(event){
			 if (event.buttons) { 
			     console.log(event.movementX);
				 scene.rotation.y+=event.movementX*0.001;
			 } 
	     }

		 function mouseDownListener(event){
			 if (event.buttons) { 
				 model.jump = true;
			 } 
	     }

	     function keyDownListener( event ) {
			 switch( event.keyCode ) {			  
				  case 32: /* space */  
					  model.jump = true;
					  break;			  
			 }
	     }

	     function touchListener(){
			 model.jump = true;
	     }	

		 domElement.addEventListener("mousemove",mouseMoveListener,false);
		 domElement.addEventListener("keydown",keyDownListener,false);
	     domElement.addEventListener("touchstart",touchListener,false);
	     domElement.setAttribute("tabindex", 0);
	 }
}


function endScene(score){
	end = document.createElement("input");
	end.type = "button";
	end.onclick = gameScene;
	end.value = "Game over! your score is "+score+". press any key to restart";
    end.id = "menuScene-output";
	// Change scene from gameScene to endScene
	oldScene = document.getElementById("gameScene-output");
	document.getElementById("WebGL-output").removeChild(oldScene);
	document.getElementById("WebGL-output").appendChild(end);
}


function Jumpjump(scene, cubeCamera, chromeMaterial, renderer){
	this.widthBound = 50; // From center of the screen
	this.heightBound = 40; // From center of the screen
	this.scene = scene;
	this.cubeCamera = cubeCamera;
	this.chromeMaterial = chromeMaterial;
	this.renderer = renderer;
	this.player;
	this.jumpTrigger = false; // trigger of jump action
	this.jumping = false; // current state of the player: jump or stand on a board 
	this.droping = false;
	this.jumpStep = 0;
	this.jumpOriginX;
	this.jumpOriginY;
	this.frameCount = 0.0;
	this.boardsFrame = 70; // speed of generating new floating boards
	this.boardsMove = 0.3; // speed of moving floating boards
	this.starFrame = 230; // speed of generating new stars
	this.starMove = 0.3; // speed of moving stars
	this.score = 0;
	this.boards = [];
	this.floating_boards = [];
	this.fatal_boards = [];
	this.stars = [];
	this.scores = [];
	this.points = [];
	this.levels = [];
	this.currentT = 0;
	this.currentT2 = 0;
	this.currentT3 = 1;
	this.currentboard = 0;
	this.temp2 = 0;
	
}
Jumpjump.prototype.constructor = Jumpjump;
Jumpjump.prototype.init = function(){
	this.player = createPlayer(this.chromeMaterial);
	this.scene.add(this.player);
	
	for (var i = 0; i < 5; i++) {
		var floating_board = createFloatingBoard(20*(i-2), -this.player.radius, 0);
        this.scene.add(floating_board);
        this.floating_boards.push(floating_board);
		this.boards.push(floating_board);
	}
	
}
Jumpjump.prototype.update = function(){
    // Add new floating boards
	if(this.frameCount % Math.floor(20.0/this.boardsMove) == 0){
		var blueOrGreen = rand(10);
		if (blueOrGreen < 3){
			var fatal_board = createFatalBoard(this.widthBound, rand(30)-16, 0);
			this.scene.add(fatal_board);
			this.fatal_boards.push(fatal_board);
			this.boards.push(fatal_board);
		}
		else {
			var floating_board = createFloatingBoard(this.widthBound, rand(30)-16, 0);
			this.scene.add(floating_board);
			this.floating_boards.push(floating_board);
			this.boards.push(floating_board);	
		}
	}
	
	// Add new stars
	if((this.frameCount-80) % this.starFrame == 0){
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
			i--;
		}
		
		// Player collects the star, add score
		if (intersect(this.player, star)){
			this.scene.remove(star);
			var pos = star.position;
			this.stars.splice(i,1);
			i--;
			this.score += 100;
			var options = {
				size: 3.0,
				height: 0.5,
                bevelEnabled: false,
				curveSegments: 1,
				font:"helvetiker",
				weight:"normal",
				style: "normal"
			};

			text1 = new THREE.Mesh(new THREE.TextGeometry("+100",options));
            text1.position.copy(pos);
            this.scene.add(text1);
            this.points.push(text1);
            this.currentT = this.frameCount;
			this.scene.children[4].position.x -= 10;
		}
	}
	
	if (this.frameCount == this.currentT + 50){
		var point = this.points[0];
		this.scene.remove(point);
		this.points.splice(0,1);
	}
	
	for (var i=0; i<this.floating_boards.length; i++){
		var floating_board = this.floating_boards[i];
		
		// Out of screen, remove the floating board from scene
		if (floating_board.position.x < -this.widthBound){
			this.scene.remove(floating_board);
			this.floating_boards.splice(i,1);
			i--;
		}
	
	    // Player steps on the floating board
		if (stepOn(this.player, floating_board, this.jumpStep)){
			this.droping = false;
			this.jumping = false;
			this.player.position.x -= this.boardsMove;
			this.player.position.y = this.player.radius + floating_board.position.y + floating_board.height/2;
		}
	}
	this.currentT3 = this.frameCount/10.0;	
	for (var i=0; i<this.fatal_boards.length; i++){
		var fatal_board = this.fatal_boards[i];
		
		// Out of screen, remove the fatal board from scene
		if (fatal_board.position.x < -this.widthBound){
			this.scene.remove(fatal_board);
			this.fatal_boards.splice(i,1);
			i--;
		}
		
		// If player steps on the fatal board, then game over
		if (stepOn(this.player, fatal_board, this.jumpStep)){
			this.droping = false;
			this.jumping = false;
			this.player.position.x -= this.boardsMove;
			this.player.position.y = this.player.radius + fatal_board.position.y + fatal_board.height/2;
			this.currentT2 = Math.floor(this.frameCount/10.0);
			this.currentboard = i;
		}
	}

	if (this.currentT3 == this.currentT2){
		this.droping = true;
		this.scene.remove(this.fatal_boards[this.currentboard]);
		this.fatal_boards.splice(this.currentboard,1);
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
		this.player.position.x = this.jumpOriginX + this.jumpStep*2;
		this.player.position.y = this.jumpOriginY - 11*(this.jumpStep-1)*(this.jumpStep-1) + 11
	}

	if(this.droping){
		this.player.position.y -= 1*(0.05-1)*(0.05-1);
		this.player.position.x -= 0.14;
	}
	
	this.frameCount++; 
	
	// compute score
	if(this.frameCount % 30 == 0){
		this.score++;
	}

	if(this.score/200 * 0.05 + 0.3 > this.boardsMove){
		var temp = this.score / 200;
		this.boardsMove = 0.3 + temp * 0.05;		
	}

	if(this.frameCount % 2 == 0){
		var list = this.scene.children;
		list[4].position.x+=0.1;
	}

	var options = {
        size: 3.0,
        height: 0.5,
        bevelEnabled: false,
        curveSegments: 1,
        font:"helvetiker",
        weight:"normal",
        style: "normal"
    };

    var options2 = {
        size: 4.0,
        height: 1.5,
		bevelEnabled: false,
        curveSegments: 1,
        font:"helvetiker",
        weight:"normal",
        style: "normal"
    };

	if (this.frameCount % 30 == 1){
		var text2 = new THREE.Mesh(new THREE.TextGeometry("Scores: " + this.score,options));
		text2.position.set(10,15,0);
		this.scene.add(text2);
		this.scores.push(text2);
	}

	if(this.frameCount % 30  == 0){
		var score = this.scores[0];
		this.scene.remove(score);
		this.scores.splice(0,1);
	}

	if (this.frameCount == 1){
		var text3 = new THREE.Mesh(new THREE.TextGeometry("LEVEL 1", options2));
		text3.position.set(-20,10,10);
		this.scene.add(text3);
		this.levels.push(text3);
	}

	if (Math.floor(this.score/200) > this.temp2){
		var level = this.levels[0];
		this.scene.remove(level);
		this.levels.splice(0,1);
		var text3 = new THREE.Mesh(new THREE.TextGeometry("LEVEL " + Math.ceil(this.score/200), options2));
		this.temp2++;
		text3.position.set(-20,10,10);
		this.scene.add(text3);
		this.levels.push(text3);
	}

	this.player.visible = false;
	this.cubeCamera.position.copy(this.player.position);
	this.cubeCamera.updateCubeMap(this.renderer, this.scene);
	//Render the scene
	this.player.visible = true;
	
	// if player is out of bound, then game over
	if (this.player.position.x <= this.scene.children[4].position.x+15 ||
	    this.player.position.x >= this.widthBound-5 ||
		this.player.position.y <= -this.heightBound+10 ||
		this.player.position.y >= this.heightBound){
		return false;
	}
	return true;
}


function createPlayer(chromeMaterial){
	var radius = 3.0;
	var sphere = new THREE.SphereGeometry(radius,20,20);
	var material =  new THREE.MeshBasicMaterial({color: 0xffffff, shading:THREE.SmoothShading});
	var player = new THREE.Mesh(sphere, chromeMaterial);
	player.radius = radius;
	player.name="player";
	player.position.y = 0;
	return player;
}


function createFloatingBoard(x, y, z){
	var width = 8;
	var height = 2;
	var depth = 6;
	var boardGeometry = new THREE.BoxGeometry(width, height, depth);
	var boardMaterial = new THREE.MeshLambertMaterial({color:0x0000ff});
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
	var boardMaterial = new THREE.MeshLambertMaterial({color:0x00ff00, emissive:0x225522, transparent:true, opacity:0.7}); 
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
	var starMaterial = new THREE.MeshLambertMaterial({color:0xee4400});
	var star = new THREE.Mesh(starGeometry, starMaterial);
	star.position.x = x;
	star.position.y = y;
	star.position.z = z;
	star.radius = radius;
	return star;
}


function stepOn(player, board, jumpStep){
	if (jumpStep > 4){
	return (player.position.x > board.position.x - board.width/2) && 
	       (player.position.x < board.position.x + board.width/2) && 
	       (player.position.y - player.radius <= board.position.y + board.height/2)&&
	       (player.position.y - player.radius > board.position.y - board.height*1.5);
	   }
    else if (jumpStep > 2){
    		return (player.position.x > board.position.x - board.width/2) && 
	       (player.position.x < board.position.x + board.width/2) && 
	       (player.position.y - player.radius <= board.position.y + board.height/2)&&
	       (player.position.y - player.radius > board.position.y - board.height);
    }
    else if (jumpStep == 0) {
    	return (player.position.x > board.position.x - board.width/2) && 
	       (player.position.x < board.position.x + board.width/2) && 
	       (player.position.y - player.radius <= board.position.y + board.height/2)&&
	       (player.position.y - player.radius >= board.position.y - board.height/4);
    }
    else {
    	return (player.position.x > board.position.x - board.width/2) && 
	       (player.position.x < board.position.x + board.width/2) && 
	       (player.position.y - player.radius <= board.position.y + board.height/2)&&
	       (player.position.y - player.radius >= board.position.y);
    }
}


function intersect(player, star) {
	return player.position.x - player.radius < star.position.x + star.radius/2 && 
	       star.position.x - star.radius/2 < player.position.x + player.radius &&
           player.position.y - player.radius < star.position.y + star.radius/2 && 
	       star.position.y - star.radius/2 < player.position.y + player.radius;
}


function rand(num){	return Math.floor(Math.random() * num);	}
