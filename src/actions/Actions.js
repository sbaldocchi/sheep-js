import { easings } from "../Easing";
import { getClientRect, setFrame, SIZE } from "../Utils";
import { Action } from "./Action";

export const actionIds = [];

export class MeteorAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [
      134,
      135,
      136,
      137,
      138,
      139,
      140,
      141,
      142,
      143,
      144,
      145,
      {
        frame: 85,
        duration: 3000,
      },
    ];
    this.frameItv = 200;
  }
  beforeStart() {
    const pos = this._sheep.getPosition();
    pos.set(window.innerWidth - SIZE, 0);
    pos.animateTo(
      (pos.bounding.right - pos.bounding.left) / 2,
      pos.floorY - SIZE,
      2500,
      easings.easeInQuad,
    );
  }
  isPossible() {
    return false;
  }
}

export class SleepAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [0, 1];
    this.frameItv = 500;
    this.probability = 0.2;
    this.maxDuration = 15;
    this.loop = true;
    this.notAfter = ["run", "meteor", "bump"];
  }
}

export class CallAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [
      3,
      { frame: 73, duration: 2000 },
      71,
      72,
      71,
      72,
      71,
      72,
      71,
      72,
      { frame: 73, duration: 2000 },
      71,
      72,
      71,
      72,
      71,
      72,
      71,
      72,
      73,
      74,
      75,
      { frame: 76, duration: 5000 },
      73,
      3,
    ];
    this.frameItv = 200;
    this.probability = 0.1;
  }
}

export class YawnAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [
      3,
      { frame: 31, duration: 2000 },
      107,
      { frame: 108, duration: 2000 },
      110,
      111,
      110,
      111,
      110,
      111,
      110,
      111,
      { frame: 109, duration: 7000 },
      31,
      3,
    ];
    this.frameItv = 200;
    this.probability = 0.1;
  }
}

export class StareAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [
      { frame: 9, duration: 400 },
      { frame: 10, duration: 400 },
      { frame: 34, duration: 5000 },
      { frame: 36, duration: 400 },
      { frame: 34, duration: 5000 },
      { frame: 10, duration: 400 },
      { frame: 9, duration: 400 },
    ];

    this.probability = 0.1;
  }
}

