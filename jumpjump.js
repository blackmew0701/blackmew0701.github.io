/**
* Define three types of scenes. Flow chart shown below: 
*             start            game over
*  startScene -----> gameScene ---------> endScene
*                              <---------
*                                restart
*/
window.onload = startScene;

function startScene(){
	start = document.createElement("input");
	start.type = "button";
	start.onclick = gameScene;
	start.value = "Start";
    start.id = "menuScene-output";
	// add startScene to the html element
	document.getElementById("WebGL-output").appendChild(start);
}

function gameScene(){
	gg = document.createElement("input");
	gg.type = "button";
	gg.onclick = endScene;
	gg.value = "Game running ...";
    gg.id = "gameScene-output";
	
	// Change scene from startScene/endScene to gameScene
	oldScene = document.getElementById("menuScene-output");
	document.getElementById("WebGL-output").replaceChild(gg,oldScene);
}

function endScene(score){
	end = document.createElement("input");
	end.type = "button";
	end.onclick = gameScene;
	end.value = "Game over! restart";
    end.id = "menuScene-output";
	// Change scene from gameScene to endScene
	oldScene = document.getElementById("gameScene-output");
	document.getElementById("WebGL-output").replaceChild(end,oldScene);
}