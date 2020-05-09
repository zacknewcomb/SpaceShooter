/*
------------------------------
------- INPUT SECTION --------
------------------------------
*/

/**
 * This class binds key listeners to the window and updates the controller in attached player body.
 *
 * @typedef InputHandler
 */
class InputHandler {
	/**
	*
	* Given code from Ethan
	* @type {Not Sure Really}
	*
	*/
	key_code_mappings = {
		button: {
			32: {key: 'space', state: 'action_1'}
		},
		axis: {
			68: {key: 'right', state: 'move_x', mod: 1},
			65: {key: 'left', state: 'move_x', mod: -1},
			87: {key: 'up', state: 'move_y', mod: -1},
			83: {key: 'down', state: 'move_y', mod: 1}
		}
	};
	player = null;

	constructor(player) {
		this.player = player;

		// bind event listeners
		window.addEventListener("keydown", (event) => this.keydown(event), false);
		window.addEventListener("keyup", (event) => this.keyup(event), false);
	}

	/**
	 * This is called every time a keydown event is thrown on the window.
	 *
	 * @param {Object} event The keydown event
	 */
	keydown(event) {
		// ignore event handling if they are holding down the button
		if (event.repeat || event.isComposing || event.keyCode === 229)
			return;

		if (event.isComposing || event.keyCode === 229)
	    return;
		// check if axis mapping exists
		if (this.key_code_mappings.axis.hasOwnProperty(event.keyCode)) {
			const mapping = this.key_code_mappings.axis[event.keyCode];
			this.player.controller[mapping.state] += mapping.mod;
			console.log(`input_handler[axis:${mapping.state} state:${this.player.controller[mapping.state]}]`);
		}

		// check if button mapping exists
		if (this.key_code_mappings.button.hasOwnProperty(event.keyCode)) {
			const mapping = this.key_code_mappings.button[event.keyCode];
			this.player.controller[mapping.state] = true;
			console.log(`input_handler[button:${mapping.state} state:${this.player.controller[mapping.state]}]`);
		}
	}

	/**
	 * This is called every time a keyup event is thrown on the window.
	 *
	 * @param {Object} event The keyup event
	 */
	keyup(event) {
		if (event.isComposing || event.keyCode === 229)
			return;

		// check if axis mapping exists
		if (this.key_code_mappings.axis.hasOwnProperty(event.keyCode)) {
			const mapping = this.key_code_mappings.axis[event.keyCode];
			this.player.controller[mapping.state] -= mapping.mod;
			console.log(`input_handler[axis:${mapping.state} state:${this.player.controller[mapping.state]}]`);
		}

		// check if button mapping exists
		if (this.key_code_mappings.button.hasOwnProperty(event.keyCode)) {
			const mapping = this.key_code_mappings.button[event.keyCode];
			this.player.controller[mapping.state] = false;
			console.log(`input_handler[button:${mapping.state} state:${this.player.controller[mapping.state]}]`);
		}
	}
}

/*
------------------------------
------- BODY SECTION  --------
------------------------------
*/

/**
 * Represents a basic physics body in the world. It has all of the necessary information to be
 * rendered, checked for collision, updated, and removed.
 *
 * @typedef Body
 */
class Body {
	/**
	* The x and y location of the Body
	* @type {Number}
	*/
	position = {x: 0, y: 0};
	/**
	* The x and y velocity of the Body
	* @type {Number}
	*/
	velocity = {x: 0, y: 0};
	/**
	* The height and width of the Body
	* @type {Number}
	*/
	size = {width: 10, height: 10};
	/**
	* The health measure of the Body
	* @type {Number}
	*/
	health = 100;

	/**
	 * Creates a new body with all of the default attributes
	 */
	constructor() {
		// generate and assign the next body id
		this.id = running_id++;
		// add to the entity map
		entities[this.id] = this;
	}

	/**
	 * @type {Object} An object with two properties, width and height. The passed width and height
	 * are equal to half ot the width and height of this body.
	 */
	get half_size() {
		return {
			width: this.size.width / 2,
			height: this.size.height / 2
		};
	}

	/**
	 * @returns {Boolean} true if health is less than or equal to zero, false otherwise.
	 */
	isDead() {
		return this.health <= 0;
	}

	/**
	 * Updates the position of this body using the set velocity.
	 *
	 * @param {Number} delta_time Seconds since last update
	 */
	update(delta_time) {
		// move body
		this.position.x += delta_time * this.velocity.x;
		this.position.y += delta_time * this.velocity.y;
	}

