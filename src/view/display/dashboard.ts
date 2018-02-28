import * as PIXI from 'pixi.js';
import * as config from '../../config';

export class Dashboard {
    private readonly sprite: PIXI.Container;
    private readonly clock: PIXI.Text;
    private readonly startSystemTime: number;

    private lastTime: number;

    public constructor() {
        this.startSystemTime = new Date().getTime();
        this.lastTime = -1;
        this.sprite = new PIXI.Container();

        const style = new PIXI.TextStyle({
            align: 'left',
            fontFamily: config.MONOSPACE_FONTS,
            fontSize: 16,
            fill: 0x333333
        });

        this.clock = new PIXI.Text("", style);
        this.clock.x = 0;
        this.clock.y = 0;

        this.sprite.addChild(this.clock);
    }

    public getSprite(): PIXI.DisplayObject {
        return this.sprite;
    }

    public render(time: number) {
        if (time - this.lastTime > 100) {
            const dateTime = new Date(time);
            const minute = Dashboard.padZero(dateTime.getMinutes().toString(), 2);
            const second = Dashboard.padZero(dateTime.getSeconds().toString(), 2);
            const cSecond = Math.floor(dateTime.getMilliseconds() / 100).toString();
            const hour = Math.floor(time / 3600000).toString();
            this.clock.text = `${hour}:${minute}:${second}.${cSecond}`;
            this.lastTime = time;
        }
    }

    private static padZero(str: string, length: number) {
        if (length > str.length) {
            return '0'.repeat(length - str.length) + str;
        } else {
            return str;
        }
    }
}
