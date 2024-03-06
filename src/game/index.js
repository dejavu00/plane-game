import { Application, Assets, Container, Sprite, Loader } from 'pixi.js';
import sources from './source';
function onDragMove(event) {
    let currentTarget = event.currentTarget;
    let newPosition = event.data.global; // 获取拖动到的位置
    // 划分范围
    if (newPosition.x > 0) {
        currentTarget.x = newPosition.x - currentTarget.width * 0.5;
    }
    if (newPosition.y > 0) {
        currentTarget.y = newPosition.y - currentTarget.height * 0.5;
    }
}

export default class PlaneGame {
    constructor(options) {
        this.width = options.width || 500
        this.height = options.height || 700
        this.container = options.container
        this.init()
        this.Loader = new Loader()
        this.sourceMap = new Map()
        this.bullets = []
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
            bullet.y = plane.y
            bullet.x = plane.x + (plane.width * 0.5) - (bullet.width * 0.5);
            this.bullets.push(bullet)
        }
      

        let elapsed = 0.0;
        this.instance.ticker.add(({ deltaMS}) => {
            elapsed+=deltaMS;
            if(elapsed >=3000) {
                elapsed = 0;
                console.log(this.bullets)
                createBullets()
                
            }
            this.bullets.forEach((bullet, index) => {
                bullet.y-=10
                if(bullet.y< 10) {
                    console.log('跑出去了')
                    bullet.destroy()
                    this.bullets.splice(index, 1)
                }
            })
        });

        
    }


    start() {

    }

    gameOver() {

    }

}