export class JumpDownAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [
      { frame: 78, duration: 500 },
      {
        frame: 77,
        duration: 500,
        action: () => {
          const sheep = this._sheep;
          const pos = sheep.getPosition();
          const floor = this.jumpTo;
          const rect = getClientRect(floor);

          pos.animateTo(
            rect.getCenterX(),
            rect.floor - SIZE,
            1500,
            [easings.easeInCubic, easings.easeInBack],
            () => pos.setFloor(floor),
          );
        },
      },
      { frame: 24, duration: 1000 },
      {
        frame: 84,
        duration: 500,
        action: () => {
          const sheep = this._sheep;
          const dir = sheep.getDirection();
          const pos = sheep.getPosition();
          const rect = getClientRect(this.jumpTo);
          const x =
            (dir === "l" ? (rect.width / 10) * 4 : (rect.width / 10) * 6) +
            rect.left;

          pos.animateTo(x, pos.getY(), 500, easings.easeOutSine, () => {
            pos.setFloor(this.jumpTo);
          });
        },
      },
    ];
  }

  beforeStart() {
    const sheep = this._sheep;
    const pos = sheep.getPosition();
    const dir = sheep.getDirection();
    const floor = pos.findLowerFloor();
    const rect = getClientRect(floor);

    this.jumpTo = floor;

    const x = rect.getCenterX();
    if (
      (dir === "r" && x < pos.getX()) ||
      (dir === "l" && x > pos.getX() + SIZE)
    ) {
      sheep.changeDirection();
    }
  }

  isPossible(sheep) {
    return sheep.getPosition().getFloor() !== window;
  }
}
export class WalkAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [2, 3];
    this.frameItv = 300;
    this.xShift = 1;
    this.moveItv = 50;
    this.loop = true;
    this.maxDuration = 40;
    this.bound = true;
  }

  isPossible(sheep) {
    return !sheep.getPosition().isOnBounding();
  }
}
export class RunAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [4, 5];
    this.frameItv = 300;
    this.xShift = 4;
    this.moveItv = 40;
    this.loop = true;
    this.maxDuration = 40;
    this.bound = true;
  }

  isPossible(sheep) {
    return !sheep.getPosition().isOnBounding();
  }
}
export class BumpAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.bound = true;
    this.frameItv = 100;
    this.onlyAfter = ["run"];
    this.frames = [
      { frame: 62, duration: 200 },
      { frame: 63, xShift: -3, moveItv: 40 },
      64,
      65,
      66,
      67,
      68,
      69,
      70,
      { frame: 63, duration: 500 },
      { frame: 63, stopMoving: true, duration: 500 },
    ];
  }

  isPossible(sheep) {
    const pos = sheep.getPosition();
    return pos.isOnBounding() && pos.getFloor() === window;
  }
}
export class ClimbDownAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frameItv = 300;
    this.frames = [
      3,
      9,
      10,
      11,
      { frame: 3, action: () => this._sheep.changeDirection() },
      { frame: 31, moveToSwinging: true },
      { frame: 40, startSwinging: true },
      41,
      40,
      41,
      40,
      { frame: 45, duration: 1000, startFalling: true },
      { frame: 48, duration: 1000 },
    ];
    this.notAfter = ["run"];
  }

  onStep(inx, frame) {
    const sheep = this._sheep;
    let pos, rect, floor, dir;

    if (frame.moveToSwinging) {
      dir = sheep.getDirection();
      pos = sheep.getPosition();
      rect = getClientRect(pos.getFloor());

      pos.animateTo(
        dir === "r" ? rect.left - SIZE : rect.right,
        rect.floor,
        300,
        easings.easeInSine,
      );
    }

    if (frame.startSwinging) {
      dir = sheep.getDirection();
      pos = sheep.getPosition();
      rect = getClientRect(pos.getFloor());

      pos.set(dir === "r" ? rect.left - SIZE : rect.right, rect.floor);
    }

    if (frame.startFalling) {
      pos = sheep.getPosition();
      floor = pos.findFloorBeneath();
      rect = getClientRect(floor);

      pos.animateTo(
        pos.getX(),
        rect.floor - SIZE,
        1000,
        easings.easeInQuad,
        () => pos.setFloor(floor),
      );
    }
  }

  isPossible(sheep) {
    const pos = sheep.getPosition();
    return pos.isOnBounding() && pos.getFloor() !== window;
  }
}
export class ClimbDown2Action extends Action {
  constructor(sheep) {
    super(sheep);
    this.frameItv = 400;
    this.frames = [
      9,
      10,
      { frame: 81, duration: 1000 },
      { frame: 10, duration: 1000 },
      { frame: 81, duration: 1000 },
      10,
      9,
      3,
      12,
      13,
      {
        frame: 49,
        duration: 300,
        action: () => {
          const pos = this._sheep.getPosition();
          pos.animateTo(pos.getX(), pos.getY() + SIZE, 300);
        },
      },
      42,
      46,
      47,
      46,
      {
        frame: 47,
        duration: 1000,
        action: () => {
          const pos = this._sheep.getPosition();
          const floor = pos.findFloorBeneath();
          const rect = getClientRect(floor);

          pos.animateTo(
            pos.getX(),
            rect.floor - SIZE,
            1000,
            easings.easeInQuad,
            () => pos.setFloor(floor),
          );
        },
      },
      { frame: 48, duration: 1000 },
    ];
  }

