$(document).ready(function() {

  //Game Variables
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var zombieId = 1;
  //Player/Monster Stats
  var zombieHP = 1;
  var monsterStorage = {};
  var playerHP = 10;
  var frags = 0;
  var points = 0;
  //Images
  var zombie = document.getElementById('zombie');
  var block = document.getElementById('block');
  var player = document.getElementById('player');
  var fire = document.getElementById('bullets');
  var gamestate = true;
  //Block values
  var blockId = 1;
  var blockHW = (canvas.height / 10);
  var blockArr = [];
  var col = 1;
  var row = 1;
  var dx = 0;
  var dy = 0;
  var frame = 0;
  var positions = ["up", "down", "right", "left"];
  var sound = document.getElementById("audio");
  var prevSoundLvl = 0;

  //Sound Manager 2 - http://www.schillmania.com/projects/soundmanager2/

  window.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
      case 37: // Left
        updateBlock(gamer, 0, -1);
        gamer.position = "left";
        console.log("Column: " + blockArr[gamer.blockId].col);
        console.log("Row: " + blockArr[gamer.blockId].row);
        break;

      case 38: // Up
        updateBlock(gamer, -1, 0);
        gamer.position = "up";
        console.log("Column: " + blockArr[gamer.blockId].col);
        console.log("Row: " + blockArr[gamer.blockId].row);
        break;

      case 39: // Right
        updateBlock(gamer, 0, 1);
        gamer.position = "right";
        console.log("Column: " + blockArr[gamer.blockId].col);
        console.log("Row: " + blockArr[gamer.blockId].row);
        break;

      case 40: // Down
        updateBlock(gamer, 1, 0);
        gamer.position = "down";
        console.log("Column: " + blockArr[gamer.blockId].col);
        console.log("Row: " + blockArr[gamer.blockId].row);
        break;

      case 83: // Sound maybe 115
        if (sound.volume === 0.0) {
          sound.volume = prevSoundLvl;
        } else {
          prevSoundLvl = sound.volume;
          sound.volume = 0.0;
        }
        break;

      case 32: //spacebar fire
        console.log("space pressed");
        fight(gamer);
        //console.log(grabBlock(1,1));
        break;
    }
  }, false);

  var updateBlock = function(character, rowAdj, colAdj) {
    var currentIndex = character.blockId;
    var currentRow = blockArr[currentIndex].row;
    var currentCol = blockArr[currentIndex].col;
    var newBlockRow = currentRow + rowAdj;
    var newBlockCol = currentCol + colAdj;
    var newBlockIndex = -1;
    for (var i = 0; i < blockArr.length; i++) {
      var checkBlock = blockArr[i];
      if (checkBlock.row === newBlockRow && checkBlock.col === newBlockCol) {
        newBlockIndex = i;
        break;
      }
    }

    if (newBlockIndex !== -1 && blockArr[newBlockIndex].type === "block") {
      blockArr[newBlockIndex].type = blockArr[currentIndex].type;
      blockArr[currentIndex].type = "block";
      character.blockId = newBlockIndex;
    }
  };
  function Map() {
      this.blocks = blockArr;
      this.characters = [];

      this.create = function(){

      };

      //takes place of update block
      this.moveCharacter = function(character, rowA, colA){
          newBlock = this.locateNewBlock(character.block.x + rowA, characer.block.y + colA);
          if(!newBlock){
              //invalid block
              return false;
          }

          if(newBlock.populate(character)){
              //block now has the character
              character.block = newBlock; //let character know its new block
          } else {
              //block taken
              return false;
          }
      };
      this.locateNewBlock = function(x, y){
          for(var i = 0; i < this.blocks.length; i++){
              if(this.blocks[i].row == x && this.blocks[i].col == y){
                  return this.blocks[i];
              }
          }
          return false;
      };
  }

  //monster storage on map javascript
  //separate out characters from blocks - priority 1

  function Block(x, y, col_x, row_y) {
    this.x = x;
    this.y = y;
    this.col = col_x;
    this.row = row_y;
    this.id = blockId;
    this.type = "block";
    this.passable = 1;
    this.drawn = 0;
    blockId++;

    this.character = null;
    this.populate = function(character){
        if(this.passable){
            this.character = character;
            return true;
        }
        return false;
    };
    //block.character.type [zombie || player]

    this.draw = function(){
        ctx.drawImage(this.image, this.x, this.y, blockHW, blockHW);
    };
    //block.draw()
  }
  //image function is messed up here

  function drawBlock(block) {
    ctx.drawImage(block.image, block.x, block.y, blockHW, blockHW);
  }

  function drawOverBlock(block, image) {
    ctx.drawImage(image, block.x, block.y, blockHW, blockHW);
  }

  function Character(block_Id){
    // block id, passable
    this.block = null;

  }

  function Player(name, block_Id) {
    this.name = name;
    this.hp = playerHP;
    this.range = 3;
    this.blockId = block_Id;
    this.position = "down";
    blockArr[block_Id].type = "player";
    blockArr[block_Id].passable = 0;
  }

  function Zombie(block_Id) {
    this.hp = zombieHP;
    this.blockId = block_Id;
    this.speed = 1;
    this.range = 0;
    this.position = positions[Math.floor(Math.random() * positions.length)];
    this.row = blockArr[block_Id].row;
    this.col = blockArr[block_Id].col;
    blockArr[block_Id].type = "zombie";
    blockArr[block_Id].passable = 0;
    this.id = zombieId;
    zombieId++;
  }
  //grabs a block based on the row and column fed to it
  var grabBlock = function(trow, tcol) {
    for (i = 0; i < blockArr.length; i++) {
      if (blockArr[i].row === trow) {
        if (blockArr[i].col === tcol) {
          console.log(blockArr[i]);
          return blockArr[i].id;
        }
      }
    }
  };

  var damageCharacter = function(character, amount) {
    character.hp -= amount;
  };

  //fight function takes a character and range, finds a point based on range and deals damage to that area
  var fight = function(character) {
    var newRow = blockArr[character.blockId].row;
    var newCol = blockArr[character.blockId].col;
    console.log(character.position);
    var rangeAtk = Math.floor(Math.random() * character.range + 1);
    switch (character.position) {

      case "left":
        var point = grabBlock(newRow, newCol - rangeAtk);
        console.log("The range is: " + rangeAtk);
        console.log("The point is: " + point);
        //  if(point.hp){
        //    damageCharacter(point, 1);
        //  }
        drawOverBlock(blockArr[point], bullets);
        break;
      case "up":

        break;
      case "right":

        break;
      case "down":

        break;
    }
  };

  function initialCanvas() {
    for (i = 0; i < (canvas.width / (canvas.width / 100)); i++) {

      if (dx === canvas.width) {
        dx = 0;
        dy += blockHW;
        col = 1;
        row++;
      }

      blockArr[i] = new Block(dx, dy, col, row);
      dx += blockHW;
      col++;
    }
    console.log(blockArr.length);
  }

  function render() {
    for (i = 0; i < blockArr.length; i++) {

      if (dx === canvas.width) {
        dx = 0;
        dy += blockHW;
      }
      if (blockArr[i].type === "zombie") {
        blockArr[i].image = zombie;
      }
      if (blockArr[i].type === "player") {
        blockArr[i].image = player;
      }
      if (blockArr[i].type === "block") {
        blockArr[i].image = block;
      }
      if (blockArr[i].drawn === 0) {
        drawBlock(blockArr[i]);
      }

      dx += blockHW;
    }
  }

  function randomLoc() {
    var inUse = 0;
    var placement;
    while (inUse !== 1) {
      placement = Math.floor(Math.random() * blockArr.length);
      if (blockArr[placement].passable === 1) {
        inUse = 1;
      }
    }
    return placement;
  }

  //generate zombies
  var genZombies = function(amount) {
    for (var i = 0; i < amount; i++) {
      monsterStorage[Math.floor(Math.random() * 100)] = new Zombie(randomLoc());
    }
  };

  //Instantiate new zombies/players
  initialCanvas();
  genZombies(1);
  var gamer = new Player("Player", randomLoc());
  render();

  //randomspeed
  var randomSpeed = function(speed) {
    var chance = Math.floor(Math.random() * 100 + 1);
    if (chance > 50) {
      return Math.floor(Math.random() + 1);
    } else {
      return -(Math.floor(Math.random() + 1));
    }
  };


  //Run the Game
  var mainloop = function() {
    if (frame % 20 === 0) {
      for (var monster in monsterStorage) {
        var id = monsterStorage[monster];
        updateBlock(id, randomSpeed(id.speed), randomSpeed(id.speed));
        id.position = positions[Math.floor(Math.random() * positions.length)];
        //console.log(id.position);
      }
    }
    if (frame % 150 === 0) {
      //genZombies(Math.floor(Math.random()*3));
    }
    if (frame % 200 === 0) {
      frame = 0;
    }
    //console.log(frame);
    if (gamer.hp === 0 || gamer.hp < 0) {
      prompt("You have died, but you fragged " + frags + " Demons.");
    }
    frame++;
    render();
  };

  function gameloop() {
    var animFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      null;

    if (animFrame !== null) {

      var recursiveAnim = function() {
        mainloop();
        animFrame(recursiveAnim, canvas);
      };

      // start the mainloop
      animFrame(recursiveAnim, canvas);
    } else {
      var ONE_FRAME_TIME = 1000.0 / 60.0;
      setInterval(mainloop, ONE_FRAME_TIME);
    }
  }
  gameloop();

  Map.create();
});