import { Point, QuadTree } from "../QuadTree/QuadTree";

export class QuadTreeAStar {
    /**八方向寻路还是四方向寻路 */
    private eightOrFour = true;

    private quadTree: QuadTree;

    constructor(quadTree: QuadTree) {
        this.quadTree = quadTree;
    }

    public findPath(startX: number, startY: number, goalX: number, goalY: number): number[][] {
        const startNode = this._createNode(startX, startY, null);
        const goalNode = this._createNode(goalX, goalY, null);

        const openSet: AStarNode[] = [];
        const closedSet: AStarNode[] = [];

        openSet.push(startNode);

        while (openSet.length > 0) {
            const currentNode = this._getLowestFScoreNode(openSet);
            if (this._nodesEqual(currentNode, goalNode)) {
                return this._reconstructPath(currentNode);
            }

            openSet.splice(openSet.indexOf(currentNode), 1);
            closedSet.push(currentNode);

            const neighbors = this._getNeighborNodes(currentNode);
            for (const neighbor of neighbors) {
                if (!neighbor) {
                    continue;
                }
                if (closedSet.some((node) => this._nodesEqual(node, neighbor))) {
                    continue;
                }

                const gScore = currentNode.gScore + this._calculateDistance(currentNode, neighbor);
                const hScore = this._calculateDistance(neighbor, goalNode);
                const fScore = gScore + hScore;

                const openSetNode = openSet.find((node) => this._nodesEqual(node, neighbor));
                if (!openSetNode) {
                    neighbor.gScore = gScore;
                    neighbor.hScore = hScore;
                    neighbor.fScore = fScore;
                    neighbor.parent = currentNode;
                    openSet.push(neighbor);
                } else if (gScore < openSetNode.gScore) {
                    openSetNode.gScore = gScore;
                    openSetNode.hScore = hScore;
                    openSetNode.fScore = fScore;
                    openSetNode.parent = currentNode;
                }
            }
        }

        return [];
    }

    private _createNode(x: number, y: number, parent: AStarNode | null): AStarNode {
        const data = this.quadTree.root.query(x, y);
        return {
            x,
            y,
            parent,
            gScore: 0,
            hScore: 0,
            fScore: 0,
        };
    }
    private _getLowestFScoreNode(nodes: AStarNode[]): AStarNode {
        let lowestFScoreNode = nodes[0];
        for (const node of nodes) {
            if (node.fScore < lowestFScoreNode.fScore) {
                lowestFScoreNode = node;
            }
        }
        return lowestFScoreNode;
    }

    private _nodesEqual(nodeA: AStarNode, nodeB: AStarNode): boolean {
        return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
    }

    private _calculateDistance(nodeA: AStarNode, nodeB: AStarNode): number {
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private _getNeighborNodes(node: AStarNode): AStarNode[] {
        // Add neighboring nodes based on your specific movement rules
        const neighbors: AStarNode[] = [];
        let directions;
        if (this.eightOrFour) {
            directions = [
                { dx: -1, dy: 0 }, // Left
                { dx: 1, dy: 0 }, // Right
                { dx: 0, dy: -1 }, // Up
                { dx: 0, dy: 1 }, // Down
                { dx: -1, dy: -1 }, //left up
                { dx: 1, dy: -1 }, //right up
                { dx: -1, dy: 1 }, //left down
                { dx: 1, dy: 1 }, // right down
            ];
        } else {
            directions = [
                { dx: -1, dy: 0 }, // Left
                { dx: 1, dy: 0 }, // Right
                { dx: 0, dy: -1 }, // Up
                { dx: 0, dy: 1 }, // Down
            ];
        }

        for (const direction of directions) {
            const neighborX = node.x + direction.dx;
            const neighborY = node.y + direction.dy;
            const neighborData = this.quadTree.query(neighborX, neighborY);
            let neighborNode: AStarNode;
            if (!neighborData) {
                neighborNode = null;
            } else {
                neighborNode =  {
                    x: neighborX,
                    y: neighborY,
                    parent: null,
                    gScore: 0,
                    hScore: 0,
                    fScore: 0,
                };
            }

            neighbors.push(neighborNode);
        }
        return neighbors;
    }

    private _reconstructPath(node: AStarNode): number[][] {
        const path: number[][] = [];
        let currentNode: AStarNode | null = node;

        while (currentNode !== null) {
            path.unshift([currentNode.x, currentNode.y]);
            currentNode = currentNode.parent;
        }

        return path;
    }
}
interface AStarNode {
    x: number;
    y: number;
    parent: AStarNode | null;
    gScore: number;
    hScore: number;
    fScore: number;
}
