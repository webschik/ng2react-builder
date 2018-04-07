import {parseFragment, treeAdapters, AST} from 'parse5';
import {ComponentInfo, DirectiveReplaceInfo, ReactComponentOptions} from '../index';
import hasNextNonEmptyNode from './has-next-non-empty-node';
import ngToReactAttrs from './ng-to-react-attrs';
import searchNgAttr from './search-ng-attr';
import serialize from './serialize';

const defaultTreeAdapter: AST.TreeAdapter = treeAdapters.htmlparser2;
const {createElement, adoptAttributes, getTagName} = defaultTreeAdapter;

export default function parseTemplate (template: string, options: ReactComponentOptions): ComponentInfo {
    const {replaceDirectives} = options;
    const treeAdapter: AST.TreeAdapter = Object.assign({}, defaultTreeAdapter, {
        createElement (tagName: string, namespaceURI: string, attrs: AST.Default.Attribute[]) {
            return createElement.call(this, tagName, namespaceURI, ngToReactAttrs(attrs));
        },
        adoptAttributes (recipient: AST.Element, attrs: AST.Default.Attribute[]) {
            return adoptAttributes.call(this, recipient, ngToReactAttrs(attrs));
        }
    });
    const fragment: AST.HtmlParser2.DocumentFragment = parseFragment(template, {
        treeAdapter
    }) as AST.HtmlParser2.DocumentFragment;

    const output: string = serialize(fragment, {
        treeAdapter: Object.assign({}, treeAdapter, {
            getTagName (node: AST.HtmlParser2.Element) {
                const {attribs, name} = node;

                if (replaceDirectives) {
                    const directiveInfo: DirectiveReplaceInfo = searchNgAttr(name, replaceDirectives);

                    if (directiveInfo) {
                        return directiveInfo.tagName;
                    }

                    for (const name in attribs) {
                        if (Object.prototype.hasOwnProperty.call(attribs, name)) {
                            const directiveInfo: DirectiveReplaceInfo = searchNgAttr(name, replaceDirectives);

                            if (directiveInfo) {
                                return directiveInfo.tagName;
                            }
                        }
                    }
                }

                return getTagName.call(this, node);
            }
        })
    }, options);

    return {
        template: hasNextNonEmptyNode(fragment.children[0]) ? `[\n${ output }\n]` : `(\n${ output }\n)`
    };
}