	/**
	 * This function draws a green line in the direction of the body's velocity. The length of this
	 * line is equal to a tenth of the length of the real velocity
	 *
	 * @param {CanvasRenderingContext2D} graphics The current graphics context.
	 */
	draw(graphics) {
		graphics.strokeStyle = '#00FF00';
		graphics.beginPath();
		graphics.moveTo(this.position.x, this.position.y);
		graphics.lineTo(this.position.x + this.velocity.x / 10, this.position.y + this.velocity.y / 10);
		graphics.stroke();
	}

	/**
	 * Marks this body to be removed at the end of the update loop
	 */
	remove() {
		queued_entities_for_removal.push(this.id);
	}
}

/**
 * @class Represents an player body. Extends a Body by handling input binding and controller management.
 * @author Zack Newcomb & Ethan Toney's starting code
 * @typedef Player
 */
class Player extends Body {
	// this controller object is updated by the bound input_handler
	controller = {
		move_x: 0,
		move_y: 0,
		action_1: false
	};
	/**
	* The speed of the player
	* @type {Number}
	*/
	speed = 100;
	/**
	* The input handler of the player
	* @type {Null}
	*/
	input_handler = null;

	/**
	 * Creates a new player with the default attributes.
	 */
	constructor() {
		super();

		// bind the input handler to this object
		this.input_handler = new InputHandler(this);

		// we always want our new players to be at this location
		/**
		* The x and y position of the player
		* @type {Number}
		*/
		this.position = {
			x: config.canvas_size.width / 2,
			y: config.canvas_size.height - 100
		};
		/**
		* The the game score accured by the player
		* @type {Number}
		*/
		this.gameScore = 0
		/**
		* The number of enemies killed by the player
		* @type {Number}
		*/
		this.enemyKilled = 0
		/**
		* The number of enemies spawned in the game
		* @type {Number}
		*/
		this.enemyCount = 0
		/**
		* The time in seconds that the player has remained alive
		* @type {Number}
		*/
		this.aliveTime = 0
		/**
		* time counter
		* @type {Number}
		*/
		this.time_ct = 0
	}



	/**
	 * Draws the player as a triangle centered on the player's location.
	 *
	 * @param {CanvasRenderingContext2D} graphics The current graphics context.
	 */
	 draw(graphics) {
		/*
		graphics.strokeStyle = '#000000';
		graphics.beginPath();
		graphics.moveTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.lineTo(
			this.position.x + this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x - this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.stroke();
		*/

//Get the canvas element by using the getElementById method.
		var canvas = document.getElementById('game_canvas');

//Get a 2D drawing context for the canvas.
		var context = canvas.getContext('2d');

//The path to the image that we want to add.
		var imgPath = 'galaga_ship.png';

//Create a new Image object.
		var imgObj = new Image();

//Set the src of this Image object.
		imgObj.src = imgPath;

//the x coordinates
		var x = this.position.x;

//the y coordinates
		var y = this.position.y;

		var ship_size = 20

		var shift = ship_size/2

		context.drawImage(imgObj, x-shift, y, ship_size,ship_size);

		// draw velocity lines
		// super.draw(graphics);
	}

	/**
	 * Updates the player given the state of the player's controller.
	 *
	 * @param {Number} delta_time Time in seconds since last update call.
	 */
	update(delta_time) {
		/*
			implement player movement here!

			I recommend you look at the development console's log to get a hint as to how you can use the
			controllers state to implement movement.

			You can also log the current state of the player's controller with the following code
			console.log(this.controller);
		 */

		 this.velocity.x = this.speed * this.controller.move_x
		 this.velocity.y = this.speed * this.controller.move_y

		 if (this.controller.move_x !== 0 && this.controller.move_y !== 0) {
			 this.velocity.x = this.velocity.x / Math.sqrt(2)
			 this.velocity.y = this.velocity.y / Math.sqrt(2)
		 }

		 if (this.controller.move_x === 0 && this.controller.move_y === 0) {
			 this.velocity.x = 0;
			 this.velocity.y = 0;
		 }


		 this.time_ct += delta_time

		 if (this.time_ct > 0.5 && player.controller.action_1) {
 			new Bullet()
 			this.time_ct = 0
		}

		if (player.isDead() === false) {
			this.aliveTime += (delta_time)
			this.gameScore = Math.floor(30 * this.enemyKilled + this.aliveTime)
	}

		// update position
		super.update(delta_time);

		// clip to screen
		this.position.x = Math.min(Math.max(0, this.position.x), config.canvas_size.width);
		this.position.y = Math.min(Math.max(0, this.position.y), config.canvas_size.height);
	}
}

