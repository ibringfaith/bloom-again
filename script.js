/* VARIABLES */
let sunLight, blossom, rain, ice, debris, player, music;
let bloomMeter = 0;
let headerFont, paragraphFont;
let screen = 0;
let gameState = "menu";
let playerSpriteSheet;
let blossomScore = 0, rainScore = 0, sunLightScore = 0;
let maxBlossoms = 8;
let progressBarWidth = 200;
let progressBarHeight = 20;

/* PRELOAD LOADS FILES */
function preload() {
  //backgrounds
  beginningBackground = loadImage("assets/beginning.jpg");
  winterForest = loadImage('assets/Free Pixel Art Winter Forest/PREVIEWS/Winter_example.gif');
  thawingMeadow = loadImage('assets/meadow.png');
  blossomBackground = loadImage('assets/spring.jpg');

  // music
  backgroundMusic = loadSound('assets/springDayFullAudioWithOutro.mp3');
  musicIcon = loadImage('assets/music.png');

  //fonts
  headerFont = loadFont('assets/countryside-font/Countryside-YdKj.ttf');
  paragraphFont = loadFont('assets/Roboto/Roboto-VariableFont_wdth,wght.ttf');

  //sprites
  playerSpriteSheet = loadImage('assets/AnimationSheet_Character.png');
  iceShard = loadImage('assets/ice.webp');
  treeBranch = loadImage('assets/debris.png');
  raindrop = loadImage('assets/raindrop.png');
  sakuraBlossom = loadImage('assets/sakuraBlossom.png');
  sun = loadImage('assets/sun.png');
}

/* SETUP RUNS ONCE */
function setup() {
  createCanvas(600, 500);
  imageMode(CENTER);

  // Create buttons for all screens
  howToPlayButton = new Sprite(width / 2, height / 2 + 100, 100, 50);
  startGameButton = new Sprite(width / 2, height / 2, 100, 50);
  backButton = new Sprite(-200, -200, 150, 50);
  playAgainButton = new Sprite(-50, -50, 150, 50);
  musicButton = new Sprite(width - 20, 20);

  // Create player
  player = new Sprite(-400, -400, 32, 32, "k");
  player.spriteSheet = playerSpriteSheet;
  player.anis.frameDelay = 8;
  player.friction = 0;

  player.addAnis({
    idle: { row: 0, frames: 2 },
    idleBlink: { row: 1, frames: 2 },
    walk: { row: 2, frames: 4 },
    run: { row: 3, frames: 8 },
    duck: { row: 4, frames: 6 },
    jump: { row: 5, frames: 8 },
    disappear: { row: 6, frames: 3 },
    fall: { row: 7, frames: 8 },
    attack: { row: 8, frames: 8 },
  });

  player.changeAni('idle');

  // Falling objects
  iceShard.resize(20, 20);
  ice = new Sprite(-100, 100, 20);
  ice.image = iceShard;
  debris = new Sprite(-100, 200, 10);
  treeBranch.resize(20, 20);
  debris.image = treeBranch;
  rain = new Sprite(-500, -500, 10);
  raindrop.resize(20, 20);
  rain.image = raindrop;
  blossom = new Sprite(-550, -550, 10);
  sakuraBlossom.resize(20, 20);
  blossom.image = sakuraBlossom;
  sunLight = new Sprite(-600, -600, 10);
  sun.resize(20, 20);
  sunLight.image = sun;

  // Music
  musicIcon.resize(50, 50);
  musicButton.image = musicIcon;
  musicButton.collider = "kinematic";
}

/* DRAW LOOP REPEATS */
function draw() {
  if (musicButton.mouse.presses() & !backgroundMusic.isPlaying()) {
    backgroundMusic.setVolume(0.20);
    backgroundMusic.play();
  }

  if (gameState == "menu" & screen == 0) {
    showHomeScreen();
  }

  // Check how to play button
  if (howToPlayButton.mouse.presses()) {
    showHowToPlayScreen();
    screen = 1;
  }

  // Check back to home screen button
  if (screen == 1 & backButton.mouse.presses()) {
    showHomeScreen();
  }

  // Check start game button
  if ((screen == 1 & startGameButton.mouse.presses()) || (screen == 0 & startGameButton.mouse.presses())) {
    gameState = "level1";
  }

  // Handle different game states
  if (gameState == "level1") {
    showLevel1();
    playerMovement();
    iceMovement();
    debrisMovement();
    rainMovement();
    sunLightMovement();
    blossomMovement();

    // Draw the score to the screen
    fill(146, 233, 242);
    textSize(20);
    text("Rain Collected: " + rainScore, 20, 30);
    text("Sun Light Collected: " + sunLightScore, 20, 50);

    // Draw progress bar
    drawProgressBar();

    if (sunLightScore > 7) {
      sunLightScore = 7;
    }

    if (rainScore > 7) {
      rainScore = 7;
    }

    if (blossomScore > 4) {
      blossomScore = 4;
    }

    if (sunLightScore == 7 && rainScore == 7 && blossomScore == 4) {
      gameState = "level2";
    }
  }

  if (gameState == "level2") {
    camera.on();
    showLevel2();
    playerMovement();
    iceMovement();
    debrisMovement();
    rainMovement();
    sunLightMovement();
    blossomMovement();

    camera.x = player.x;

    // Draw the score to the screen
    fill(146, 233, 242);
    textSize(20);

    // Draw progress bar
    drawProgressBar();

    if (blossomScore == maxBlossoms) {
      player.pos = { x: width / 2, y: 460 };
      camera.off();
      gameState = "win";
    }
  }

  if (gameState == "win") {
    showWinScreen();
  }

  // Check the play again button
  if (playAgainButton.mouse.presses()) {
    rainScore = 0;
    sunLightScore = 0;
    blossomScore = 0;
    playAgainButton.pos = { x: 800, y: 800 };
    backgroundMusic.stop();
    backgroundMusic.play();
    gameState = "level1";
  }
}

