import {AST} from 'parse5';

export default function hasNgIteratorEnd ({attribs}: AST.HtmlParser2.Element): boolean {
    return Boolean(attribs && (attribs['ng-repeat'] || ('ng-repeat-end' in attribs)));
}