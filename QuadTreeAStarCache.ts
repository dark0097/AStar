/*
 * @Author: daiqi
 * @Date: 2023-05-09 15:00:39
 * @Last Modified by: daiqi
 * @Last Modified time: 2023-05-09 15:59:33
 */
import { AppMain } from "../../A_ModuleManager/AppMain";
import { m } from "../../A_ModuleManager/ModuleMap";
import { QuadTree } from "../QuadTree/QuadTree";
import { QuadTreeAStar } from "./QuadTreeAstar";

/**寻路缓存器-山头地块数据处理-基类 */
export class QuadTreeAStarCache {
    private QuadTreeAStar: QuadTreeAStar;
    private QuadTree: QuadTree;

    constructor(width, height) {
        if (!this.QuadTreeAStar) {
            this.QuadTree = new QuadTree(0, 0, width, height);
            this.QuadTreeAStar = new QuadTreeAStar(this.QuadTree);
        }
    }

    /**设置可以行走和不可以行走的格子 */
    public setWalk(x, y, canWalk: boolean = true) {
        this.QuadTree.insertNode(x, y, { x: x, y: y });
    }

    /**对真实寻路的封装，判断是否有可用的缓存路径等 */
    finPath(startPoint, endPoint) {
        // this.QuadTree.root.print();
        let backPath = this.QuadTreeAStar.findPath(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        return { ret: true, path: backPath };
    }

    public static debug_draw() {
        let curScene = m.INFO.getCurrScene();

        let gra: cc.Graphics = curScene.CURVIEW._debug_layer.getComponent(cc.Graphics);
        if (!gra) {
            gra = curScene.CURVIEW._debug_layer.addComponent(cc.Graphics);
            gra.lineWidth = 5;
            gra.strokeColor = cc.Color.BLACK;
        }

        let check_fun = (x, y) => {
            if (curScene.CURDATA.obstruct.includes(x + "|" + y)) {
                //有障碍物
                return false;
            } else if (!curScene.CURDATA.checkTileUnlock({ x: x, y: y })) {
                //未解锁
                return false;
            }
            return true;
        };

        for (let x = 0; x < 60; x++) {
            for (let y = 0; y < 60; y++) {
                let pos = curScene.CURVIEW.getTileToPos({ x: x, y: y });
                pos.y += 36;
                let debug_node = new cc.Node(x + "_" + y);
                let label_com = debug_node.addComponent(cc.Label);
                label_com.string = x + "_" + y;
                label_com.fontSize = 20;
                debug_node.color = check_fun(x, y) ? cc.Color.GREEN : cc.Color.RED;
                label_com.cacheMode = cc.Label.CacheMode.CHAR;
                curScene.CURVIEW._debug_layer.addChild(debug_node);
                debug_node.setPosition(pos);

                gra.moveTo(pos.x, pos.y - 36);
                gra.lineTo(pos.x + 72, pos.y);
                gra.stroke();
                gra.moveTo(pos.x + 72, pos.y);
                gra.lineTo(pos.x, pos.y + 36);
                gra.stroke();
                gra.moveTo(pos.x, pos.y + 36);
                gra.lineTo(pos.x - 72, pos.y);
                gra.stroke();
                gra.moveTo(pos.x - 72, pos.y);
                gra.lineTo(pos.x, pos.y - 36);
                gra.stroke();
            }
        }
    }
}
declare global {
    interface IModuleMap {
        /**地块节点组 */
        QuadTreeAStarCache: typeof QuadTreeAStarCache;
    }
}
AppMain.app.loadModule(QuadTreeAStarCache, "QuadTreeAStarCache");
