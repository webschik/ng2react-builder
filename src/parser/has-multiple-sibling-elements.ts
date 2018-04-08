import {AST} from 'parse5';
import {ASTElement} from './serialize';

export default function hasMultipleSiblingElements ({parent}: ASTElement): boolean {
    return parent.children.filter((node: AST.HtmlParser2.Node) => node.type === 'tag')[1] !== undefined;
}