// ScreenShotUi.js
export default class ScreenShotUi {
    constructor(factory, { tileSize }, backgroundCanvas, componentsCanvas, packagesCanvas) {
      this.tileSize = tileSize;
      this.tilesX = factory.getMeta().tilesX;
      this.tilesY = factory.getMeta().tilesY;
      this.backgroundCanvas = backgroundCanvas;
      this.componentsCanvas = componentsCanvas;
      this.packagesCanvas = packagesCanvas;
    }
  
    open() {
      this.canvas = document.createElement("canvas");
      this.canvas.width = this.tilesX * this.tileSize;
      this.canvas.height = this.tilesY * this.tileSize;
  
      const ctx = this.canvas.getContext("2d");
      ctx.drawImage(this.backgroundCanvas, 0, 0);
      ctx.drawImage(this.componentsCanvas, 0, 0);
      ctx.drawImage(this.packagesCanvas, 0, 0);
  
      window.open("about:blank", "image from canvas").document.write(`
        <html>
          <body style="text-align:center; background-color:black; color:orangered; font-weight:bold;">
            <div style="margin: 0 0 8px 0;">
              For sharing copy or save image to disk. Or just make a screenshot, if your monitor is big enough :p
            </div>
            <img src="${this.canvas.toDataURL("image/png")}" alt="from canvas"/>
          </body>
        </html>
      `);
    }
  }
  