/**
* .
* @class Enemy, Represents an enemy. Extends Body
* @author Zack Newcomb
* @typedef Enemy
*
*/
class Enemy extends Body {
	// this controller object is updated by the bound input_handler
	controller = {
		move_x: 0,
		move_y: 0,
		action_1: false
	};
	speed = 50;
	input_handler = null;

	/**
	 * Creates a new enemy with the default attributes.
	 */
	constructor() {
		super();

		// bind the input handler to this object
		this.input_handler = new InputHandler(this);

		// we always want our new players to be at this location
		/**
		* The x and y position of the enemy
		* @type {Number}
		*/
		this.position = {
			x: config.canvas_size.width * Math.random(),
			y: -config.canvas_size.height - 10
		};
	}

	/**
	 * Draws the enemy as a triangle located at its randomly generated position.
	 *
	 * @param {CanvasRenderingContext2D} graphics The current graphics context.
	 */
	draw(graphics) {
		graphics.strokeStyle = '#0000FF';
		graphics.beginPath();
		graphics.moveTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.lineTo(
			this.position.x + this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x - this.half_size.width,
			this.position.y + this.half_size.height
		);
		graphics.lineTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.stroke();

		// draw velocity lines
		super.draw(graphics);
	}

	/**
	 * Updates the enemy given the state of the enemy's controller.
	 *
	 * @param {Number} delta_time Time in seconds since last update call.
	 */
	update(delta_time) {
		// Implemented similar to player movement

		 this.velocity.x = 0
		 this.velocity.y = this.speed

		// update position
		super.update(delta_time);

		// clip to screen
		this.position.x = Math.min(Math.max(0, this.position.x), config.canvas_size.width);
		this.position.y = Math.min(Math.max(0, this.position.y), config.canvas_size.height);

		if (this.position.y >= config.canvas_size.height ) {
			queued_entities_for_removal.push(this.id)
		}
	}
}

/**
*
* @class Represents a bullet shot from the player. Extends Body
* @typedef bullet
* @author Zack Newcomb
*/

class Bullet extends Body {
	// this controller object is updated by the bound input_handler
	controller = {
		move_x: 0,
		move_y: 0,
		action_1: false
	};
	/**
	* The speed attribute of the bullet
	* @type {Number}
	*/
	speed = 50;
	/**
	* The input handler of the bullet
	* @type {Number}
	*/
	input_handler = null;

	/**
	 * Creates a new bullet with the default attributes.
	 */
	constructor() {
		super();

		// bind the input handler to this object
		this.input_handler = new InputHandler(this);

		// we always want our new bullets to be at this location
		this.position = {
			x: player.position.x,
			y: player.position.y -5
		};
	}

	/**
	 * Draws the bullet as a straight line aligned with the player's location.
	 *
	 * @param {CanvasRenderingContext2D} graphics The current graphics context.
	 */
	draw(graphics) {
		graphics.strokeStyle = '#FF0000';
		graphics.beginPath();
		graphics.moveTo(
			this.position.x,
			this.position.y - this.half_size.height
		);
		graphics.lineTo(
			this.position.x,
			this.position.y + 5
		);
		graphics.stroke();

		// draw velocity lines
		//super.draw(graphics);
	}

	/**
	 * Updates the bullet given the state of the bullet's controller.
	 *
	 * @param {Number} delta_time Time in seconds since last update call.
	 */
	update(delta_time) {
		// Implemented similar to player movement

		 this.velocity.x = 0
		 this.velocity.y = -this.speed * 2

		// update position
		super.update(delta_time);

		// clip to screen
		this.position.x = Math.min(Math.max(0, this.position.x), config.canvas_size.width);
		this.position.y = Math.min(Math.max(0, this.position.y), config.canvas_size.height);

		if (this.position.y == 0) {
			queued_entities_for_removal.push(this.id)
		}
	}
}

/**
* @class EnemySpawner Class that is used to create and send out enemies to the canvas
* @typedef EnemySpawner
* @author Zack Newcomb
*
*/

