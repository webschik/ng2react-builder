import {AST} from 'parse5';

export default function getNgIteratorStartAttr ({attribs}: AST.HtmlParser2.Element) {
    return attribs && (attribs['ng-repeat'] || attribs['ng-repeat-start']);
}