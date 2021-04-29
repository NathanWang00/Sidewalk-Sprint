class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        this.load.image('road', './assets/road.png');
        this.load.image('trash', './assets/trash.png');
        this.load.image('streetlight', './assets/streetlight.png');
        this.load.image('piano', './assets/piano.png');
        this.load.image('farBG', './assets/farBG.png');
        this.load.image('clouds', './assets/clouds.png');
        this.load.image('bg', './assets/streetBG.png');
        this.load.image('window', './assets/windowOverlay.png');
        this.load.image('gameOver', './assets/gameOver.png');
        this.load.atlas('pTexture', './assets/pTexture.png', './assets/pTexture.json');
    }

    create() {
        this.gameOver = false;

        // place street background
        this.clouds = this.add.tileSprite(0, 0, 2560, 720, 'clouds').setOrigin(0, 0);
        this.farBG = this.add.tileSprite(0, 199, 3840, 285, 'farBG').setOrigin(0, 0);
        this.bg = this.add.tileSprite(0, 0, 3840, 482, 'bg').setOrigin(0, 0);

        this.clouds.setScale(0.5, 0.5);

        // text config
        this.playConfig = {

            fontFamily: 'crayonhand',
            fontSize: '42px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'left'

        }

        // place road sprite
        var scale = 0.55;
        this.road = this.add.tileSprite(0, 480, 1280/scale, 436/scale, 'road').setOrigin(0, 0);
        this.physics.add.existing(this.road, true);
        this.road.body.position.y = 500;
        this.road.body.immovable = true;
        this.road.setScale(scale, scale);

        // create streetlight
        this.light = this.physics.add.sprite(game.config.width + 100, 363, 'streetlight');
        this.light.body.allowGravity = false;
        this.light.setScale(0.541, 0.541);
        this.light.setPushable(false);
        this.light.setSize(80, 150, false);
        this.light.setOffset(100, 20);

        // create trash
        this.trash = this.physics.add.sprite(game.config.width + 100, 471, 'trash');
        this.trash.body.allowGravity = false;
        this.trash.setScale(0.541, 0.541);
        this.trash.setPushable(false);
        this.trash.setSize(142, 135, false);
        this.trash.setOffset(10, 20);

        // create piano
        this.piano = this.physics.add.sprite(game.config.width + 100, -50, 'piano').setOrigin(0, 0);
        this.piano.body.allowGravity = false;
        this.piano.setPushable(false);
        this.piano.setSize(170, 150);
        this.piano.setOffset(25, 325);

        // too lazy to make prefabs
        this.light2 = this.physics.add.sprite(game.config.width + 100, 363, 'streetlight');
        this.light2.body.allowGravity = false;
        this.light2.setScale(0.541, 0.541);
        this.light2.setPushable(false);
        this.light2.setSize(80, 150, false);
        this.light2.setOffset(100, 20);

        this.trash2 = this.physics.add.sprite(game.config.width + 100, 471, 'trash');
        this.trash2.body.allowGravity = false;
        this.trash2.setScale(0.541, 0.541);
        this.trash2.setPushable(false);
        this.trash2.setSize(142, 135, false);
        this.trash2.setOffset(10, 20);

        this.piano2 = this.physics.add.sprite(game.config.width + 100, -50, 'piano').setOrigin(0, 0);
        this.piano2.body.allowGravity = false;
        this.piano2.setPushable(false);
        this.piano2.setSize(170, 150);
        this.piano2.setOffset(25, 325);

        this.light.enable = 0;
        this.trash.enable = 0;
        this.piano.enable = 0;
        this.light2.enable = 0;
        this.trash2.enable = 0;
        this.piano2.enable = 0;

        this.activeObject = null;

        // obstacle group
        this.obstacles = this.add.group();
        this.obstacles.add(this.light);
        this.obstacles.add(this.trash);
        this.obstacles.add(this.piano);
        this.obstacles.add(this.trash2);
        this.obstacles.add(this.light2);
        this.obstacles.add(this.piano2);
        this.obstacles.shuffle();

        // add camera
        this.camera = this.cameras.add();
        this.camera.setBackgroundColor('rgba(255, 255, 255, 1)');

        // player logic
        this.isSliding = false;
        this.slideWait = false;
        this.isRun = false;
        this.slideFriction = 0;
        this.airSlide = false;

        // create player
        this.anims.create({ 
            key: 'runAnim', 
            frames: this.anims.generateFrameNames('pTexture', {
                start: 1,
                end: 8,
                zeroPad: 1,
                prefix: 'run',
                suffix: '.gif'
            }),
            frameRate: 12, 
            repeat: -1
        });

        this.anims.create({ 
            key: 'jumpAnim', 
            frames: this.anims.generateFrameNames('pTexture', {
                start: 2,
                end: 15,
                zeroPad: 2,
                prefix: 'jump',
                suffix: '.gif'
            }),
            frameRate: 12, 
            repeat: 0
        });

        this.anims.create({
            key: 'slideAnim',
            frames: this.anims.generateFrameNames('pTexture', {
                start: 3,
                end: 6,
                zeroPad: 1,
                prefix: 'slide',
                suffix: '.gif'
            }),
            frameRate: 24, 
            repeat: 0
        });

        this.anims.create({
            key: 'deathAnim',
            frames: this.anims.generateFrameNames('pTexture', {
                start: 1,
                end: 9,
                zeroPad: 1,
                prefix: 'die',
                suffix: '.gif'
            }),
            frameRate: 24, 
            repeat: 0
        });
        this.player = this.physics.add.sprite(200, 350, 'run');
        this.PlayerRun();
        this.player.setCollideWorldBounds(true);

        // controls
        this.cursors = this.input.keyboard.createCursorKeys();

        this.player.on('animationcomplete-slideAnim', function () {
            if(this.cursors.down.isDown && this.player.body.touching.down) {
                this.slideWait = true;
            }
            else {
                this.isSliding = false;
            }
        }, this);

        // collisions
        this.physics.add.collider(this.player, this.light, this.Die, null, this);
        this.physics.add.collider(this.player, this.trash, this.Die, null, this);
        this.physics.add.collider(this.player, this.piano, this.Die, null, this);
        this.physics.add.collider(this.player, this.light2, this.Die, null, this);
        this.physics.add.collider(this.player, this.trash2, this.Die, null, this);
        this.physics.add.collider(this.player, this.piano2, this.Die, null, this);
        this.physics.add.collider(this.player, this.road);

        // logic for spacing
        this.lastObjWidth = 0;

        //this.ActivateFirst();
        // object timer
        this.objTimer = this.time.addEvent({
            delay: 0,
            callback: this.ActivateFirst,
            callbackScope: this,
            loop: false
        });

        // create window overlay
        this.window = this.add.sprite(1280 / 2, 720 / 2, 'window');
        
    }

    update(time, delta) {
        //background
        this.road.tilePositionX += gameSpeed * 1.8 * delta / 60;
        this.bg.tilePositionX += gameSpeed * delta / 60;
        this.farBG.tilePositionX += gameSpeed * 0.42 * delta / 60;
        this.clouds.tilePositionX += gameSpeed * 0.3 * delta / 60;
        this.light.x -= gameSpeed * delta / 60 * this.light.enable;
        this.trash.x -= gameSpeed * delta /60 * this.trash.enable;
        this.piano.x -= gameSpeed * delta /60 * this.piano.enable;
        this.light2.x -= gameSpeed * delta / 60 * this.light2.enable;
        this.trash2.x -= gameSpeed * delta /60 * this.trash2.enable;
        this.piano2.x -= gameSpeed * delta /60 * this.piano2.enable;
        
        if(this.player.body.touching.down && !this.isRun && (this.player.anims.currentAnim.key === 'jumpAnim' || !this.isSliding)) {
            this.PlayerRun();
        }

        //horrific logic, use states next time...
        if(this.slideWait = true && this.cursors.down.isUp && this.player.body.touching.down && !this.isRun)
        {
            this.PlayerRun();
            this.slideWait = false;
            this.isSliding = false;
        }

        if(this.cursors.up.isDown && this.player.body.touching.down) {
            this.PlayerJump();
        }

        var justDown = false;
        if(Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            justDown = true;
        }

        if(justDown && !this.player.body.touching.down) {
            this.airSlide = true;
        }

        if(justDown && this.player.body.touching.down && !this.isSliding && this.cursors.up.isUp) {
            this.PlayerSlide();
        }

        if(this.airSlide && this.player.body.touching.down && !this.isSliding && this.cursors.up.isUp) {
            this.airSlide = false;
            this.PlayerSlide();
        }

        if (this.cursors.space.isDown && this.gameOver) {
            this.scene.restart();   
        }

        // left right ground movement
        if(!this.isSliding) {
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-moveSpeed * 1.3);
            }
            else {
                if (this.cursors.right.isDown) {
                    this.player.setVelocityX(moveSpeed);
                }
                else {
                    this.player.setVelocityX(0);
                }
            }
        } else {
            this.player.setVelocityX(moveSpeed * 1.5 * (1 - this.slideFriction));
            if(this.slideFriction < 1) {
                this.slideFriction += 0.07 * delta / 60;
            }
            else {
                this.isSliding = false;
            }
        }

        // insert air movement

        // object logic
        if (this.light.x < -500) {
            this.ResetObstacle(this.light);
        }
        if (this.trash.x < -500) {
            this.ResetObstacle(this.trash);
        }
        if (this.piano2.x < -500) {
            this.ResetObstacle(this.piano2);
        }
        if (this.light2.x < -500) {
            this.ResetObstacle(this.light2);
        }
        if (this.trash2.x < -500) {
            this.ResetObstacle(this.trash2);
        }
        if (this.piano.x < -500) {
            this.ResetObstacle(this.piano);
        }
    }

    PlayerRun(){
        this.player.setScale(0.32, 0.32);
        this.player.setSize(250, 300, false);
        this.player.setOffset(185, 50);
        this.player.anims.play('runAnim');
        this.isRun = true;
    }

    PlayerJump(){
        this.player.setVelocityY(-jumpSpeed);
        this.player.anims.play('jumpAnim');
        this.player.setSize(200, 475, false);
        this.player.setOffset(80, 25);
        this.player.setScale(0.25, 0.25);
        this.isRun = false;
        this.isSliding = false;
    }

    PlayerSlide(){
        this.player.anims.play('slideAnim');
        this.player.setSize(300, 200, false);
        this.player.setOffset(160, 200);
        this.player.setScale(0.3, 0.3);
        this.isSliding = true;
        this.isRun = false;
        this.slideFriction = 0;
    }

    ActivateFirst(){
        if (!this.gameOver) {
            this.activeObject = this.obstacles.getFirstAlive();
            this.activeObject.enable = 1;
            this.activeObject.x += this.lastObjWidth;

            this.obstacles.kill(this.activeObject);
            this.obstacles.remove(this.activeObject);
            this.obstacles.add(this.activeObject);

            if (spawnDelay > lowestDelay) {
                spawnDelay -= 4300 / 20;
                gameSpeed += 32.5 / 20;
                // insert spawn - x
                //also up speed
            }
            if (randomTrack == 0) {
                Phaser.Actions.Shuffle(this.obstacles.getChildren());
                randomTrack = randomCount;
            }
            randomTrack -= 1;
            this.lastObjWidth = this.activeObject.width;

            this.objTimer = this.time.addEvent({
                delay: spawnDelay,
                callback: this.ActivateFirst,
                callbackScope: this,
                loop: false
            });
        }
    }

    ResetObstacle(object){
        object.x = game.config.width + Phaser.Math.Between(50, 100);
        object.enable = 0;
        object.active = true;
    }

    Die(player, obstacle){
        if (!player.body.touching.down && !obstacle.body.touching.up) {

            this.player.anims.play('deathAnim');
            this.player.body.enable = false;
            gameSpeed = 0;
            this.gameOver = true;
                     
            // UI elements
            this.gameOver = this.add.sprite(1280 / 2, 720 / 2 - 75, 'gameOver');
                
            this.playConfig.color = '#000000';
            this.add.text(1280 / 2 + 1, 720 / 2 + 2 + 25, 'Press           to restart!', this.playConfig).setOrigin(0.5);
            this.playConfig.color = '#FFFFFF';
            this.add.text(1280 / 2, 720 / 2 + 25, 'Press           to restart!', this.playConfig).setOrigin(0.5);
            this.playConfig.color = '#000000';
            this.add.text(1280 / 2 - 55 + 1, 720 / 2 + 2 + 25, 'space', this.playConfig).setOrigin(0.5);
            this.playConfig.color = '#FFE272';
            this.add.text(1280 / 2 - 55, 720 / 2 + 25, 'space', this.playConfig).setOrigin(0.5);
                
        }
    }
}