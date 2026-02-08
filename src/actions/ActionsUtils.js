import {
  BathAction,
  BumpAction,
  CallAction,
  ClimbDown2Action,
  ClimbDownAction,
  ClimbUpAction,
  DirectionAction,
  DirectionBackAction,
  EatAction,
  JumpDownAction,
  JumpToAction,
  MeteorAction,
  PeeAction,
  RollAction,
  RunAction,
  SleepAction,
  StareAction,
  WalkAction,
  WalkOnHands2Action,
  WalkOnHandsAction,
  WaterAction,
  YawnAction,
} from "./Actions";

export const ActionRegistry = {
  meteor: MeteorAction,
  sleep: SleepAction,
  call: CallAction,
  yawn: YawnAction,
  stare: StareAction,
  jumpDown: JumpDownAction,
  climbDown: ClimbDownAction,
  climbDown2: ClimbDown2Action,
  climbUp: ClimbUpAction,
  jumpTo: JumpToAction,
  bath: BathAction,
  eat: EatAction,
  water: WaterAction,
  pee: PeeAction,
  walkOnHands: WalkOnHandsAction,
  walkOnHands2: WalkOnHands2Action,
  roll: RollAction,
  walk: WalkAction,
  run: RunAction,
  bump: BumpAction,
  direction: DirectionAction,
  directionBack: DirectionBackAction,
};

export class ActionFactory {
  static create(actionId, sheep) {
    const ActionClass = ActionRegistry[actionId];

    if (!ActionClass) {
      throw new Error(`Unknown action: "${actionId}"`);
    }

    const action = new ActionClass(sheep);
    action.id = actionId;
    return action;
  }

  static has(actionId) {
    return !!ActionRegistry[actionId];
  }

  static list() {
    return Object.keys(ActionRegistry);
  }
}
