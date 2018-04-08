import {AST} from 'parse5';

export default function hasMultipleSiblingElements (node: AST.HtmlParser2.Node): boolean {
    let elementsCount: number = 0;

    while (node) {
        if (node.type === 'tag') {
            elementsCount++;
        }

        if (elementsCount > 1) {
            return true;
        }

        node = node.next;
    }

    return false;
}