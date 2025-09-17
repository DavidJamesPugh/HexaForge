const ICON_SIZE = 25;
const ICON_SPACING = 1;
const NODE_OFFSET_X = ICON_SIZE / 2;
const NODE_SPACING_Y = 33;

export default class ProductionGraphUi {
    constructor(rootNode, imageMap) {
      this.rootNode = rootNode;
      this.imageMap = imageMap;
      this.positions = {};
      this.maxLevel = 0;
      this.canvas = null;

    }
  
    display(container) {
      const root = { node: this.rootNode, width: 0 };
      this.positions[this.rootNode.getId()] = root;
  
      this.calculateWidths(this.rootNode);
      root.y = 0;
      root.x = root.width / 2 - NODE_OFFSET_X;
      root.sx = 0;
  
      this.calculatePositions(this.rootNode);
  
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.width = root.width + NODE_OFFSET_X;
      canvas.height = NODE_SPACING_Y * (this.maxLevel + 1);
  
      
      this.canvas = canvas;
      this.ctx = this.canvas.getContext("2d");
      this.drawElements(this.rootNode);
  
      container.innerHTML = "";
      container.appendChild(canvas);
      Object.assign(container.style, {
        width: `${canvas.width}px`
      });
      //container.width(canvas.width);
    }
  
    calculateWidths(node) {
      const children = node.getChildren();
      for (const key in children) {
        const child = children[key];
        this.positions[child.getId()] = { node: child, width: 0 };
        this.calculateWidths(child);
        this.positions[node.getId()].width += this.positions[child.getId()].width;
      }
      if (!this.positions[node.getId()].width) {
        this.positions[node.getId()].width += 40;
      }
    }
  
    calculatePositions(node) {
      this.maxLevel = Math.max(this.maxLevel, node.getLevel());
      const pos = this.positions[node.getId()];
      const children = node.getChildren();
      let sx = pos.sx;
  
      for (const key in children) {
        const child = children[key];
        const cPos = this.positions[child.getId()];
        cPos.y = NODE_SPACING_Y * child.getLevel();
        cPos.x = sx + cPos.width / 2 - NODE_OFFSET_X;
        cPos.sx = sx;
        sx += cPos.width;
        this.calculatePositions(child);
      }
    }
  
    drawComponentIcon(node, x, y) {
      const sprite = this.imageMap.getImage("componentIcons");
      if (!sprite) {
        console.warn("ProductionGraphUi: Missing sprite for componentIcons");
        return;
      }
      const meta = node.getComponentMeta();
      this.ctx.drawImage(
        sprite,
        (ICON_SIZE + ICON_SPACING) * meta.iconX,
        (ICON_SIZE + ICON_SPACING) * meta.iconY,
        ICON_SIZE, ICON_SIZE,
        x, y,
        ICON_SIZE, ICON_SIZE
      );
    }
  
    drawElements(node) {
      const children = node.getChildren();
      const pos = this.positions[node.getId()];
  
      for (const key in children) {
        const child = children[key];
        const cPos = this.positions[child.getId()];
        this.drawLine(pos.x + NODE_OFFSET_X, pos.y + ICON_SIZE, 
          cPos.x + NODE_OFFSET_X, cPos.y);
        this.drawElements(child);
      }
  
      this.drawComponentIcon(node, pos.x, pos.y);
      this.writeToNode(pos.x + 27, pos.y + 16.5, node.amount);
    }
  
    drawLine(x1, y1, x2, y2) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = "rgb(201,201,201)";
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  
    writeToNode(x, y, text) {
      this.ctx.font = "11px Arial";
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "#FFFFFF";
      this.ctx.fillText(text, x, y);
    }
  }
  