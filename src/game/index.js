import { Application, AnimatedSprite, Assets, Container, Sprite, Loader } from 'pixi.js';
import sources from './source';
import TWEEN from 'tween.js';
let obstacleTime = 6000;
export default class PlaneGame {
    constructor(options) {
        this.width = options.width || 500
        this.height = options.height || 700
        this.container = options.container
        this.init()
        this.Loader = new Loader()
        this.sourceMap = new Map()
        this.bullets = []
        this.obstacles = []
        this.scene = new Container({
            width: this.width, height: this.height,
        })
    }

    async init() {
        this.instance = new Application()
        await this.instance.init({
            width: this.width, height: this.height,
        })
        this.container.appendChild(this.instance.canvas);
        this.instance.stage.addChild(this.scene)
        this.loadImgs()
    }

    async loadImgs() {
        for (const key in sources) {
            const texture = await Assets.load(sources[key]);
            this.sourceMap.set(key, texture)
        }



        this.loadBg()
        this.loadPlane()
    }
    loadBg() {
        const bg = new Sprite(this.sourceMap.get('bg'));
        this.scene.addChild(bg);
    }

    loadPlane() {
        const container = new Container()
        const plane = new Sprite(this.sourceMap.get('plane'));
        plane.width = 100;
        plane.height = 100;
        plane.x = this.width / 2 - plane.width / 2;
        plane.y = 8 / 10 * this.height - plane.height / 2
        container.addChild(plane);
        this.scene.addChild(container);

        plane.on('pointermove', (event) => {
            let currentTarget = event.currentTarget;
            let newPosition = event.data.global;
            if (newPosition.x < (this.width - plane.width / 2) && newPosition.x > plane.width / 2) {
                currentTarget.x = newPosition.x - plane.width / 2;
            }
            if (newPosition.y < (this.height - plane.height / 2) && newPosition.y > plane.height / 2) {
                currentTarget.y = newPosition.y - plane.height / 2;
            }


        })

        plane.interactive = true;
        // 子弹和飞机共用container
        const createBullets = () => {
            const bullet = new Sprite(this.sourceMap.get('bullet'))
            container.addChild(bullet)
            bullet.scale = 0.5;
            bullet.y = plane.y
            bullet.x = plane.x + plane.width / 2 - bullet.width / 2;
            this.bullets.push(bullet)
        }


        let elapsed = 0.0;
        // 循环
        this.instance.ticker.add(({ deltaMS }) => {
            elapsed += deltaMS;
            if (elapsed >= 300) {
                elapsed = 0;
                createBullets()
                this.loadObstacle()
            }
            TWEEN.update()
            this.checkIsHit()
            this.bullets.forEach((bullet, index) => {
                bullet.y -= 10
                if (bullet.y < 10) {
                    bullet.destroy()
                    this.bullets.splice(index, 1)
                }
            })
        });


    }
    hitTest(spriteA, spriteB) {
        const a = spriteA.getBounds();
        const b = spriteB.getBounds();

        return !(
            a.right < b.left ||
            a.left > b.right ||
            a.bottom < b.top ||
            a.top > b.bottom
        );
    }

    checkIsHit() {

        for (let m = 0; m < this.bullets.length;) {
            let isHit = false
            const bullet = this.bullets[m]
            for (let i = 0; i < this.obstacles.length; i++) {
                const obstacle = this.obstacles[i];
                if (this.hitTest(bullet, obstacle)) {
                    const _obstacle = this.obstacles.splice(i, 1)[0]
                    const parent = _obstacle.parent;
                    parent?.children?.[1]?.play()
                    _obstacle.destroy();
                    isHit = true
                }
            }

            if (isHit) {
                const _bullet = this.bullets.splice(m, 1)[0]
                _bullet.destroy()
            } else {
                if(this.bullets[m].y < -this.bullets[m].height) {
                    let _bullet = bullets.splice(i,1)[0];
                    _bullet.destroy();
                } else {
                    m++;
                }
             
            }

        }



    }


    async loadObstacle() {
        const container = new Container()
        const obstacle = new Sprite(this.sourceMap.get('obstacle'))
        obstacle.width = 120;
        obstacle.height = 120;
        obstacle.anchor = 0.5;
        obstacle.x = this.width * Math.random();
        container.addChild(obstacle)
        // 加载精灵图集的图像和JSON文件
        const { textures } = await Assets.load({
            alias: 'spritesheet',
            src: '/img/boom.json',
            data: {
                ignoreMultiPack: true,
            }
        })
        let fireClip = [
        ];
        for (let i = 0; i < Object.keys(textures).length; i++) {
            fireClip.push(textures['boom' + i + '.png']);
        }
        let boom = new AnimatedSprite(fireClip);
        boom.x = obstacle.x
        boom.width = obstacle.width * 2.5;
        boom.height = obstacle.height * 2.5;
        boom.anchor = 0.5;
        boom.loop = false;
        this.obstacles.push(obstacle)
        container.addChild(boom);
        this.scene.addChild(container)
        let tween = new TWEEN.Tween(container)
            .to(
                {
                    x: this.width * Math.random(),
                    y: this.height + obstacle.height,
                },
                obstacleTime // tween持续时间
            )
            .easing(TWEEN.Easing.Linear.None)
            .onComplete(function () {
                // 到底
                container.destroy();
            });
        tween.start();
        let tween2 = new TWEEN.Tween(obstacle)
            .to(
                {
                    rotation: -20
                },
                obstacleTime // tween持续时间
            )
            .easing(TWEEN.Easing.Linear.None)
        tween2.start();
    }


    start() {

    }

    gameOver() {

    }

}