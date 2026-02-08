import Observable from "@metaphorjs/observable";
import { easings } from "./Easing";
import {
  addListener,
  bind,
  getClientRect,
  getRandomInt,
  isArray,
  isReachable,
  SIZE,
} from "./Utils";

export class Position extends Observable {
  constructor(sheep, floors) {
    super();
    this.sheep = sheep;

    this.floors = document.querySelectorAll(floors);
    this.stepDelegate = bind(this.step, this);
    this.resizeDelegate = bind(this.onWindowResize, this);
    this.scrollDelegate = bind(this.onScroll, this);

    const action = this.sheep.getAction();

    this.sheep.on("tick", this.onTick, this);

    action.on("run", this.onActionRun, this);
    action.on("stop", this.onActionStop, this);
    action.on("step", this.onActionStep, this);

    addListener(window, "resize", this.resizeDelegate);
    addListener(window, "scroll", this.scrollDelegate);
    this.stepTimeout = null;
    this.lastStepTime = null;

    this.animationTimeout = null;
    this.lastAnimTime = null;

    this.resumeTmt = null;

    this.x = 0;
    this.y = 0;
    this.floor = null;
    this.floorY = 0;
    this.bounding = {
      left: 0,
      right: 0,
    };
  }
  setFloor(el) {
    this.floor = el;

    if (el) {
      this.bounding = getClientRect(el);
      this.floorY = this.bounding.floor;
    }
  }

  getFloor() {
    return this.floor;
  }

  onTick(tickTime) {
    if (
      this.stepTimeout &&
      this.lastStepTime &&
      tickTime - this.lastStepTime > this.stepTimeout
    ) {
      this.lastStepTime = tickTime;
      this.step();
    }

    if (
      this.animationTimeout &&
      this.lastAnimTime &&
      tickTime - this.lastAnimTime > this.animationTimeout
    ) {
      this.lastAnimTime = tickTime;
      this.animationStep(tickTime);
    }
  }

  step() {
    const action = this.sheep.getAction(),
      dir = this.sheep.getDirection();
    let xShift = action.xShift;

    if (dir == "l") {
      xShift *= -1;
    }

    this.x = this.x + xShift;

    this.updatePosition();

    if (this.isOnBounding()) {
      if (dir == "l") {
        this.x = this.bounding.left;
      } else {
        this.x = this.bounding.right - SIZE;
      }
      this.updatePosition();
      this.stop();
      this.trigger("bounding");
    }
  }

  isOnBounding(edge) {
    const dir = edge || this.sheep.getDirection();

    if (dir == "l" && this.x <= this.bounding.left) {
      return true;
    } else if (dir == "r" && this.x + SIZE >= this.bounding.right) {
      return true;
    }
    return false;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    this.updatePosition();
  }

  addX(value) {
    this.x += value;
    this.updatePosition();
  }

