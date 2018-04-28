import {DirectiveToTagInfo, TransformOptions} from '../index';
import {ASTElement} from '../transformer/transform-template';
import searchNgAttr from './search-ng-attr';

export default function setReactTagName (el: ASTElement, {directivesToTags}: TransformOptions) {
    const {attribs, name} = el;
    const directiveToTagInfo: DirectiveToTagInfo = searchNgAttr(name, directivesToTags);

    if (directiveToTagInfo) {
        el.reactTagName = directiveToTagInfo.tagName;
        return;
    }

    for (const name in attribs) {
        if (Object.prototype.hasOwnProperty.call(attribs, name)) {
            const directiveToTagInfo: DirectiveToTagInfo = searchNgAttr(name, directivesToTags);

            if (directiveToTagInfo) {
                el.reactTagName = directiveToTagInfo.tagName;
                return;
            }
        }
    }
}