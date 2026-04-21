/**
 * Auto handoff between touching (cardinal edge) components without conveyors.
 * Transport lines still use explicit InputOutput links only.
 */

export default class DirectNeighborTransfer {
  static canDirectEdgeOutput(neighborMeta) {
    const t = neighborMeta?.strategy?.type;
    if (t === "converter" || t === "seller") return true;
    if (t === "lab" && neighborMeta.strategy.inputResources) return true;
    return false;
  }

  static canDirectEdgeInputSource(neighborMeta) {
    const t = neighborMeta?.strategy?.type;
    if (t === "buyer" || t === "converter") return true;
    if (t === "lab" && neighborMeta.strategy.production) return true;
    return false;
  }

  static acceptsResourceForDirectInput(neighborMeta, resourceId) {
    const s = neighborMeta?.strategy;
    if (!s) return false;
    if (s.type === "converter" && s.inputResources?.[resourceId]) return true;
    if (s.type === "lab" && s.inputResources?.[resourceId]) return true;
    if (s.type === "seller" && s.resources?.[resourceId] && !s.resources[resourceId].bonus) {
      return true;
    }
    return false;
  }
}
