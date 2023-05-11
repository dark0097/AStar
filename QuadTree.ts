enum NodeType {
    LEAF_NODE = "leaf",
    INTERNAL_NODE = "internal",
}

export interface Point {
    x: number;
    y: number;
}

/**四叉树节点 */
class QuadTreeNode {
    x: number;
    y: number;
    width: number;
    height: number;
    type: NodeType;
    parent: QuadTreeNode | null = null;
    children: QuadTreeNode[] = [];
    value: Array<Point> = [];

    constructor(x: number, y: number, width: number, height: number, type: NodeType = NodeType.LEAF_NODE) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.parent = null;
        this.children = [null, null, null, null];
        this.value = [];
    }

    public query(x: number, y: number): Array<Point> {
        if (this.type == NodeType.LEAF_NODE) {
            return this.value;
        } else {
            const index = QuadTree._getQuadrantIndex(this, x, y);
            const childNode = this.children[index];
            if (childNode) {
                return childNode.query(x, y);
            }
        }

        return [];
    }

    public remove(x: number, y: number): void {
        if (this.type == NodeType.LEAF_NODE) {
            if (this.x === x && this.y === y) {
                this.value = null;
            }
        } else {
            const index = QuadTree._getQuadrantIndex(this, x, y);
            const childNode = this.children[index];
            if (childNode) {
                childNode.remove(x, y);
            }
        }
    }

    public print(): void {
        console.log(`Node at (${this.x}, ${this.y}) - Data: ${JSON.stringify(this.value)}`);

        if (this.type == NodeType.INTERNAL_NODE) {
            for (const childNode of this.children) {
                if (childNode) {
                    childNode.print();
                }
            }
        }
    }
}

/**四叉树数据结构，数据结构有多种使用方式，
 * 1 插入所有方格数据，每格自定义内容
 * 2 只插入需要用的格子，查询不到返回空 - 小农地块建立经过修改常用为40~60的索引的40*40地块，避免无效，使用该种
 * 3 插入自定义数据节点支持更多操作
 * 4 纯粹的数据数据结构，每一层的数据不确定
 */
export class QuadTree {
    root: QuadTreeNode;

    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.root = new QuadTreeNode(x, y, width, height);
    }

    /**插入叶子节点 */
    insertNode(x: number, y: number, data: any = null) {
        if (!this.query(x, y)) {
            //检查是否已经插入这个数据
            this._insertNode(this.root, x, y, data);
        }
    }

    private _insertNode(node: QuadTreeNode, x: number, y: number, data: any = null) {
        if (node.type == NodeType.INTERNAL_NODE) {
            //不是叶子节点
            const index = QuadTree._getQuadrantIndex(node, x, y);
            this._insertNode(node.children[index], x, y, data);
        } else {
            //叶子节点
            if (node.value.length < 4) {
                node.value.push(data);
            } else {
                this._splitLeafNode(node);
                const index = QuadTree._getQuadrantIndex(node, x, y);
                this._insertNode(node.children[index], x, y, data);
            }
        }
    }

    public static _getQuadrantIndex(node: QuadTreeNode, x: number, y: number): number {
        const midX = node.x + node.width / 2;
        const midY = node.y + node.height / 2;

        if (x <= midX) {
            if (y <= midY) {
                return 0;
            } else {
                return 2;
            }
        } else {
            if (y <= midY) {
                return 1;
            } else {
                return 3;
            }
        }
    }

    /**拆分节点 */
    private _splitLeafNode(node: QuadTreeNode): void {
        const nodeWidth = node.width / 2;
        const nodeHeight = node.height / 2;

        const { x, y } = node;

        node.children[0] = new QuadTreeNode(x, y, nodeWidth, nodeHeight);
        node.children[1] = new QuadTreeNode(x + nodeWidth, y, nodeWidth, nodeHeight);
        node.children[2] = new QuadTreeNode(x, y + nodeHeight, nodeWidth, nodeHeight);
        node.children[3] = new QuadTreeNode(x + nodeWidth, y + nodeHeight, nodeWidth, nodeHeight);
        node.children[0].parent = node;
        node.children[1].parent = node;
        node.children[2].parent = node;
        node.children[3].parent = node;

        for (const leafData of node.value) {
            const { x: leafX, y: leafY } = leafData;
            const index = QuadTree._getQuadrantIndex(node, leafX, leafY);
            const childNode = node.children[index];
            this._insertNode(childNode, leafX, leafY, leafData);
        }

        node.value = [];
        node.type = NodeType.INTERNAL_NODE;
    }

    public query(x: number, y: number): boolean {
        let ret = this.root.query(x, y);
        for (let data of ret) {
            if (data.x == x && data.y == y) {
                return true;
            }
        }
        return false;
    }
}
