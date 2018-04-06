import {AST} from 'parse5';
import hasNgIteratorEnd from './has-ng-iterator-end';

export default function isNgIteratorChild (node: AST.HtmlParser2.Element): boolean {
    while (node) {
        const hasIteratorEnd: boolean = hasNgIteratorEnd(node);

        if (hasIteratorEnd) {
            return true;
        }

        node = node.next as AST.HtmlParser2.Element;
    }

    return false;
}