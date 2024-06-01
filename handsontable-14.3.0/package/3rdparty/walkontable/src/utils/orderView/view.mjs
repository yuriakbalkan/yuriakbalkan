import "core-js/modules/es.error.cause.js";
import "core-js/modules/es.array.push.js";
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { WORKING_SPACE_TOP, WORKING_SPACE_BOTTOM } from "./constants.mjs";
import ViewSizeSet from "./viewSizeSet.mjs";
/**
 * Executive model for each table renderer. It's responsible for injecting DOM nodes in a
 * specified order and adjusting the number of elements in the root node.
 *
 * Only this class have rights to juggling DOM elements within the root node (see render method).
 *
 * @class {OrderView}
 */
export default class OrderView {
  constructor(rootNode, nodesPool, childNodeType) {
    /**
     * The root node to manage with.
     *
     * @type {HTMLElement}
     */
    _defineProperty(this, "rootNode", void 0);
    /**
     * Factory for newly created DOM elements.
     *
     * @type {Function}
     */
    _defineProperty(this, "nodesPool", void 0);
    /**
     * Holder for sizing and positioning of the view.
     *
     * @type {ViewSizeSet}
     */
    _defineProperty(this, "sizeSet", new ViewSizeSet());
    /**
     * Node type which the order view will manage while rendering the DOM elements.
     *
     * @type {string}
     */
    _defineProperty(this, "childNodeType", void 0);
    /**
     * The visual index of currently processed row.
     *
     * @type {number}
     */
    _defineProperty(this, "visualIndex", 0);
    /**
     * The list of DOM elements which are rendered for this render cycle.
     *
     * @type {HTMLElement[]}
     */
    _defineProperty(this, "collectedNodes", []);
    this.rootNode = rootNode;
    this.nodesPool = nodesPool;
    this.childNodeType = childNodeType.toUpperCase();
  }

  /**
   * Sets the size for rendered elements. It can be a size for rows, cells or size for row
   * headers etc. It depends for what table renderer this instance was created.
   *
   * @param {number} size The size.
   * @returns {OrderView}
   */
  setSize(size) {
    this.sizeSet.setSize(size);
    return this;
  }

  /**
   * Sets the offset for rendered elements. The offset describes the shift between 0 and
   * the first rendered element according to the scroll position.
   *
   * @param {number} offset The offset.
   * @returns {OrderView}
   */
  setOffset(offset) {
    this.sizeSet.setOffset(offset);
    return this;
  }

  /**
   * Checks if this instance of the view shares the root node with another instance. This happens only once when
   * a row (TR) as a root node is managed by two OrderView instances. If this happens another DOM injection
   * algorithm is performed to achieve consistent order.
   *
   * @returns {boolean}
   */
  isSharedViewSet() {
    return this.sizeSet.isShared();
  }

  /**
   * Returns rendered DOM element based on visual index.
   *
   * @param {number} visualIndex The visual index.
   * @returns {HTMLElement}
   */
  getNode(visualIndex) {
    return visualIndex < this.collectedNodes.length ? this.collectedNodes[visualIndex] : null;
  }

  /**
   * Returns currently processed DOM element.
   *
   * @returns {HTMLElement}
   */
  getCurrentNode() {
    const length = this.collectedNodes.length;
    return length > 0 ? this.collectedNodes[length - 1] : null;
  }

  /**
   * Returns rendered child count for this instance.
   *
   * @returns {number}
   */
  getRenderedChildCount() {
    const {
      rootNode,
      sizeSet
    } = this;
    let childElementCount = 0;
    if (this.isSharedViewSet()) {
      let element = rootNode.firstElementChild;
      while (element) {
        if (element.tagName === this.childNodeType) {
          childElementCount += 1;
        } else if (sizeSet.isPlaceOn(WORKING_SPACE_TOP)) {
          break;
        }
        element = element.nextElementSibling;
      }
    } else {
      childElementCount = rootNode.childElementCount;
    }
    return childElementCount;
  }

  /**
   * Setups and prepares all necessary properties and start the rendering process.
   * This method has to be called only once (at the start) for the render cycle.
   */
  start() {
    this.collectedNodes.length = 0;
    this.visualIndex = 0;
    const {
      rootNode,
      sizeSet
    } = this;
    const isShared = this.isSharedViewSet();
    const {
      nextSize
    } = sizeSet.getViewSize();
    let childElementCount = this.getRenderedChildCount();
    while (childElementCount < nextSize) {
      const newNode = this.nodesPool();
      if (!isShared || isShared && sizeSet.isPlaceOn(WORKING_SPACE_BOTTOM)) {
        rootNode.appendChild(newNode);
      } else {
        rootNode.insertBefore(newNode, rootNode.firstChild);
      }
      childElementCount += 1;
    }
    const isSharedPlacedOnTop = isShared && sizeSet.isPlaceOn(WORKING_SPACE_TOP);
    while (childElementCount > nextSize) {
      rootNode.removeChild(isSharedPlacedOnTop ? rootNode.firstChild : rootNode.lastChild);
      childElementCount -= 1;
    }
  }

  /**
   * Renders the DOM element based on visual index (which is calculated internally).
   * This method has to be called as many times as the size count is met (to cover all previously rendered DOM elements).
   */
  render() {
    const {
      rootNode,
      sizeSet
    } = this;
    let visualIndex = this.visualIndex;
    if (this.isSharedViewSet() && sizeSet.isPlaceOn(WORKING_SPACE_BOTTOM)) {
      visualIndex += sizeSet.sharedSize.nextSize;
    }
    let node = rootNode.childNodes[visualIndex];
    if (node.tagName !== this.childNodeType) {
      const newNode = this.nodesPool();
      rootNode.replaceChild(newNode, node);
      node = newNode;
    }
    this.collectedNodes.push(node);
    this.visualIndex += 1;
  }

  /**
   * Ends the render process.
   * This method has to be called only once (at the end) for the render cycle.
   */
  end() {}
}