  isPossible(sheep) {
    return sheep.getPosition().getFloor() !== window;
  }
}
export class ClimbUpAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frameItv = 400;
    this.frames = [
      12,
      13,
      {
        frame: 49,
        action: () => {
          const pos = this._sheep.getPosition();
          pos.animateTo(pos.getX(), pos.getY() - 50, 600, easings.easeOutCirc);
        },
      },
      132,
      {
        frame: 131,
        action: () => {
          const pos = this._sheep.getPosition();
          pos.animateTo(pos.getX(), pos.getY() - 50, 3000, easings.easeOutCirc);
        },
      },
      132,
      131,
      132,
      131,
      132,
      131,
      { frame: 133, duration: 2000 },
      {
        frame: 47,
        duration: 1000,
        action: () => {
          const pos = this._sheep.getPosition();
          pos.animateTo(
            pos.getX(),
            pos.floorY - SIZE,
            1000,
            easings.easeInCirc,
          );
        },
      },
      { frame: 48, duration: 2000 },
    ];
  }
}
export class JumpToAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frames = [
      { frame: 76, duration: 500 },
      { frame: 30, duration: 1000 },
      { frame: 24, duration: 500 },
    ];
    this.notAfter = ["jumpDown"];
  }

  isPossible(sheep) {
    return !!sheep.getPosition().findUpperFloor();
  }

  beforeStart() {
    const pos = this._sheep.getPosition();
    const floor = pos.findUpperFloor();
    const rect = getClientRect(floor);
    const dir = this._sheep.getDirection();
    const x = rect.getCenterX();

    this.jumpTo = floor;

    if (
      (dir === "r" && x < pos.getX()) ||
      (dir === "l" && x > pos.getX() + SIZE)
    ) {
      this._sheep.changeDirection();
    }
  }

  onStep(step) {
    if (step === 1) {
      const pos = this._sheep.getPosition();
      const rect = getClientRect(this.jumpTo);

      pos.animateTo(
        rect.getCenterX(),
        rect.floor - SIZE,
        1500,
        [easings.easeOutQuad, easings.easeOutBack],
        () => pos.setFloor(this.jumpTo),
      );
    }
  }
}
export class DirectionAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frameItv = 300;
    this.frames = [3, 9, 10, 11, 3];
    this.notAfter = ["directionBack"];
  }

  onStep(inx) {
    if (inx === 4) this._sheep.changeDirection();
  }
}

export class DirectionBackAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frameItv = 300;
    this.frames = [3, 12, 13, 14, 3];
    this.notAfter = ["direction"];
  }

  onStep(inx) {
    if (inx === 4) this._sheep.changeDirection();
  }
}
export class PeeAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.probability = 0.1;
    this.frameItv = 200;
    this.frames = [
      3, 12, 13, 103, 104, 105, 106, 105, 106, 105, 106, 105, 104, 103, 13, 12,
      3,
    ];
  }
}
export class WalkOnHandsAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.bound = true;
    this.frameItv = 200;
    this.frames = [
      3,
      78,
      {
        frame: 86,
        action: () => {
          const sheep = this._sheep;
          const dir = sheep.getDirection();
          const pos = sheep.getPosition();

          pos.animateTo(
            dir === "l" ? pos.getX() - 40 : pos.getX() + SIZE + 40,
            pos.getY(),
            1500,
          );
        },
      },
      87,
      86,
      87,
      86,
      87,
      86,
      78,
      3,
    ];
  }
}

