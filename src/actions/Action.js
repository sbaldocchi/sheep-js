import Observable from "@metaphorjs/observable";
import { getRandomInt } from "../Utils";

export class Action extends Observable {
  constructor(sheep) {
    super();

    this._sheep = sheep;
    this._sheep.on("tick", this.onTick, this);
    this._sheep.on("init", () => {
      this._sheep.getPosition().on("bounding", this.onBounding, this);
    });

    this.frames = [1];
    this.frameItv = null;
    this.xShift = 0;
    this.yShift = 0;
    this.moveItv = 0;
    this.loop = false;
    this.duration = null;
    this.bound = false;
    this.minDuration = 5;
    this.maxDuration = 40;
    this.notAfter = null;
    this.onlyAfter = null;
    this.nextAction = null;
    this.probability = null;
    this._id = null;
    this._sheep = sheep;
    this._observable = null;
    this._currentFrame = -1;
    this._startTime = null;
    this._lastTime = null;
    this._timeout = null;
  }

  run() {
    this._currentFrame = -1;
    this._startTime = new Date().getTime();
    this._lastTime = this._startTime;

    if (this.frameItv) {
      this._timeout = this.frameItv;
    }

    this.beforeStart();
    this.step(this._startTime);
    this.trigger("run", this);

    if (this.loop && !this.duration) {
      this.duration = getRandomInt(this.minDuration, this.maxDuration) * 1000;
    }
  }

  stop() {
    if (this._timeout) {
      this._timeout = null;
      this.onStop();
      this.trigger("stop", this);
    }
  }

  end() {
    this.stop();
    this.onEnd();
    this.trigger("end", this);
  }

  onTick(tickTime) {
    if (
      this._timeout &&
      this._lastTime &&
      tickTime - this._lastTime > this._timeout
    ) {
      this._lastTime = tickTime;
      this.step(tickTime);
    }
  }

  step(tickTime) {
    const l = this.frames.length;
    let curr = this._currentFrame;
    let frame;

    if (this.duration && tickTime - this._startTime > this.duration) {
      this.end();
      return;
    }

    curr++;
    if (curr == l) {
      if (this.loop) {
        curr = 0;
      } else {
        this.end();
        return;
      }
    }

    this._currentFrame = curr;
    frame = this.frames[curr];

    if (typeof frame == "number") {
      this._timeout = this.frameItv;
      this._sheep.setFrame(this.frames[curr]);
    } else {
      if (frame.frameItv) {
        this.frameItv = frame.frameItv;
      }
      this._timeout = frame.duration || this.frameItv;
      this._sheep.setFrame(frame.frame);

      if (frame.action) {
        frame.action.call(this);
      }
    }

    this.onStep(curr, frame);
    this.trigger("step", this, frame);
  }

  onBounding() {
    if (this.bound) {
      this.end();
    }
  }
  beforeStart() {}
  onStep() {}
  onStop() {}
  onEnd() {}
}
