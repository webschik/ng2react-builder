import {AST} from 'parse5';
import getNgIteratorStartAttr from './get-ng-iterator-start-attr';
import hasNgIteratorEnd from './has-ng-iterator-end';

export default function getNgIteratorEndNode (node: AST.HtmlParser2.Element) {
    let openedIteratorsCount: number = 0;

    while (node) {
        // another iterator begins
        if (getNgIteratorStartAttr(node)) {
            openedIteratorsCount++;
        }

        // iterator ends
        if (hasNgIteratorEnd(node)) {
            openedIteratorsCount--;

            if (openedIteratorsCount < 1) {
                return node;
            }
        }

        node = node.next as AST.HtmlParser2.Element;
    }
}