export class WalkOnHands2Action extends Action {
  constructor(sheep) {
    super(sheep);
    this.probability = 0.1;
    this.frameItv = 200;
    this.frames = [
      3,
      9,
      10,
      { frame: 88, frameItv: 400 },
      89,
      88,
      89,
      88,
      89,
      88,
      89,
      88,
      89,
      90,
      { frame: 10, frameItv: 200 },
      9,
      3,
    ];
  }
}
export class RollAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.bound = true;
    this.frameItv = 200;
    this.frames = [
      3,
      9,
      10,
      {
        frame: 126,
        action: () => {
          const sheep = this._sheep;
          const dir = sheep.getDirection();
          const pos = sheep.getPosition();

          pos.animateTo(
            dir === "l" ? pos.getX() - 220 : pos.getX() + 220,
            pos.getY(),
            3000,
          );
        },
      },
      125,
      124,
      123,
      122,
      121,
      120,
      119,
      118,
      117,
      116,
      115,
      114,
      113,
      112,
      10,
      9,
      3,
    ];
  }

  isPossible(sheep) {
    const pos = sheep.getPosition();
    const dir = sheep.getDirection();
    const rect = getClientRect(pos.getFloor());

    return dir === "l"
      ? pos.getX() > rect.left + 220
      : pos.getX() < rect.right - 220 - SIZE;
  }
}
export class BathAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.probability = 0.1;
    this.frameItv = 400;
    this.frames = [
      3,
      9,
      {
        frame: 10,
        action: () => {
          const sheep = this._sheep;
          const pos = sheep.getPosition();
          const div = document.createElement("div");

          div.className = "sheep-js";
          div.style.left = pos.getX() + "px";
          div.style.top = pos.getY() + "px";

          document.body.appendChild(div);
          setFrame(div, 146);

          this.bath = div;
        },
      },
      54,
      55,
      54,
      55,
      54,
      55,
      54,
      55,
      54,
      55,
      {
        frame: 10,
        action: () => {
          if (this.bath) {
            document.body.removeChild(this.bath);
            this.bath = null;
          }
        },
      },
      { frame: 54, duration: 3000 },
      10,
      9,
      3,
    ];
  }

  onStep(inx, frame) {
    if (this.bath && (frame === 54 || frame === 55)) {
      setFrame(this.bath, frame === 54 ? 147 : 148);
    }
  }

  onStop() {
    if (this.bath) {
      document.body.removeChild(this.bath);
      this.bath = null;
    }
  }
}
export class EatAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.frameItv = 300;
    this.frames = [
      { frame: 3, duration: 1000 },
      58,
      59,
      { frame: 60, changeLeaf: true },
      61,
      60,
      61,
      60,
      61,

      { frame: 3, duration: 1000 },
      58,
      59,
      { frame: 60, changeLeaf: true },
      61,
      60,
      61,
      60,
      61,

      { frame: 3, duration: 1000 },
      58,
      59,
      { frame: 60, changeLeaf: true },
      61,
      60,
      61,
      60,
      61,

      { frame: 3, duration: 1000 },
      58,
      59,
      { frame: 60, changeLeaf: true },
      61,
      60,
      61,
      60,
      61,

      { frame: 3, duration: 2000 },
      50,
      51,
      50,
      51,
      50,
      3,
    ];
  }

  beforeStart() {
    const sheep = this._sheep;
    const pos = sheep.getPosition();
    const dir = sheep.getDirection();
    const div = document.createElement("div");

    div.className = "sheep-js";
    div.style.left =
      (dir === "l" ? pos.getX() - SIZE : pos.getX() + SIZE) + "px";
    div.style.top = pos.getY() + "px";

    document.body.appendChild(div);
    setFrame(div, 153);

    this.flower = div;
    this.leafFrame = 149;
  }

  onStep(inx, frame) {
    if (typeof frame !== "number" && frame.changeLeaf) {
      setFrame(this.flower, this.leafFrame);
      this.leafFrame++;
    }
  }

  onStop() {
    if (this.flower) {
      document.body.removeChild(this.flower);
      this.flower = null;
      this.leafFrame = null;
    }
  }

  isPossible(sheep) {
    const dir = sheep.getDirection();
    const pos = sheep.getPosition();
    const rect = getClientRect(pos.getFloor());

    return dir === "l"
      ? pos.getX() > rect.left + SIZE
      : pos.getX() < rect.right - SIZE * 2;
  }
}
export class WaterAction extends Action {
  constructor(sheep) {
    super(sheep);
    this.probability = 0.1;
    this.frameItv = 300;
    this.frames = [
      { frame: 3, duration: 1000 },
      12,
      { frame: 13, action: () => this._sheep.changeDirection() },

      103,
      104,
      105,
      106,
      105,
      106,
      105,
      { frame: 106, changeLeaf: 151 },
      105,
      106,
      105,
      106,
      105,
      { frame: 106, changeLeaf: 150 },
      105,
      106,
      105,
      106,
      105,
      { frame: 106, changeLeaf: 149 },
      105,
      106,
      105,
      106,
      105,
      { frame: 106, changeLeaf: 153 },

      104,
      103,
      { frame: 13, action: () => this._sheep.changeDirection() },
      12,
      { frame: 3, duration: 1000 },
      8,
      { frame: 3, duration: 1000 },
    ];
  }

  beforeStart() {
    const sheep = this._sheep;
    const pos = sheep.getPosition();
    const dir = sheep.getDirection();
    const div = document.createElement("div");

    div.className = "sheep-js";
    div.style.left =
      (dir === "l" ? pos.getX() - SIZE : pos.getX() + SIZE) + "px";
    div.style.top = pos.getY() + "px";

    document.body.appendChild(div);
    setFrame(div, 152);

    this.flower = div;
  }

  onStep(inx, frame) {
    if (typeof frame !== "number" && frame.changeLeaf) {
      setFrame(this.flower, frame.changeLeaf);
    }
  }

  onStop() {
    if (this.flower) {
      document.body.removeChild(this.flower);
      this.flower = null;
    }
  }

  isPossible(sheep) {
    const dir = sheep.getDirection();
    const pos = sheep.getPosition();
    const rect = getClientRect(pos.getFloor());

    return dir === "l"
      ? pos.getX() > rect.left + SIZE
      : pos.getX() < rect.right - SIZE * 2;
  }
}
