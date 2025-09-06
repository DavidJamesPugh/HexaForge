/**
 * Meta configuration module - provides game configuration and factory metadata
 * Extracted from original_app.js
 */
define("config/Meta", [], function() {
    
    /**
     * Game meta configuration
     */
    var meta = {
        // Game settings
        startingMoney: 1000,
        startingResearchPoints: 100,
        minNegativeMoney: -10000,
        timeTravelTicketValue: 3,
        
        // Factories configuration
        factories: [
            {
                id: "level1",
                idNum: 1,
                name: "Factory",
                tilesX: 68,
                tilesY: 38,
                startX: 8,
                startY: 10,
                price: 100,
                terrains: { G: "grass", X: "wall", ".": "road", " ": "floor" },
                buildableTerrains: { floor: true },
                terrainMap: "XXXXXXXXXXXX.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG.GGGGGGGGGG.GGGGGGGGGGX          X.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXG.GXXXXXXXXX.XXXXXXXXXGX          X.X        X         X           XG.GX        .        XGX           .         X         X            G.G         .        XGX           .         X                      G.G       XX.XX      XGX          X.X        X                     XG.GX      XG.GX      XGX          X.X        X                     XG.GXXX XXXXG.GX      XGX          X.X      X XX X                  XG.GX      XXXXX      XGX           .       X    X      X           XG.GX                 XGXXXX    XXXX.X      X    X      X           XG.GX                 XG.............X      X    X      XXXXXXXXXXXXXG.GXXXXXXXXXX  XXX  XXGXXXX    XXXX.X      X    X      X...................................X          X.X      X    X      X.GGGGGGXXXXXXXXXXXXXXX.XX  XXX  XXXX          X.X                  X.GGGGGGX              .           XX          X.XXX   XXXXXXXXX   XX.GGGGGGX             X.X          XX          X......................GGGGGGXX           XX.XX         XX          X.XXX   XXXXXXXXX   XX.GGGGGGGX           XG.GX         XX     X    X.X                  X.GGGGGGXX           XX.XX         XX     X    X.X                  X.GGGGGGX              .           XX     X    X.X            X     X.GGGGGGX             X.X          XX     XXXXXX.X            X     X.GGGGGGXX           XX.XX         XX         XG.X            X     X.GGGGGGGX           XG.GX         XXX         G.             X     X.GGGGGGXX           XX.XX         XGX         G.             X     X.GGGGGGX              .           XGX         G.             X     X.XXXGXXX             X.X          XGX         G.             X     X.X XXX              XX.XX         XGX        XG.X                   .                   XG.GX         XGXXXX  XXXXG.X                   .                   XX.XX         XGGGGGGGGGGGG.XXXXXXXX   XXX   XXX.X                    .           X...................GGGGGGGGGGGGGG.X                    .           XGGGGX  XXXXG.XXXXX................X                    .           XGXXXX     XX.X   XXXX   XXX   XXX.X                    .           XGX          .       X           X.X                  XX.X          XGX          .                    .                   X..X          XGX          .                    .      XXXXXXXX     X.XX          XGX        XX.X      X            .      XGGGGGGX     X.X           XGXXXXXXXXXXG.X      X           X.XXXXXXXGGGGGGXXXXXXX.X           XGGGGGGGGGGGG.XXXXXXXXXXXXXXXXXXXX.GGGGGGGGGGGGGGGGGGGG.XXXXXXXXXXXXX",
                buildMap: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXX        X         X           XXXXX        -        XXX           -         X         X            ---         -        XXX           -         X                      ---       XXXXX      XXX          XXX        X                     XXXXX      XXXXX      XXX          XXX        X                     XXXXXXX XXXXXXXX      XXX          XXX      X XX X                  XXXXX      XXXXX      XXX           -       X    X      X           XXXXX                 XXXXXX    XXXXXX      X    X      X           XXXXX                 XXXXXX----XXXXXX      X    X      XXXXXXXXXXXXXXXXXXXXXXXXXX  XXX  XXXXXXX    XXXXXX      X    X      XXXXXXXXXXXXXXXXXXXXXXXXXX--XXX--XXXX          XXX      X    X      XXXXXXXXXXXXXXXXXXXXXXXXXX  XXX  XXXX          XXX                  XXXXXXXXX              -           XX          XXXXX   XXXXXXXXX   XXXXXXXXXX             XXX          XX          XXXXX---XXXXXXXXX---XXXXXXXXXXX           XXXXX         XX          XXXXX   XXXXXXXXX   XXXXXXXXXXX           XXXXX         XX     X    XXX                  XXXXXXXXXX           XXXXX         XX     X    XXX                  XXXXXXXXX              -           XX     X    XXX            X     XXXXXXXXX             XXX          XX     XXXXXXXX            X     XXXXXXXXXX           XXXXX         XX         XXXX            X     XXXXXXXXXX           XXXXX         XXX         --             X     XXXXXXXXXX           XXXXX         XXX         --             X     XXXXXXXXX              -           XXX         --             X     XXXXXXXXX             XXX          XXX         --             X     XXX XXX              XXXXX         XXX        X-XX                   -                   XXXXX         XXXXXX  XXXX-XX                   -                   XXXXX         XXXXXX-------XXXXXXXXX   XXX   XXXXX                    -           XXXXXX--XXXXXXXXXXXX--------------XX                    -           XXXXXX  XXXXXXXXXXXXXX---XXX---XXXXX                    -           XXXXXX     XXXX   XXXX   XXX   XXXXX                    -           XXX          -       X           XXX                  XXXX          XXX          -                    -                   XXXX          XXX          -                    -      XXXXXXXX     XXXX          XXX        XXXX      X            -      XXXXXXXX     XXX           XXXXXXXXXXXXXXX      X           XXXXXXXXXXXXXXXXXXXXXXXX           XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                areas: [
                  { id: "a2", name: "A2", idNum: 1, price: 1200, locations: [{ x: 0, y: 0, x2: 11, y2: 9 }] },
                  { id: "a4", name: "A4", idNum: 2, price: 250000, locations: [{ x: 0, y: 11, x2: 11, y2: 27 }] },
                  { id: "a1", name: "A1", idNum: 3, price: 700, locations: [{ x: 0, y: 30, x2: 11, y2: 37 }] },
                  { id: "a5", name: "A5", idNum: 4, price: 26000000, locations: [{ x: 13, y: 1, x2: 32, y2: 14 }] },
                  { id: "a6", name: "A6", idNum: 5, price: 32000000, locations: [{ x: 33, y: 1, x2: 44, y2: 10 }] },
                  {
                    id: "a3",
                    name: "A3",
                    idNum: 6,
                    price: 12000,
                    locations: [
                      { x: 13, y: 31, x2: 32, y2: 37 },
                      { x: 13, y: 30, x2: 17, y2: 30 },
                    ],
                  },
                  { id: "a7", name: "A7", idNum: 7, price: 1400000000, locations: [{ x: 48, y: 1, x2: 66, y2: 10 }] },
                  {
                    id: "a9",
                    name: "A9",
                    idNum: 8,
                    price: 40000000000,
                    locations: [
                      { x: 34, y: 12, x2: 53, y2: 36 },
                      { x: 54, y: 12, x2: 54, y2: 32 },
                    ],
                  },
                  {
                    id: "a8",
                    name: "A8",
                    idNum: 9,
                    price: 2900000000,
                    locations: [
                      { x: 56, y: 12, x2: 67, y2: 37 },
                      { x: 55, y: 34, x2: 55, y2: 37 },
                    ],
                  },
                ],
                startComponents: [
                  { id: "ironBuyer", x: 15, y: 18 },
                  { id: "ironFoundry", x: 19, y: 18 },
                  { id: "ironSeller", x: 25, y: 18 },
                  { id: "transportLine", x: 17, y: 18 },
                  { id: "transportLine", x: 18, y: 18 },
                  { id: "transportLine", x: 23, y: 18 },
                  { id: "transportLine", x: 24, y: 18 },
                ],
                transportLineConnections: [
                  { fromX: 16, fromY: 18, toX: 17, toY: 18 },
                  { fromX: 17, fromY: 18, toX: 18, toY: 18 },
                  { fromX: 18, fromY: 18, toX: 19, toY: 18 },
                  { fromX: 22, fromY: 18, toX: 23, toY: 18 },
                  { fromX: 23, fromY: 18, toX: 24, toY: 18 },
                  { fromX: 24, fromY: 18, toX: 25, toY: 18 },
                ],
              },
            {
                id: "level2",
                idNum: 2,
                name: "Kilofactory",
                tilesX: 50,
                tilesY: 35,
                startX: 12,
                startY: 0,
                price: 1000000000,
                terrains: { G: "grass", X: "wall", ".": "road", " ": "floor" },
                buildableTerrains: { floor: true },
                terrainMap: "GGGGGGGGGGGGGGG.GGGGGGGGGGGGGGGGGGGG.GGGGGGGGGGGGGGXXXXXXXXXXXXGG.GXXXXXXXXXXXXXXXXXXX.XXXXXXXXXXXXGGX          XGG.GX                 X.X          XGGX          XGG.GX                 X.X          XGGX          XGG.GX                 X.X          XGGX          XGG.GX                 X.X          XGGX           GG.G                   .           XGGX          XGG.GX                 X.X          XGGX           GG.G                   .           XGGX          XGG.GX                 X.X          XGGX           GG.G                   .           XGGX          XGG.GX                 X.X          XGGX           GG.G                   .           XGGX          XGG.GX                 X.X          XGGX           GG.G                   .           XGGX          XGG.GX                 X.X          XGGX          XGG.GX                 X.X          XGGX          XGG.GX                 X.X          XGGXXXX    XXXXGG.GXXXXX  X  XXX  X  X.XXXXXXXXXXXXG................GGGGGG  G  GGG  G  G.GGGGGGGGGGGGGGXXXX    XXXXGG.GGGGGGGGGGGGGGGGGGGG.GGGGGGGGGGGGGGX          XGG......................GGGGGGG GGGGGGX          XGG.GGGGGG  G  G.G  G  GGGGGGGG   GGGGGX          XGG.GXXXXX  X  X.X  X  XXXXXGGGG GGGGGGX          XGG.GX         X.X         XGGGGGGGGGGGX          XGG.GX         X.X         XGGGGGGGGGGGX          XGG.GX         X.X         XGGG GGGGGGX          XGG.GX         X.X         XGGG   GGGGGX          XGG.GX         X.X         XGGGG GGGGGGX          XGG.GX         X.X         XGGGGGGGGGGGX          XGG.GX         X.X         XGGGGGGGGGGGX          XGG.GX        XX.XX        XGGGG GGGGGGX          XGG.GX        XG.GX        XGGG   GGGGGXXXXXXXXXXXXGG.GXXXXXXXXXXG.GXXXXXXXXXXGGGG GGGGGGGGGGGGGGGGGGGG.GGGGGGGGGGGG.GGGGGGGGGGGGGGGGGGGGG",
                buildMap: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX          XXXXXX                 XXX          XXXX          XXXXXX                 XXX          XXXX          XXXXXX                 XXX          XXXX          XXXXXX                 XXX          XXXX           ----                   -           XXXX          X----X                 X-X          XXXX           ----                   -           XXXX          X----X                 X-X          XXXX           ----                   -           XXXX          X----X                 X-X          XXXX           ----                   -           XXXX          X----X                 X-X          XXXX           ----                   -           XXXX          XXXXXX                 XXX          XXXX          XXXXXX                 XXX          XXXX          XXXXXX                 XXX          XXXXXXX    XXXXXXXXXXXXX  X  XXX  X  XXXXXXXXXXXXXXXXXXXX----XXXXXXXXXXXXX  -  XXX  -  XXXXXXXXXXXXXXXXXXXX    XXXXXXXXXXXXX-----XXX-----XXXXXXXXXXXXXXXXX          XXXXXXXXXX-----XXX-----XXXXXXXXX XXXXXXX          XXXXXXXXXX  -  XXX  -  XXXXXXXX   XXXXXX          XXXXXXXXXX  X  XXX  X  XXXXXXXXX XXXXXXX          XXXXXX         XXX         XXXXXXXXXXXXX          XXXXXX         XXX         XXXXXXXXXXXXX          XXXXXX         XXX         XXXXX XXXXXXX          XXXXXX         XXX         XXXX   XXXXXX          XXXXXX         XXX         XXXXX XXXXXXX          XXXXXX         XXX         XXXXXXXXXXXXX          XXXXXX         XXX         XXXXXXXXXXXXX          XXXXXX        XXXXX        XXXXX XXXXXXX          XXXXXX        XXXXX        XXXX   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                areas: [
                  { id: "b3", name: "B3", idNum: 1, price: 12000000000, locations: [{ x: 1, y: 1, x2: 12, y2: 18 }] },
                  { id: "b1", name: "B1", idNum: 2, price: 2500000000, locations: [{ x: 16, y: 22, x2: 27, y2: 34 }] },
                  { id: "b2", name: "B2", idNum: 3, price: 2500000000, locations: [{ x: 29, y: 22, x2: 39, y2: 34 }] },
                  { id: "b5", name: "B5", idNum: 4, price: 800000000000, locations: [{ x: 37, y: 1, x2: 48, y2: 18 }] },
                  { id: "b4", name: "B4", idNum: 5, price: 26000000000, locations: [{ x: 1, y: 20, x2: 12, y2: 33 }] },
                ],
              },
              {
                id: "level3",
                idNum: 3,
                name: "Megafactory",
                tilesX: 68,
                tilesY: 42,
                startX: 10,
                startY: 3,
                price: 5000000000000,
                terrains: { G: "grass", X: "wall", ".": "road", " ": "floor" },
                buildableTerrains: { floor: true },
                terrainMap: "GGGGGGGGGGGGGGGGGGGGGGG.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGXXXXXXXXXXXXXXXXXXXXXX.GXXXXXXXXXXXXXXXXXXGGXXXXXXXXXXXXXXXXXXXXXXGGX                     .G                 XGGX                    XGGX                     .G                  GG                     XGGX                    X.GX                 GG                     XGGX                    X.GX                 GG                     XGGX                    X.GX                 GG                     XGGX                    X.GX                 GG                     XGGX                    X.GX                 GG                     XGGX                    X.GX                 GG                     XGGX                    X.GX                 GG                     XGGX                    X.GX                XGGX                    XGGX                    X.GX          XXXXXXXGGXXX                  XGGX                    X.GX          XGGGGGGGGGGX                  XGGX             XXX    X.GX          XGGGGGGGGGGX                  XGGX             X........GX          XGGGGGGGGGGX                  XGGX             X.X    XXXX          XGGGGGGGGGGX                  XGGX             X.X                  XGGGGGGGGGGXXXX   XXX  XXX   XXGGX             X.X                  XGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGX             X.X                  XGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGXXXX   XXXXXXXX.X                  XGG..............................................X                  XGG.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG.X                  XGG.GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG.X                  XGG.GGXXXXXXXXX   XXX  XXX   XXGGGGGGGGGGGGGGGGG.X                  XGG.GGX                       XGGXXXX   XXXXXGGG.X                  XGG.GGX                       XGGX          XGGG.X                  XGG.GGX                       XGGX          XGGG.X                  XGG.GGX                       XGGX          XGGG.X                  XGG.GGX                       XGGX          XGGG.X    XXXXXXXXXX    XGG.GGX                       XGGX          XGGG........................GGX                       XGGX          XGGG.X    XXXXXXXXXX    XGG.GGX                       XGGX          XGGG.X                  XGG.GGX                       XGGX          XGGG.X                  XGG.GGX                       XGGX          XGGG.X                  XGG.GGX                       XGGX          XGGG.X                   GG.GG                        XGGX          XGGG.X                   GG.GG                        XGGX          XGGG.X                  XGG.GGX                       XGGX          XGGG.X                  XGG.GGX                       XGGXXXXXXXXXXXXGGG.X                  XGG.GGXXXXXXXXXXXXXXXXXXXXXXXXXGGGGGGGGGGGGGGGGG.XXXXXXXXXXXXXXXXXXXXGG.GGGGGGGGGGGGGGGGGGGGGGGGGGGG",
                buildMap: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                     --                 XXXX                    XXXX                     --                  --                     XXXX                    XXXX                 --                     XXXX                    XXXX                 --                     XXXX                    XXXX                 --                     XXXX                    XXXX                 --                     XXXX                    XXXX                 --                     XXXX                    XXXX                 --                     XXXX                    XXXX                XXXX                    XXXX                    XXXX          XXXXXXXXXXXX                  XXXX                    XXXX          XXXXXXXXXXXX                  XXXX             XXX    XXXX          XXXXXXXXXXXX                  XXXX             XXX----XXXX          XXXXXXXXXXXX                  XXXX             XXX    XXXX          XXXXXXXXXXXX                  XXXX             XXX                  XXXXXXXXXXXXXXX   XXX  XXX   XXXXX             XXX                  XXXXXXXXXXXXXXX--------------XXXXX             XXX                  XXXXXXXXXXXXXXX---XXX--XXX---XXXXXXXX   XXXXXXXXXX                  XXXXXXXXXXXXXXX---XXX--XXX---XXXXXXXX---XXXXXXXXXX                  XXXXXXXXXXXXXXX---XXX--XXX---XXXXXXXX---XXXXXXXXXX                  XXXXXXXXXXXXXXX--------------XXXXXXXX---XXXXXXXXXX                  XXXXXXXXXXXXXXX   XXX  XXX   XXXXXXXX---XXXXXXXXXX                  XXXXXXX                       XXXXXXX   XXXXXXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX    XXXXXXXXXX    XXXXXXX                       XXXX          XXXXXX----XXXXXXXXXX----XXXXXXX                       XXXX          XXXXXX    XXXXXXXXXX    XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                   -----                        XXXX          XXXXXX                   -----                        XXXX          XXXXXX                  XXXXXXX                       XXXX          XXXXXX                  XXXXXXX                       XXXXXXXXXXXXXXXXXXXX                  XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                areas: [
                  {
                    id: "c3",
                    name: "C3",
                    idNum: 1,
                    price: 2000000000000,
                    locations: [
                      { x: 1, y: 1, x2: 15, y2: 19 },
                      { x: 16, y: 1, x2: 22, y2: 13 },
                    ],
                  },
                  { id: "c2", name: "C2", idNum: 2, price: 15000000000000, locations: [{ x: 1, y: 24, x2: 12, y2: 40 }] },
                  { id: "c1", name: "C1", idNum: 3, price: 7000000000000, locations: [{ x: 17, y: 31, x2: 36, y2: 41 }] },
                  { id: "c4", name: "C4", idNum: 4, price: 150000000000000, locations: [{ x: 42, y: 22, x2: 66, y2: 40 }] },
                  {
                    id: "c5",
                    name: "C5",
                    idNum: 5,
                    price: 60000000000000,
                    locations: [
                      { x: 47, y: 1, x2: 66, y2: 16 },
                      { x: 45, y: 1, x2: 46, y2: 11 },
                    ],
                  },
                ],
              },
              {
                id: "level4",
                idNum: 4,
                name: "Gigafactory",
                tilesX: 50,
                tilesY: 40,
                startX: 9,
                startY: 8,
                price: 1000000000000000,
                terrains: { G: "grass", X: "wall", ".": "road", " ": "floor" },
                buildableTerrains: { floor: true },
                terrainMap: "GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXGGGGGXX   X    X    X    X    X    X    X    X   XXGGGXX                                            XXGGX                                              XGGX                                              XGGX                                              XGGXX                                            XXGGX                                              XGGX                                              XGGX                                              XGGX                                              XGGXX                                            XXGGX                                              XGGX                                              XGGX                                              XGGX                                              XGGXX                                            XXGGX                XXX        XXX                XGGX                XGX        XGX                XGGX                XGX        XGX                XGGX                XXX        XXX                XGGXX                                            XXGGX                                              XGGX                                              XGGX                                              XGGX                                              XGGXX                                            XXGGX                                              XGGX                                              XGGX                                              XGGX                                              XGGXX                                            XXGGX                                              XGGX                                              XGGX                                              XGGXX                                            XXGGGXX   X    X    X    X    X    X    X    X   XXGGGGGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",
                buildMap: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX   X    X    X    X    X    X    X    X   XXXXXXX                                            XXXXX                                              XXXX                                              XXXX                                              XXXXX                                            XXXXX                                              XXXX                                              XXXX                                              XXXX                                              XXXXX                                            XXXXX                                              XXXX                                              XXXX                                              XXXX                                              XXXXX                                            XXXXX                XXX        XXX                XXXX                XXX        XXX                XXXX                XXX        XXX                XXXX                XXX        XXX                XXXXX                                            XXXXX                                              XXXX                                              XXXX                                              XXXX                                              XXXXX                                            XXXXX                                              XXXX                                              XXXX                                              XXXX                                              XXXXX                                            XXXXX                                              XXXX                                              XXXX                                              XXXXX                                            XXXXXXX   X    X    X    X    X    X    X    X   XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                areas: [],
              },
              {
                id: "level5",
                idNum: 5,
                name: "Terafactory",
                tilesX: 80,
                tilesY: 41,
                startX: 9,
                startY: 8,
                price: 1000000000000000000,
                terrains: { G: "grass", X: "wall", ".": "road", " ": "floor" },
                buildableTerrains: { floor: true },
                terrainMap: "XXXXXXXXXXXXXXXXXXXXXXXXXG.GGGGGGGGGGGGGGGGGGGGGGGGGG.GXXXXXXXXXXXXXXXXXXXXXXXXXX                       XG............................GX                       XX                       XG.GXXXXXXXXXX.XX.XXXXXXXXXXG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                        G.G                        G.G                        XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                        G.G                        G.G                        XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GX                       XX                       XG.GX                      XG.GXXXXXXXXXXXXXXXXXXXXXXXXG.GX                       XX                       XG.GGGGGGGGGGGGGGGGGGGGGGGGGG.GX                       XXXXXXXXXXXXXXXXXXXXXXXXXXG.GGGGGGGGGGGGGGGGGGGGGGGGGG.GXXXXXXXXXXXXXXXXXXXXXXXXX",
                buildMap: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                       XX                       XXXXXXXXXXXXXX-XX-XXXXXXXXXXXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                        ---                        ---                        XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                        ---                        ---                        XX                        ---                        ---                        XX                        ---                        ---                        XX                        ---                        ---                        XX                        ---                        ---                        XX                        ---                        ---                        XX                        ---                        ---                        XX                        ---                        ---                        XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                        ---                        ---                        XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXX                      XXXXX                       XX                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                       XX                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX                       XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                areas: [],
              }
            ],
        
        // Research configuration
        research: {
            efficiency: {
                id: "efficiency",
                name: "Efficiency Boost",
                description: "Improve factory efficiency by 25%",
                price: 100,
                priceResearchPoints: 50,
                max: 5,
                iconX: 0,
                iconY: 0
            },
            speed: {
                id: "speed",
                name: "Production Speed",
                description: "Increase production speed by 50%",
                price: 200,
                priceResearchPoints: 100,
                max: 3,
                iconX: 1,
                iconY: 0
            },
            profit: {
                id: "profit",
                name: "Profit Multiplier",
                description: "Double your profit margins",
                price: 500,
                priceResearchPoints: 250,
                max: 2,
                iconX: 2,
                iconY: 0
            }
        },
        
        // Components configuration
        componentsById: {
            noComponent: {
                id: "noComponent",
                name: "No Component",
                description: "Empty tile",
                iconX: 0,
                iconY: 0,
                buildByDragging: false
            },
            transportLine: {
                id: "transportLine",
                idNum: 1,
                name: "Conveyor",
                width: 1,
                height: 1,
                spriteX: 0,
                spriteY: 0,
                iconX: 1,
                iconY: 0,
                drawStrategy: "track",
                buildByDragging: true,
                canBuildToPartial: true,
                runningCostPerTick: 0,
                price: 10,
                priceRefund: 1,
                strategy: { type: "transport", queueSize: 2 }
            },
            ironBuyer: {
                id: "ironBuyer",
                idNum: 2,
                name: "Iron ore buyer",
                width: 2,
                height: 2,
                spriteX: 4,
                spriteY: 0,
                iconX: 2,
                iconY: 0,
                runningCostPerTick: 0,
                price: 50,
                priceRefund: 1,
                strategy: { type: "buyer", purchaseResources: { ironOre: { price: 0, amount: 1 } }, outputResourcesOrder: ["ironOre"], interval: 10 }
            },
            ironFoundry: {
                id: "ironFoundry",
                idNum: 3,
                name: "Iron foundry",
                width: 4,
                height: 2,
                spriteX: 0,
                spriteY: 0,
                iconX: 3,
                iconY: 0,
                runningCostPerTick: 0,
                price: 150,
                priceRefund: 1,
                requiresResearch: null,
                strategy: { type: "converter", inputResources: { ironOre: { perOutputResource: 2 } }, production: { iron: { amount: 1 } }, outputResourcesOrder: ["iron"], interval: 10 }
            },
            ironSeller: {
                id: "ironSeller",
                idNum: 4,
                name: "Iron seller",
                width: 1,
                height: 2,
                spriteX: 6,
                spriteY: 0,
                iconX: 4,
                iconY: 0,
                runningCostPerTick: 0,
                price: 100,
                priceRefund: 1,
                requiresResearch: null,
                strategy: { type: "seller", resources: { iron: { amount: 2, sellPrice: 2.5, sellMargin: 0 } }, interval: 10 }
            },
            coalBuyer: {
                id: "coalBuyer",
                idNum: 5,
                name: "Coal buyer",
                width: 2,
                height: 1,
                spriteX: 0,
                spriteY: 2,
                iconX: 5,
                iconY: 0,
                runningCostPerTick: 1,
                price: 1e3,
                priceRefund: 1,
                requiresResearch: "steelComponents",
                strategy: { type: "buyer", purchaseResources: { coal: { price: 5, amount: 2 } }, outputResourcesOrder: ["coal"], interval: 10 }
            },
            steelFoundry: {
                id: "steelFoundry",
                idNum: 6,
                name: "Steel foundry",
                width: 3,
                height: 3,
                spriteX: 0,
                spriteY: 3,
                iconX: 6,
                iconY: 0,
                runningCostPerTick: 4,
                price: 4e3,
                priceRefund: 1,
                requiresResearch: "steelComponents",
                strategy: { type: "converter", inputResources: { iron: { perOutputResource: 4 }, coal: { perOutputResource: 4 } }, production: { steel: { amount: 1 } }, outputResourcesOrder: ["steel"], interval: 10 }
            },
            steelSeller: {
                id: "steelSeller",
                idNum: 7,
                name: "Steel seller",
                width: 2,
                height: 2,
                spriteX: 3,
                spriteY: 3,
                iconX: 7,
                iconY: 0,
                runningCostPerTick: 1,
                price: 1500,
                priceRefund: 1,
                requiresResearch: "steelComponents",
                strategy: { type: "seller", resources: { steel: { amount: 2, sellPrice: 0, sellMargin: 0.6 } }, interval: 10 }
            },
            garbageCollector: {
                id: "garbageCollector",
                idNum: 25,
                name: "Garbage",
                description: "Accepts any item and discards it as garbage.",
                width: 1,
                height: 1,
                spriteX: 3,
                spriteY: 2,
                iconX: 2,
                iconY: 3,
                runningCostPerTick: 0,
                requiresResearch: "metalsLab",
                price: 2500,
                priceRefund: 0.5,
                strategy: { type: "garbage", max: 15, removeAmount: 5, interval: 10 }
            },
            sorterVertical: {
                id: "sorterVertical",
                idNum: 36,
                name: "Sorter",
                width: 1,
                height: 3,
                spriteX: 6,
                spriteY: 8,
                iconX: 7,
                iconY: 3,
                runningCostPerTick: 2,
                requiresResearch: "sorter",
                price: 4e5,
                priceRefund: 1,
                allowedInputs: { "0:1:left": true, "0:1:right": true },
                allowedOutputs: { "0:0": true, "0:1": true, "0:2": true },
                strategy: { type: "sorter", interval: 1 }
            },
            sorterHorizontal: {
                id: "sorterHorizontal",
                idNum: 37,
                name: "Sorter",
                width: 3,
                height: 1,
                spriteX: 3,
                spriteY: 8,
                iconX: 6,
                iconY: 3,
                runningCostPerTick: 2,
                requiresResearch: "sorter",
                price: 4e5,
                priceRefund: 1,
                allowedInputs: { "1:0:top": true, "1:0:bottom": true },
                allowedOutputs: { "0:0": true, "1:0": true, "2:0": true },
                strategy: { type: "sorter", interval: 1 }
            }
        },
        
        // Component selection layout
        componentsSelection: [
            ["noComponent", "transportLine", "garbageCollector", "sorterVertical", "sorterHorizontal"],
            ["ironBuyer", "ironFoundry", "ironSeller", null, "coalBuyer", "steelFoundry", "steelSeller"],
            ["oilBuyer", "gasBuyer", "plasticMaker", "plasticSeller", "siliconBuyer", "electronicsMaker", "electronicsSeller"],
            ["explosivesBuyer", "bulletMaker", "gunMaker", "gunSeller"],
            ["aluminiumBuyer", "engineMaker", "engineSeller"],
            ["tankHullMaker", "tankTurretMaker", "tankAssembler", "tankSeller", "dieselRefinery"],
            ["jetFuelRefinery", "rocketHullMaker", "rocketWarheadMaker", "rocketAssembler"],
            ["droneMaker", "droneControlRoom", "droneSeller"],
            ["metalsLab", "gasAndOilLab", "analystCenter", "qualityLab"],
            ["researchCenter", "researchCenter2", "researchCenter3", "researchCenter4"],
        ],
        
        // Resources configuration
        resourcesById: {
            money: {
                id: "money",
                name: "Money",
                nameShort: "$",
                idNum: 0
            },
            ironOre: {
                id: "ironOre",
                name: "Iron Ore",
                nameShort: "IronOre",
                idNum: 1
            },
            iron: {
                id: "iron",
                name: "Iron",
                nameShort: "Iron",
                idNum: 2
            },
            coal: {
                id: "coal",
                name: "Coal",
                nameShort: "Coal",
                idNum: 3
            },
            steel: {
                id: "steel",
                name: "Steel",
                nameShort: "Steel",
                idNum: 4
            },
            oil: {
                id: "oil",
                name: "Oil",
                nameShort: "Oil",
                idNum: 5
            },
            gas: {
                id: "gas",
                name: "Gas",
                nameShort: "Gas",
                idNum: 6
            },
            plastic: {
                id: "plastic",
                name: "Plastic",
                nameShort: "Plastic",
                idNum: 7
            },
            researchPoints: {
                id: "researchPoints",
                name: "Research Points",
                nameShort: "RP",
                idNum: 8
            }
        },
        
        // Upgrades configuration
        upgradesLayout: [
            {
                type: "group",
                name: "Production",
                iconX: 0,
                iconY: 0,
                items: ["efficiency", "speed", "_", "quality"]
            },
            {
                type: "break"
            },
            {
                type: "group",
                name: "Financial",
                iconX: 1,
                iconY: 0,
                items: ["profit", "discount", "_", "investment"]
            }
        ],
        
        // Mission configuration
        isMission: false,
        
        // Achievements configuration
        achievements: [
            {
                id: "firstFactory",
                name: "First Factory",
                description: "Build your first factory",
                icon: "🏭"
            },
            {
                id: "ironMaster",
                name: "Iron Master",
                description: "Produce 1000 iron",
                icon: "⚒️"
            },
            {
                id: "researchPioneer",
                name: "Research Pioneer",
                description: "Research your first technology",
                icon: "🔬"
            },
            {
                id: "upgradeEnthusiast",
                name: "Upgrade Enthusiast",
                description: "Purchase 5 upgrades",
                icon: "⚡"
            },
            {
                id: "efficiencyExpert",
                name: "Efficiency Expert",
                description: "Achieve 100% efficiency in any production line",
                icon: "📈"
            },
            {
                id: "wasteManager",
                name: "Waste Manager",
                description: "Handle waste production effectively",
                icon: "♻️"
            },
            {
                id: "conveyorMaster",
                name: "Conveyor Master",
                description: "Build a complex conveyor network",
                icon: "🔄"
            },
            {
                id: "profitKing",
                name: "Profit King",
                description: "Earn $10,000 in a single factory",
                icon: "💰"
            }
        ],
        
        // Resources configuration
        resourcesById: {
            iron: { id: "iron", name: "Iron", idNum: 1 },
            copper: { id: "copper", name: "Copper", idNum: 2 },
            gold: { id: "gold", name: "Gold", idNum: 3 },
            research: { id: "research", name: "Research", idNum: 4 }
        },
        
        resourcesByIdNum: {
            1: { id: "iron", name: "Iron" },
            2: { id: "copper", name: "Copper" },
            3: { id: "gold", name: "Gold" },
            4: { id: "research", name: "Research" }
        }
    };
    
    return meta;
});
