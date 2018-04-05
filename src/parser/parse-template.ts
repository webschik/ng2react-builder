import {parseFragment, treeAdapters, AST} from 'parse5';
import {ComponentInfo, ComponentMethod, DirectiveReplaceInfo, ReactComponentOptions} from '../index';
import ngToReactAttrs from './ng-to-react-attrs';
import searchNgAttr from './search-ng-attr';
import serialize from './serialize';

const defaultTreeAdapter: AST.TreeAdapter = treeAdapters.htmlparser2;
const {createElement, adoptAttributes, getTagName} = defaultTreeAdapter;

export default function parseTemplate (template: string, options: ReactComponentOptions): ComponentInfo {
    const {replaceDirectives} = options;
    const methods: ComponentMethod[] = [];
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
    const children: AST.HtmlParser2.Node[] = fragment.children.filter((node: AST.HtmlParser2.Node) => {
        if (node.type === 'text') {
            const {data} = node as AST.HtmlParser2.TextNode;

            return Boolean(data && data.trim());
        }

        return true;
    });

    children.forEach((node: AST.HtmlParser2.Node, index: number, children: AST.HtmlParser2.Node[]) => {
        node.prev = children[index - 1];
        node.next = children[index + 1];
    });

    fragment.children = children;
    fragment.childNodes = children;

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
        template: fragment.children[1] ? `[\n${ output }\n]` : `(\n${ output }\n)`,
        methods
    };
}