import * as PIXI from 'pixi.js';
import { ITrain } from '../../model/train';
import * as config from '../../config';
import { TrackView } from './track_view';

export class TrainView {
    private readonly id: number;
    private readonly length: number;
    private readonly width: number;
    private readonly wheelOffset: number;
    private readonly lightWidth = config.TRAIN_LIGHT_WIDTH;
    private readonly sprite: PIXI.Graphics;

    private lightOn = false;
    private reversed = false;

    public constructor(model: ITrain) {
        this.id = model.id;
        this.length = model.length;
        this.width = model.width;
        this.wheelOffset = model.wheelOffset;

        this.sprite = new PIXI.Graphics();
        this.sprite.beginFill(0xCCCCCC);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.spriteDrawRect(-this.length + this.wheelOffset, -this.width / 2, this.length, this.width);
        this.sprite.endFill();
        this.sprite.beginFill(0xCC3333);
        this.sprite.drawCircle(0, 0, this.width / 4 * config.PIXEL_PER_CENTIMETER);
        this.sprite.endFill();

        // Add train number
        const fontSize = Math.floor(model.width * config.PIXEL_PER_CENTIMETER * 0.9);
        const style = new PIXI.TextStyle({
            fontFamily: config.MONOSPACE_FONTS,
            fontSize: fontSize,
            fill: 0x333333
        });
        const trainLabel = new PIXI.Text(model.id.toString(10), style);
        trainLabel.y = -fontSize / 2;
        trainLabel.x = (-this.length + 2 * this.wheelOffset) * config.PIXEL_PER_CENTIMETER;

        this.turnLightOff();

        this.sprite.addChild(trainLabel);
    }

    public render(model: ITrain) {
        const screenPosition = TrackView.translate(model.frontWheel);
        this.sprite.x = screenPosition.x;
        this.sprite.y = screenPosition.y;
        this.sprite.rotation = Math.atan2(
            model.frontWheel.y - model.backWheel.y,
            model.frontWheel.x - model.backWheel.x
        );
        if (model.light !== this.isLightOn() || model.reversed !== this.isReversed()) {
            if (model.light) {
                this.turnLightOn(model.reversed);
            } else {
                this.turnLightOff();
            }
        }
    }

    public turnLightOff() {
        this.sprite.beginFill(0xCCCCCC);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.spriteDrawRect(-this.length + this.wheelOffset, -this.width / 2, this.lightWidth, this.width);
        this.spriteDrawRect(this.wheelOffset - this.lightWidth, -this.width / 2, this.lightWidth, this.width);
        this.sprite.endFill();
        this.lightOn = false;
    }

    public turnLightOn(reverse: boolean) {
        this.sprite.beginFill(reverse ? 0xFFFFFF : 0xCC3333);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.spriteDrawRect(-this.length + this.wheelOffset, -this.width / 2, this.lightWidth, this.width);
        this.sprite.endFill();
        this.sprite.beginFill(reverse ? 0xCC3333 : 0xFFFFFF);
        this.sprite.lineStyle(2, 0x333333, 1);
        this.spriteDrawRect(this.wheelOffset - this.lightWidth, -this.width / 2, this.lightWidth, this.width);
        this.sprite.endFill();
        this.lightOn = true;
        this.reversed = reverse;
    }

    public spriteDrawRect(x: number, y: number, width: number, height: number) {
        this.sprite.drawRect(
            x * config.PIXEL_PER_CENTIMETER,
            y * config.PIXEL_PER_CENTIMETER,
            width * config.PIXEL_PER_CENTIMETER,
            height * config.PIXEL_PER_CENTIMETER
        );
    }

    public isLightOn() {
        return this.lightOn;
    }

    public isReversed() {
        return this.reversed;
    }

    public getSprite(): PIXI.DisplayObject {
        return this.sprite;
    }
}