/* FUNCTIONS */
function showHowToPlayScreen() {
  image(beginningBackground, width / 2, height / 2);

  // title
  textFont(headerFont);
  textAlign(CENTER);
  text("How To Play", width / 2, height / 2 - 200);

  // instructions
  textFont(paragraphFont);
  textSize(15);
  text("Movement: Use the left arrow key to move left and the right arrow key to move right",
    width / 2,
    height / 2 - 150);
  text("Collect: 7 Raindrops, 7 sunrays, 4 blossoms", width / 2, height / 2 - 125);
  text("Avoid: Ice and falling debris",
    width / 2,
    height / 2 - 100);
  text("Win: Fill up the bloom meter",
    width / 2,
    height / 2 - 75);

  // remove buttons from screen
  howToPlayButton.pos = { x: 900, y: 900 };
  playAgainButton.pos = { x: 1000, y: 1000 };

  // Add back button
  backButton.pos = { x: width / 2, y: height / 2 + 100 };
  backButton.collider = "kinematic";
  backButton.color = color(146, 233, 242);
  backButton.text = "Back to Home Screen";
}

function showHomeScreen() {
  gameState = "menu";
  image(beginningBackground, width / 2, height / 2);

  // title
  textFont(headerFont);
  textStyle(BOLD);
  textSize(30);
  textAlign(CENTER);
  text(
    "Bloom Again",
    width / 2,
    height / 2 - 150
  );

  // buttons
  textFont(paragraphFont);
  howToPlayButton.collider = "kinematic";
  howToPlayButton.color = color(146, 233, 242);
  howToPlayButton.text = "How to Play";

  startGameButton.collider = "kinematic";
  startGameButton.color = color(146, 233, 242);
  startGameButton.text = "Start Game";

  howToPlayButton.pos = { x: width / 2, y: height / 2 + 100 };
  startGameButton.pos = { x: width / 2, y: height / 2 };

  // remove buttons from screen
  backButton.pos = { x: -700, y: -700 };
  playAgainButton.pos = { x: -800, y: -800 };
}

function showLevel1() {
  textAlign(LEFT, BASELINE);
  // Resize the image to fit the canvas and display it as the background
  let aspectRatio = winterForest.width / winterForest.height;
  let canvasAspectRatio = width / height;

  if (aspectRatio > canvasAspectRatio) {
    // Image is wider, fit to height
    let scaledWidth = height * aspectRatio;
    image(winterForest, width / 2, height / 2, scaledWidth, height);
  } else {
    // Image is taller, fit to width
    let scaledHeight = width / aspectRatio;
    image(winterForest, width / 2, height / 2, width, scaledHeight);
  }

  startGameButton.pos = { x: -900, y: -900 };
  howToPlayButton.pos = { x: -1000, y: -1000 };
  backButton.pos = { x: -1100, y: -1100 };

  // Only set player position when first entering level 1
  if (player.x < 0) {
    player.pos = { x: width / 2, y: 460 };
  }
}

function playerMovement() {
  if (kb.pressing('left')) {
    //player.changeAni('walk');
    player.vel.x = -2;
    player.scale.x = -1;
  } else if (kb.pressing('right')) {
    //player.changeAni('run');
    player.vel.x = 2;
    player.scale.x = 1;
  } else {
    //player.changeAni('idle');
    player.vel.x = 0;
  }

  // Stop the player at the edges of the screen (or background in level 2)
  if (player.x < 10) {
    player.x = 10;
  }
  else if (player.x > width - 10) {
    player.x = width - 10;
  }
}

function iceMovement() {
  // Initialize ice sprite position if not set
  if (ice.x < 0) {
    ice.x = random(width);
    ice.y = 0;
  }
  ice.vel.y = 2;

  // If fallingObject reaches bottom, move back to random position at top
  if (ice.y >= height) {
    ice.y = 0;
    ice.x = random(width);
    ice.vel.y = random(1, 5);
  }

  // If fallingObject collides with catcher, move back to random position at top
  if (ice.collides(player)) {
    ice.y = 0;
    ice.x = random(width);
    ice.vel.y = random(1, 5);
    ice.direction = "down";
    blossomScore = max(0, blossomScore - 1);
  }
}

