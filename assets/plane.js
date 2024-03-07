const app = new PIXI.Application({ width: 560, height: 960 });
      document.body.appendChild(app.view);

      let currentPlaneIndex = 0; // 當前飛機的索引
      let currentShootMode = "normal"; // 當前射擊模式

      // 預設飛機
      const planeTexture = PIXI.Texture.from("/assets/plane2.png");

      const plane = new PIXI.Sprite(planeTexture);
      plane.width = 40;
      plane.height = 40;
      plane.anchor.set(0.5);
      plane.position.set(app.screen.width / 2, app.screen.height - 50);
      app.stage.addChild(plane);

      // 切換飛機
      // 飛機紋理
      const planeTextures = [
        "/assets/plane2.png", // 這邊放預設
        "/assets/planeB.png", // 第二種飛機
      ];

      // 添加切換飛機的按鈕
      // const switchPlaneButton = document.createElement("button");
      // switchPlaneButton.textContent = "切換飛機";
      // document.body.appendChild(switchPlaneButton);

      // switchPlaneButton.addEventListener("click", () => {
      //   currentPlaneIndex = (currentPlaneIndex + 1) % planeTextures.length;
      //   updatePlaneTexture(plane, currentPlaneIndex);
      //   //切換射擊模式
      //   currentShootMode = currentShootMode === "normal" ? "special" : "normal";
      // });

      // 添加切換射擊模式的按鈕
      // const switchShootModeButton = document.createElement("button");
      // switchShootModeButton.textContent = "切換射擊模式";
      // document.body.appendChild(switchShootModeButton);

      // switchShootModeButton.addEventListener("click", () => {
      //   currentShootMode = currentShootMode === "normal" ? "special" : "normal";
      // });

      function createPlane() {
        const planeTexture = PIXI.Texture.from(
          planeTextures[currentPlaneIndex]
        );
        const planeSprite = new PIXI.Sprite(planeTexture);
        planeSprite.anchor.set(0.5);
        planeSprite.position.set(app.screen.width / 2, app.screen.height - 50);
        return planeSprite;
      }

      function updatePlaneTexture(plane, index) {
        const newTexture = PIXI.Texture.from(planeTextures[index]);
        plane.texture = newTexture;
      }

      const bullets = new PIXI.Container();
      app.stage.addChild(bullets);

      const enemies = new PIXI.Container();
      app.stage.addChild(enemies);

      let score = 0;
      let lives = 3;
      const scoreText = new PIXI.Text(`Score: ${score} Lives: ${lives}`, {
        fontSize: 24,
        fill: 0xffffff,
      });
      scoreText.position.set(10, 10);
      app.stage.addChild(scoreText);

      //第二種背景
      let currentBackground =
        "https://png.pngtree.com/background/20210709/original/pngtree-romantic-starry-background-fantasy-starry-sky-background-starry-material-psd-picture-image_953516.jpg";
      // 添加背景
      const background = new PIXI.Sprite.from(currentBackground);
      // app.stage.addChild(background);

      // 暫停
      let isGamePaused = false;

      // 添加暫停按鈕
      const pauseButton = document.createElement("button");
      pauseButton.textContent = "暫停";
      document.body.appendChild(pauseButton);

      pauseButton.addEventListener("click", () => {
        isGamePaused = !isGamePaused;
        pauseButton.textContent = isGamePaused ? "繼續" : "暫停";
      });

      function update() {
        //遊戲暫停 or 開始
        if (!isGamePaused) {
          if (keys.ArrowUp && plane.y > 0) {
            plane.y -= 5;
          }
          if (keys.ArrowDown && plane.y < app.screen.height) {
            plane.y += 5;
          }
          if (keys.ArrowLeft && plane.x > 0) {
            plane.x -= 5;
          }
          if (keys.ArrowRight && plane.x < app.screen.width) {
            plane.x += 5;
          }

          if (keys.Space) {
            // why not working?
            shoot();
          }

          bullets.children.forEach((bullet) => {
            bullet.y -= 5;

            enemies.children.forEach((enemy) => {
              if (hitTest(bullet, enemy)) {
                score += 10;
                scoreText.text = `Score: ${score} Lives: ${lives}`;
                enemies.removeChild(enemy);
                bullets.removeChild(bullet);
              }
            });

            if (bullet.y < 0) {
              bullets.removeChild(bullet);
            }
          });

          enemies.children.forEach((enemy) => {
            enemy.y += 2;

            if (hitTest(enemy, plane)) {
              lives--;
              scoreText.text = `Score: ${score} Lives: ${lives}`;

              if (lives <= 0) {
                endGame();
              }

              enemies.removeChild(enemy);
            }

            if (enemy.y > app.screen.height) {
              enemies.removeChild(enemy);
            }
          });

          if (Math.random() < 0.02) {
            spawnEnemy();
          }

          //切換背景
          // 檢查分數以切換背景
          if (score == 100) {
            // 切換背景

            app.stage.removeChild(background);
            background.texture = PIXI.Texture.from(currentBackground);
            app.stage.addChildAt(background, 0); // 放在最底層
          }
        }

        requestAnimationFrame(update);
      }

      function shoot(shootType) {
        const bulletTexture = PIXI.Texture.from(
          "https://placekitten.com/20/20"
        );
        const bullet = new PIXI.Sprite(bulletTexture);
        bullet.anchor.set(0.5);
        //普通模式
        if (shootType === "normal") {
          bullet.position.set(plane.x, plane.y - 50);
          bullets.addChild(bullet);
        }
        // 特殊模式
        else if (shootType === "special") {
          // 計算子彈的初始位置
          const bulletX = plane.x;
          const bulletY = plane.y;

          // 創建子彈
          const bullet = createBullet(bulletX, bulletY);

          // 將子彈加入容器
          bullets.addChild(bullet);
        }
      }

      function createBullet(x, y) {
        const bullet = new PIXI.Graphics();
        bullet.beginFill(0xffffff);
        bullet.drawRect(0, 0, 155, 50);
        bullet.endFill();
        bullet.position.set(x - 80, y - 80);

        return bullet;
      }

      function spawnEnemy() {
        const enemyTexture = PIXI.Texture.from("https://placekitten.com/50/50");
        const enemy = new PIXI.Sprite(enemyTexture);
        enemy.anchor.set(0.5);
        enemy.position.set(Math.random() * app.screen.width, 0);
        enemies.addChild(enemy);
      }

      function endGame() {
        alert(`Game Over! Your Score: ${score}`);
        location.reload();
      }

      function hitTest(r1, r2) {
        return (
          r1.x < r2.x + r2.width &&
          r1.x + r1.width > r2.x &&
          r1.y < r2.y + r2.height &&
          r1.y + r1.height > r2.y
        );
      }

      const keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        Space: false,
      };

      window.addEventListener("keydown", (e) => {
        keys[e.key] = true;

        // 防止空白鍵觸發頁面滾動
        if (e.key === " ") {
          if (currentShootMode === "normal") {
            shoot("normal");
          } else if (currentShootMode === "special") {
            shoot("special");
          }
          e.preventDefault();
        }
        if (e.key === "s" || e.key === "S") {
          currentPlaneIndex = (currentPlaneIndex + 1) % planeTextures.length;
          updatePlaneTexture(plane, currentPlaneIndex);
          //切換射擊模式
          currentShootMode =
            currentShootMode === "normal" ? "special" : "normal";
        }
      });

      window.addEventListener("keyup", (e) => {
        keys[e.key] = false;
      });

      update();

      // // 定義飛機動畫的精靈表
      // const airplaneFrames = [];
      // for (let i = 0; i < 4; i++) {
      //   const texture = PIXI.Texture.from(`plane${i}.png`);
      //   airplaneFrames.push(texture);
      // }

      // // 創建 AnimatedSprite
      // const airplane = new PIXI.AnimatedSprite(airplaneFrames);

      // // 設置動畫的速度
      // airplane.animationSpeed = 0.1;

      // // 開始播放動畫
      // airplane.play();

      // // 設置飛機的位置
      // airplane.position.set(100, 100);

      // // 將飛機添加到舞台
      // app.stage.addChild(airplane);