  addY(value) {
    this.y += value;
    this.updatePosition();
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  updatePosition() {
    const el = this.sheep.getElem(),
      style = el.style;

    style.left = this.x + "px";
    style.top = this.y + "px";
  }

  onActionRun(action) {
    if (action.moveItv) {
      this.lastStepTime = new Date().getTime();
      this.stepTimeout = action.moveItv;
    }
  }

  onActionStop() {
    this.stop();
  }

  onActionStep(action, frame) {
    if (typeof frame != "number") {
      if (frame.moveItv) {
        action.xShift = frame.xShift;
        action.yShift = frame.yShift;
        action.moveItv = frame.moveItv;
        this.onActionRun(action);
      }
      if (frame.stopMoving) {
        this.stop();
      }
    }
  }

  stop() {
    this.stepTimeout = null;
    this.lastStepTime = null;
  }

  animateTo(toX, toY, duration, easing, cb, scope) {
    const start = new Date().getTime(),
      startX = this.x,
      startY = this.y,
      xLen = toX - startX,
      yLen = toY - startY;
    let xEasing, yEasing;

    if (!easing) {
      xEasing = yEasing = easings.linear;
    } else {
      if (isArray(easing)) {
        xEasing = easing[0];
        yEasing = easing[1];
      } else {
        xEasing = yEasing = easing;
      }
    }

    this.lastAnimTime = start;
    this.animationTimeout = 40;

    this.animationStep = function (tickTime) {
      let time = tickTime - start;

      if (time > duration) {
        time = duration;
      }

      this.x = startX + xEasing(time, 0, xLen, duration);
      this.y = startY + yEasing(time, 0, yLen, duration);

      if (this.sheep.getAction().bound) {
        if (this.x < this.bounding.left) {
          this.x = this.bounding.left;
        }
        if (this.x > this.bounding.right - SIZE) {
          this.x = this.bounding.right - SIZE;
        }
      }

      this.updatePosition();

      if (time == duration) {
        if (cb) {
          cb.call(scope || this.sheep);
        }
        if (this.onAnimationComplete) {
          this.onAnimationComplete();
          this.onAnimationComplete = null;
        }
        this.stopAnimation();
      }
    };
  }

  stopAnimation() {
    this.animationTimeout = null;
  }

  onWindowResize() {
    this.adjustToWindow();
  }

  onScroll() {
    this.adjustToWindow();
  }

  adjustToWindow() {
    const rect = getClientRect(window);

    if (this.resumeTmt) {
      window.clearTimeout(this.resumeTmt);
    }

    if (this.y + SIZE > rect.floor) {
      this.setFloor(window);

      this.stopAnimation();
      this.sheep.stop();
      this.sheep.setFrame(23);

      this.floorY = rect.floor;
      this.y = this.floorY - SIZE;
      this.updatePosition();

      this.resumeTmt = window.setTimeout(() => {
        this.sheep.start();
      }, 2000);
    } else if (this.y + SIZE < rect.floor && this.floor === window) {
      this.setFloor(window);
      this.sheep.stop();
      this.sheep.setFrame(47);
      this.floorY = rect.floor;
      this.animateTo(this.x, this.floorY - SIZE, 1000, easings.easeInQuad);
      this.onAnimationComplete = () => {
        this.sheep.setFrame(85);
        this.resumeTmt = window.setTimeout(() => {
          this.sheep.start();
        }, 2000);
      };
    } else {
      if (!this.sheep.auto) {
        this.resumeTmt = window.setTimeout(() => {
          this.sheep.start();
        }, 1000);
      }
    }
  }

  findUpperFloor() {
    return this.findFloor("upper", null);
  }

  findLowerFloor() {
    return this.findFloor("lower", window);
  }

  findFloor(which, def) {
    const fls = this.floors;
    let i,
      len,
      rect,
      f,
      found = [];

    for (i = 0, len = fls.length; i < len; i++) {
      f = fls[i];

      if (f === this.floor || f === window || !isReachable(f)) {
        continue;
      }

      rect = getClientRect(f);

      if (which == "upper" && rect.floor >= this.floorY) {
        continue;
      }

      if (which == "lower" && rect.floor <= this.floorY) {
        continue;
      }

      found.push(f);
    }

    if (found.length) {
      if (def) {
        found.push(def);
      }
      return found.length > 1 ? found[getRandomInt(0, found.length)] : found[0];
    } else {
      return def;
    }
  }

  findFloorBeneath() {
    const fls = this.floors,
      x = this.x,
      y = this.y;
    let i, len, rect, f;

    for (i = 0, len = fls.length; i < len; i++) {
      f = fls[i];

      if (f === this.floor || f === window || !isReachable(f)) {
        continue;
      }

      rect = getClientRect(f);

      if (rect.floor <= y + SIZE) {
        continue;
      }

      if (rect.left < x && rect.right > x) {
        return f;
      }
    }

    return window;
  }
}
