//创建了一个Phaser.Game对象的实例并赋值给本地变量game，以此来激活Phaser
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'invader', { preload: preload, create: create, update: update, render: render });
//加载资产,preload函数里调用game.load来完成
function preload() {

    game.load.image('bullet', 'images/bullet.png');
    game.load.image('enemyBullet', 'images/enemy-bullet.png');
    game.load.spritesheet('invader', 'images/invader32x32x4.png', 32, 32);
    game.load.image('ship', 'images/player.png');
    game.load.spritesheet('kaboom', 'images/explode.png', 128, 128);
    game.load.image('starfield', 'images/starfield.png');
    game.load.audio('score_sound', 'music.mp3');//得分的音效
    game.load.audio('shut', 'short_lazer.mp3');//得分的音效
    game.load.audio('explode', 'explode.mp3');//得分的音效

}

var player;
var aliens;
var bullets;
var bulletTime = 0;
var cursors;
var fireButton;
var explosions;
var starfield;
var score = 0;
var scoreString = '';
var scoreText;
var lives;
var enemyBullet;
var firingTimer = 0;
var stateText;
var livingEnemies = [];

//建立一个世界
function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  The scrolling starfield background
    // 添加背景
    starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');

    soundScore = game.add.sound('score_sound');
    shut = game.add.sound('shut');
    explode = game.add.sound('explode');
    


    //  Our bullet group
    // 玩家的激光炮弹
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);

    // The enemy's bullets
    // 敌人的激光炮弹
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(30, 'enemyBullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 1);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  The hero!
    // 飞船
    player = game.add.sprite(400, 500, 'ship');
    player.anchor.setTo(0.5, 0.5);
    game.physics.enable(player, Phaser.Physics.ARCADE);

    //  The baddies!
    // 敌人
    aliens = game.add.group();
    aliens.enableBody = true;
    aliens.physicsBodyType = Phaser.Physics.ARCADE;

    createAliens();

    //  The score
    // 分数展示
    scoreString = 'Score : ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Arial', fill: '#fff' });

    //  Lives
    // 还剩几条命
    lives = game.add.group();
    game.add.text(game.world.width - 100, 10, 'Lives', { font: '34px Arial', fill: '#fff' });

    //  Text
    // 游戏结束后屏幕出现的提示
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '60px Arial', fill: '#fff'});
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    // 生成的右上角还有几条命
    for (var i = 0; i < 3; i++) 
    {
        var ship = lives.create(game.world.width - 100 + (30 * i), 60, 'ship');
        ship.anchor.setTo(0.5, 0.5);
        ship.angle = 90;
        ship.alpha = 0.4;
    }
    
    //  An explosion pool
    // 添加爆炸的效果
    explosions = game.add.group();
    explosions.createMultiple(30, 'kaboom');
    explosions.forEach(setupInvader, this);

    //  And some controls to play the game with
    // 添加键盘事件
    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    
}
// 创建敌人飞船
function createAliens () {

    for (var y = 0; y < 4; y++)
    {
        for (var x = 0; x < 10; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    aliens.x = 100;
    aliens.y = 50;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    // 所有这一切，基本上是开始的侵略者移动。通知我们正在移动他们所属的群体，而不是直接的侵略者。
    var tween = game.add.tween(aliens).to( { x: 200 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    // 当动画循环时开始下降
    tween.onLoop.add(descend, this);
    soundScore.play();
}
//设置敌人，并添加爆炸的动画
function setupInvader (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}

function descend() {

    aliens.y += 10;

}

function update() {

    //  Scroll the background
    // 设置背景滚动的速度
    starfield.tilePosition.y += 2;
    // 如果玩家还有生命
    if (player.alive)
    {
        //  Reset the player, then check for movement keys
        // 重置玩家的位置，
        player.body.velocity.setTo(0, 0);

        if (cursors.left.isDown)
        {
            player.body.velocity.x = -200;
        }
        else if (cursors.right.isDown)
        {
            player.body.velocity.x = 200;
        }

        //  Firing?
        // 
        if (fireButton.isDown)
        {
            fireBullet();
            shut.play();
        }

        if (game.time.now > firingTimer)
        {
            enemyFires();
        }

        //  Run collision
        game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
        game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
    }

}


function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

}


function collisionHandler (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    // 当激光碰到敌人的时候，将两个kill掉
    bullet.kill();
    alien.kill();
    explode.play();
    //  Increase the score
    // 增加分数
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    // 增加爆炸的动画
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    //当敌人的飞机一个都没有的时候，加1000分
    if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.text = " 你获得了胜利 \n 点击屏幕充重新开始";
        stateText.visible = true;

        //the "click to restart" handler
        // 添加点击屏幕，重新开始事件
        game.input.onTap.addOnce(restart,this);
    }

}
// 敌人的炮弹打到玩家
function enemyHitsPlayer (player,bullet) {
    // 玩家的飞船被kill掉
    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
        explode.play();
    }

    //  And create an explosion :)
    // 增加爆炸的动画
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    // 当玩家死掉的时候
    if (lives.countLiving() < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER \n 点击屏幕重新开始";
        stateText.visible = true;

        //the "click to restart" handler
        //添加点击屏幕，重新开始事件
        game.input.onTap.addOnce(restart,this);
    }

}


// 敌人的炮火
function enemyFires () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        // 将敌人放进一个数组里
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        // 随机选中他们当中的一个
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        // 发送子弹到玩家
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
        firingTimer = game.time.now + 2000;
    }

}

function fireBullet () {

    //  To avoid them being allowed to fire too fast we set a time limit
    // 为了避免发送炮弹太快，我们设置了一个时间限制
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool

        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            // 开火
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function resetBullet (bullet) {

    //  Called if the bullet goes out of the screen
    // 如果玩家飞船离开屏幕，就被kill掉
    bullet.kill();

}
// 重新开始游戏
function restart () {

    //  A new level starts
    
    //resets the life count
    // 重置生命的次数
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    // 让敌人复活
    aliens.removeAll();
    createAliens();

    //revives the player
    // 让玩家复活
    player.revive();
    //hides the text
    // 将提示隐藏
    stateText.visible = false;

}