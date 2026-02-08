import Observable from "@metaphorjs/observable";
import { MeteorAction } from "./actions/Actions";
import { ActionFactory, ActionRegistry } from "./actions/ActionsUtils";
import { easings } from "./Easing";
import { Position } from "./Position";
import {
  addListener,
  bind,
  getClientRect,
  getRandomInt,
  inArray,
  initCSS,
  removeListener,
  setFrame,
  SIZE,
} from "./Utils";
let cssInitialized = false;
export default class Sheep extends Observable {
  constructor(options) {
    super();
    this.elem = null;
    this.direction = "l";
    this.position = null;
    this.action = null;
    this.actionId = null;
    this.auto = false;

    this.ofsX = null;
    this.ofsY = null;
    this.dragging = false;

    if (!cssInitialized) {
      initCSS();
      cssInitialized = true;
    }
    this.tickDelegate = bind(this.tick, this);

    this.action = new MeteorAction(this);
    this.position = new Position(this, options.floors || "window");

    this.position.on("bounding", this.onBounding, this);
    this.action.on("end", this.onActionEnd, this);

    this.mouseDownDelegate = bind(this.onMouseDown, this);
    this.mouseUpDelegate = bind(this.onMouseUp, this);
    this.mouseMoveDelegate = bind(this.onMouseMove, this);
    this.createElem();

    this.trigger("init");

    this.activate();
  }

  getDirection() {
    return this.direction;
  }

  getAction() {
    return this.action;
  }

  getPosition() {
    return this.position;
  }

  getElem() {
    return this.elem;
  }

  activate() {
    if (!this.actionId) {
      this.position.setFloor(window);
      this.setAction(ActionFactory.create("meteor", this));
      requestAnimationFrame(this.tickDelegate);
      this.start();
    }
  }

  start() {
    if (!this.actionId) {
      this.findNewAction();
    }
    this.auto = true;
  }

  stop() {
    this.auto = false;
    this.action.end();
    this.actionId = null;
    this.position.stopAnimation();
  }

  tick() {
    this.trigger("tick", new Date().getTime());
    requestAnimationFrame(this.tickDelegate);
  }

  setAction(action) {
    this.action.stop();
    this.action = action;
    this.action.on("end", this.onActionEnd, this);
    this.actionId = action.id;
    this.action.run();
  }

  changeDirection() {
    if (this.direction == "l") {
      this.elem.className = "sheep-js sheep-js-reversed";
      this.direction = "r";
    } else {
      this.elem.className = "sheep-js";
      this.direction = "l";
    }
  }

  findNewAction() {
    const newInx = getRandomInt(0, Object.keys(ActionRegistry).length),
      id = Object.keys(ActionRegistry)[newInx],
      action = ActionFactory.create(id, this),
      another = () => {
        this.findNewAction();
      };

    if (this.action.nextAction) {
      this.setAction(ActionFactory.create(this.action.nextAction, this));
      return null;
    }

    if (this.actionId == id || action.notAfter == id) {
      return another();
    }

    if (action.isPossible && !action.isPossible(this)) {
      return another();
    }

    if (action.probability && Math.random() > action.probability) {
      return another();
    }

    if (action.notAfter && inArray(action.notAfter, this.actionId)) {
      return another();
    }

    if (action.onlyAfter && !inArray(action.onlyAfter, this.actionId)) {
      return another();
    }

    this.setAction(action);
    return null;
  }

  onActionEnd() {
    if (this.auto) {
      this.findNewAction();
    }
  }

  onBounding() {
    if (this.auto) {
      this.findNewAction();
    }
  }

  createElem() {
    const div = document.createElement("div");
    div.className = "sheep-js";
    document.body.appendChild(div);
    this.elem = div;
    addListener(div, "mousedown", this.mouseDownDelegate);
  }

  setFrame(inx) {
    setFrame(this.elem, inx);
  }

  onMouseDown(e) {
    addListener(document.documentElement, "mousemove", this.mouseMoveDelegate);
    addListener(document.documentElement, "mouseup", this.mouseUpDelegate);

    this.stop();
    this.setFrame(50);
    this.getPosition().setFloor(null);
    this.dragging = true;

    const pos = this.getPosition();
    this.ofsX = e.clientX - pos.getX();
    this.ofsY = e.clientY - pos.getY();

    if (e.preventDefault) {
      e.preventDefault();
    }
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    return false;
  }

  onMouseUp() {
    const pos = this.getPosition(),
      floor = pos.findFloorBeneath(),
      rect = getClientRect(floor);

    removeListener(
      document.documentElement,
      "mousemove",
      this.mouseMoveDelegate,
    );
    removeListener(document.documentElement, "mouseup", this.mouseUpDelegate);

    this.dragging = false;
    this.setFrame(47);
    pos.animateTo(
      pos.getX(),
      rect.floor - SIZE,
      1000,
      easings.easeInCirc,
      () => {
        if (this.dragging) {
          return;
        }
        this.setFrame(48);
        pos.setFloor(floor);
        window.setTimeout(() => {
          if (this.dragging) {
            return;
          }
          this.start();
        }, 2000);
      },
    );
  }

  onMouseMove(e) {
    const pos = this.getPosition();
    pos.set(e.clientX - this.ofsX, e.clientY - this.ofsY);
  }
}