class EnemySpawner {
	/**
	* The time count to know when to spawn a new enemy
	* @type {Number}
	*/
	time_ct = 0

	/**
	 * Spawns new enemy based on if enough time has passed (Specifically a half second)
	 *
	 * @param {Number} delta_time Time in seconds since last update call.
	 */
	update(delta_time) {
		this.time_ct += delta_time
		if (this.time_ct > 0.5) {
			new Enemy()
			if (player.isDead() === false) {
				player.enemyCount += 1
			}
			this.time_ct = 0
		}
	}
}

/**
* @class CollisionHandler Checker to see if two bodies collide, and if so perform appropriate actions based on what the bodies are
* @typedef CollisionHandler
* @author Zack Newcomb
*/

class CollisionHandler {
	/**
	* Collision creates two boxes, and checks if they collide, then reacts appropriately
	*/
	Collision() {
		for (let i = 0; i < entities.length; i++) {
			for (let j = 0; j < entities.length; j++) {
				if ((entities[i] !== undefined) && (entities[j] !== undefined)&& (entities[i] !== entities[j])) {
					if (entities[i] === player) {
						var rect1 = {x: player.position.x, y: player.position.y, width: player.half_size.width, height: player.half_size.height}
						var rect2 = {x: entities[j].position.x, y: entities[j].position.y, width: entities[j].half_size.width, height: entities[j].half_size.height}
					}
					else if (entities[j] === player) {
						var rect1 = {x: player.position.x, y: player.position.y, width: player.half_size.width, height: player.half_size.height}
						var rect2 = {x: entities[i].position.x, y: entities[i].position.y, width: entities[i].half_size.width, height: entities[i].half_size.height}
					}
					else {
						var rect1 = {x: entities[j].position.x, y: entities[j].position.y, width: entities[j].half_size.width, height: entities[j].half_size.height}
						var rect2 = {x: entities[i].position.x, y: entities[i].position.y, width: entities[i].half_size.width, height: entities[i].half_size.height}
					}

					if (rect1.x < rect2.x + rect2.width &&
			   		rect1.x + rect1.width > rect2.x &&
			   		rect1.y < rect2.y + rect2.height &&
			   		rect1.y + rect1.height > rect2.y) {
							if (entities[i] === player) {
								queued_entities_for_removal.push(entities[j].id)
								player.health -= 50
							}
							else if (entities[j] === player) {
								queued_entities_for_removal.push(entities[i].id)
							}
							else {
								queued_entities_for_removal.push(entities[i].id)
								queued_entities_for_removal.push(entities[j].id)
								if (player.isDead() === false) {
									player.enemyKilled += 0.5;
								}
							}}}}}}

	/**
	* Calls the Collision function
	*
	* @param {Number} delta_time Time in seconds since last update call.
	*/
	update(delta_time) {

		this.Collision()
	}
}

/*
------------------------------
------ CONFIG SECTION --------
------------------------------
*/

const config = {
	graphics: {
		// set to false if you are not using a high resolution monitor
		is_hi_dpi: true
	},
	canvas_size: {
		width: 300,
		height: 500
	},
	update_rate: {
		fps: 60,
		seconds: null
	}
};

config.update_rate.seconds = 1 / config.update_rate.fps;

// grab the html span
const game_state = document.getElementById('game_state');

// grab the html canvas
const game_canvas = document.getElementById('game_canvas');
game_canvas.style.width = `${config.canvas_size.width}px`;
game_canvas.style.height = `${config.canvas_size.height}px`;

const graphics = game_canvas.getContext('2d');

// for monitors with a higher dpi
if (config.graphics.is_hi_dpi) {
	game_canvas.width = 2 * config.canvas_size.width;
	game_canvas.height = 2 * config.canvas_size.height;
	graphics.scale(2, 2);
} else {
	game_canvas.width = config.canvas_size.width;
	game_canvas.height = config.canvas_size.height;
	graphics.scale(1, 1);
}

/*
------------------------------
------- MAIN SECTION  --------
------------------------------
*/

/** @type {Number} last frame time in seconds */
var last_time = null;

/** @type {Number} A counter representing the number of update calls */
var loop_count = 0;

/** @type {Number} A counter that is used to assign bodies a unique identifier */
var running_id = 0;

/** @type {Object<Number, Body>} This is a map of body ids to body instances */
var entities = null;

/** @type {Array<Number>} This is an array of body ids to remove at the end of the update */
var queued_entities_for_removal = null;