function debrisMovement() {
  // Initialize ice sprite position if not set
  if (debris.x < 0) {
    debris.x = random(width);
    debris.y = 0;
  }
  debris.vel.y = 2;

  // If fallingObject reaches bottom, move back to random position at top
  if (debris.y >= height) {
    debris.y = 0;
    debris.x = random(width);
    debris.vel.y = random(1, 5);
  }

  // If fallingObject collides with catcher, move back to random position at top
  if (debris.collides(player)) {
    debris.y = 0;
    debris.x = random(width);
    debris.vel.y = random(1, 5);
    debris.direction = "down";
    blossomScore = max(0, blossomScore - 1);
  }
}

function rainMovement() {
  // Initialize ice sprite position if not set
  if (rain.x < 0) {
    rain.x = random(width);
    rain.y = 0;
  }
  rain.vel.y = 2;

  // If fallingObject reaches bottom, move back to random position at top
  if (rain.y >= height) {
    rain.y = 0;
    rain.x = random(width);
    rain.vel.y = random(1, 5);
  }

  // If fallingObject collides with catcher, move back to random position at top
  if (rain.collides(player)) {
    rain.y = 0;
    rain.x = random(width);
    rain.vel.y = random(1, 5);
    rain.direction = "down";
    rainScore += 1;
  }
}

function sunLightMovement() {
  // Initialize ice sprite position if not set
  if (sunLight.x < 0) {
    sunLight.x = random(width);
    sunLight.y = 0;
  }
  sunLight.vel.y = 2;

  // If fallingObject reaches bottom, move back to random position at top
  if (sunLight.y >= height) {
    sunLight.y = 0;
    sunLight.x = random(width);
    sunLight.vel.y = random(1, 5);
  }

  // If fallingObject collides with catcher, move back to random position at top
  if (sunLight.collides(player)) {
    sunLight.y = 0;
    sunLight.x = random(width);
    sunLight.vel.y = random(1, 5);
    sunLight.direction = "down";
    sunLightScore += 1;
  }
}

function blossomMovement() {
  // Initialize ice sprite position if not set
  if (blossom.x < 0) {
    blossom.x = random(width);
    blossom.y = 0;
  }
  blossom.vel.y = 2;

  // If fallingObject reaches bottom, move back to random position at top
  if (blossom.y >= height) {
    blossom.y = 0;
    blossom.x = random(width);
    blossom.vel.y = random(1, 5);
  }

  // If fallingObject collides with catcher, move back to random position at top
  if (blossom.collides(player)) {
    blossom.y = 0;
    blossom.x = random(width);
    blossom.vel.y = random(1, 5);
    blossom.direction = "down";
    blossomScore = min(maxBlossoms, blossomScore + 1);
  }
}

function drawProgressBar() {
  // Progress bar position
  let barX = 20;
  let barY = 100;

  // Draw progress bar background
  fill(50, 50, 50);
  stroke(255);
  strokeWeight(2);
  rect(barX, barY, progressBarWidth, progressBarHeight);

  // Calculate progress fill
  let progress = blossomScore / maxBlossoms;
  let fillWidth = progress * progressBarWidth;

  // Draw progress fill
  noStroke();
  fill(242, 155, 146);
  rect(barX, barY, fillWidth, progressBarHeight);

  // Draw progress text
  fill(255);
  textSize(14);
  text(blossomScore + "/" + maxBlossoms, barX + progressBarWidth / 2, barY + progressBarHeight / 2 + 4);

  // Draw label
  textSize(16);
  textFont(paragraphFont);
  text("Bloom Progress:", barX, barY - 5);
}

function showLevel2() {
  // Center the background image
  image(thawingMeadow, 0, height / 2, thawingMeadow.width, thawingMeadow.height);
}

function showWinScreen() {
  // draw sprites off-screen
  rain.pos = { x: -1100, y: 100 };
  sunLight.pos = { x: -1000, y: 300 };
  debris.pos = { x: -900, y: 400 };
  blossom.pos = { x: -800, y: -100 };
  ice.pos = { x: -700, y: -150 };
  player.pos = { x: -600, y: -200 };

  textAlign(CENTER);

  // Resize the image to fit the canvas and display it as the background
  let aspectRatio = blossomBackground.width / blossomBackground.height;
  let canvasAspectRatio = width / height;

  if (aspectRatio > canvasAspectRatio) {
    // Image is wider, fit to height
    let scaledWidth = height * aspectRatio;
    image(blossomBackground, width / 2, height / 2, scaledWidth, height);
  } else {
    // Image is taller, fit to width
    let scaledHeight = width / aspectRatio;
    image(blossomBackground, width / 2, height / 2, width, scaledHeight);
  }

  fill(34, 49, 29);
  textSize(18);
  textFont(headerFont);
  textStyle(BOLD);
  textSize(30);
  text("Spring Has Returned!", width / 2, height / 2);

  textFont(paragraphFont);
  playAgainButton.pos = { x: width / 2, y: 450 };
  playAgainButton.collider = "kinematic";
  playAgainButton.color = color(146, 233, 242);
  playAgainButton.text = "Play Again";
}