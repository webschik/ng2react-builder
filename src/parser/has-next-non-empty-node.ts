import {AST} from 'parse5';

export default function hasNextNonEmptyNode (node: AST.HtmlParser2.Node): boolean {
    let next: AST.HtmlParser2.Node = node && node.next;

    while (next) {
        if (next.type === 'tag') {
            return true;
        }

        if (next.type === 'text') {
            const {data} = next as AST.HtmlParser2.TextNode;

            if (data && data.trim()) {
                return true;
            }
        }

        next = next.next;
    }

    return false;
}