/** @type {Player} The active player */
var player = null;

/* You must implement this, assign it a value in the start() function */
var enemy_spawner = null;

/* You must implement this, assign it a value in the start() function */
var collision_handler = null;

/**
 * This function updates the state of the world given a delta time.
 *
 * @param {Number} delta_time Time since last update in seconds.
 */
function update(delta_time) {
	// move entities
	Object.values(entities).forEach(entity => {
		entity.update(delta_time);
	});

	// detect and handle collision events
	if (collision_handler != null) {
		collision_handler.update(delta_time);
	}

	// remove enemies
	queued_entities_for_removal.forEach(id => {
		delete entities[id];
	})
	queued_entities_for_removal = [];

	// spawn enemies
	if (enemy_spawner != null) {
		enemy_spawner.update(delta_time);
	}

	// allow the player to restart when dead
	if (player.isDead() && player.controller.action_1) {
		start();
	}
}

/**
 * This function draws the state of the world to the canvas.
 *
 * @param {CanvasRenderingContext2D} graphics The current graphics context.
 */
function draw(graphics) {
	// default font config
	graphics.font = "10px Arial";
	graphics.textAlign = "left";

	// draw background (this clears the screen for the next frame)
	graphics.fillStyle = '#FFFFFF';
	graphics.fillRect(0, 0, config.canvas_size.width, config.canvas_size.height);

	// for loop over every eneity and draw them
	Object.values(entities).forEach(entity => {
		entity.draw(graphics);
	});

	// game over screen
	if (player.isDead()) {
		graphics.fillStyle = "red";
		graphics.font = "30px Arial";
		graphics.textAlign = "center";
		graphics.fillText('Game Over', config.canvas_size.width / 2, config.canvas_size.height / 2);

		graphics.font = "12px Arial";
		graphics.textAlign = "center";
		graphics.fillText('press space to restart', config.canvas_size.width / 2, 18 + config.canvas_size.height / 2);

		graphics.font = "16px Arial";
		graphics.textAlign = "center";
		let str1 = "Score: ";
		let str2 = player.gameScore;
		let output1 = str1.concat(str2)
		graphics.fillText(output1, config.canvas_size.width / 2, 36 + config.canvas_size.height / 2);

		graphics.font = "12px Arial";
		graphics.textAlign = "center";
		let str3 = "Enemies Hit: ";
		let str4 = player.enemyKilled;
		let output2 = str3.concat(str4)
		graphics.fillText(output2, config.canvas_size.width / 2, 54 + config.canvas_size.height / 2);

		graphics.font = "12px Arial";
		graphics.textAlign = "center";
		let str5 = "Seconds Survived: ";
		let str6 = Math.floor(player.aliveTime);
		let output3 = str5.concat(str6)
		graphics.fillText(output3, config.canvas_size.width / 2, 72 + config.canvas_size.height / 2);

		graphics.font = "12px Arial";
		graphics.textAlign = "center";
		let str7 = "Enemies Spawned: ";
		let str8 = player.enemyCount;
		let output4 = str7.concat(str8)
		graphics.fillText(output4, config.canvas_size.width / 2, 90 + config.canvas_size.height / 2);
	}

}

/**
 * This is the main driver of the game. This is called by the window requestAnimationFrame event.
 * This function calls the update and draw methods at static intervals. That means regardless of
 * how much time passed since the last time this function was called by the window the delta time
 * passed to the draw and update functions will be stable.
 *
 * @param {Number} curr_time Current time in milliseconds
 */
function loop(curr_time) {
	// convert time to seconds
	curr_time /= 1000;

	// edge case on first loop
	if (last_time == null) {
		last_time = curr_time;
	}

	var delta_time = curr_time - last_time;

	// this allows us to make stable steps in our update functions
	while (delta_time > config.update_rate.seconds) {
		update(config.update_rate.seconds);
		draw(graphics);

		delta_time -= config.update_rate.seconds;
		last_time = curr_time;
		loop_count++;

		game_state.innerHTML = `loop count ${loop_count}`;
	}

	window.requestAnimationFrame(loop);
}

function start() {
	entities = [];
	queued_entities_for_removal = [];
	player = new Player();

	enemy_spawner = new EnemySpawner
	collision_handler = new CollisionHandler
}

// start the game
start();

// start the loop
window.requestAnimationFrame(loop);
