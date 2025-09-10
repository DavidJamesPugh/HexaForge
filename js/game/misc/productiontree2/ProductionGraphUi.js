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
      root.x = root.width / 2 - 12.5;
      root.sx = 0;
  
      this.calculatePositions(this.rootNode);
  
      const canvas = document.createElement("canvas");
      canvas.style.position = "absolute";
      canvas.width = root.width + 12.5;
      canvas.height = 33 * (this.maxLevel + 1);
  
      this.canvas = canvas;
      this.drawElements(this.rootNode);
  
      container.html(canvas);
      container.width(canvas.width);
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
        cPos.y = 33 * child.getLevel();
        cPos.x = sx + cPos.width / 2 - 12.5;
        cPos.sx = sx;
        sx += cPos.width;
        this.calculatePositions(child);
      }
    }
  
    drawComponentIcon(node, x, y) {
      const ctx = this.canvas.getContext("2d");
      const meta = node.getComponentMeta();
      ctx.drawImage(
        this.imageMap.getImage("componentIcons"),
        26 * meta.iconX,
        26 * meta.iconY,
        25, 25,
        x, y,
        25, 25
      );
    }
  
    drawElements(node) {
      const children = node.getChildren();
      const pos = this.positions[node.getId()];
  
      for (const key in children) {
        const child = children[key];
        const cPos = this.positions[child.getId()];
        this.drawLine(pos.x + 12.5, pos.y + 12.5, cPos.x + 12.5, cPos.y);
        this.drawElements(child);
      }
  
      this.drawComponentIcon(node, pos.x, pos.y);
      this.writeToNode(pos.x + 27, pos.y + 16.5, node.amount);
    }
  
    drawLine(x1, y1, x2, y2) {
      const ctx = this.canvas.getContext("2d");
      ctx.beginPath();
      ctx.strokeStyle = "rgb(201,201,201)";
      ctx.lineWidth = 1;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  
    writeToNode(x, y, text) {
      const ctx = this.canvas.getContext("2d");
      ctx.font = "11px Arial";
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(text, x, y);
    }
  }
  