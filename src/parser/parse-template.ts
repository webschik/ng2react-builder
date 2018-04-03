import {parseFragment, treeAdapters, AST} from 'parse5';
import {Angular, AngularLexer, AngularParser, ComponentInfo, ComponentMethod, ReactComponentOptions} from '../index';
import isNgInterpolation from './is-ng-interpolation';
import ngToReactAttrs from './ng-to-react-attrs';
import parseNgExpression from './parse-ng-expression';
import searchNgAttr from './search-ng-attr';

const Serializer = require('parse5/lib/serializer/index');
const {NAMESPACES: NS, TAG_NAMES: $} = require('parse5/lib/common/html');
const defaultTreeAdapter: AST.TreeAdapter = treeAdapters.htmlparser2;
const {createElement, adoptAttributes, getTagName} = defaultTreeAdapter;
const ngAttrsOutputBlackList: string[] = [
    'ng-if',
    'ng-show',
    'ng-hide'
];

export default function parseTemplate (
    angular: Angular,
    template: string,
    options: ReactComponentOptions
): ComponentInfo {
    const {replaceDirectives} = options;
    const methods: ComponentMethod[] = [];
    const lexer: AngularLexer = new angular.Lexer({
        csp: false,
        expensiveChecks: false
    });
    const ngParser: AngularParser = new angular.AST(lexer, {
        literals: {
            true: true,
            false: false,
            null: null,
            undefined
        }
    });
    const treeAdapter: AST.TreeAdapter = Object.assign({}, defaultTreeAdapter, {
        createElement (tagName: string, namespaceURI: string, attrs: AST.Default.Attribute[]) {
            return createElement.call(this, tagName, namespaceURI, ngToReactAttrs(attrs));
        },
        adoptAttributes (recipient: AST.Element, attrs: AST.Default.Attribute[]) {
            return adoptAttributes.call(this, recipient, ngToReactAttrs(attrs));
        }
    });
    const fragment: AST.DocumentFragment = parseFragment(template, {
        treeAdapter
    });
    const serializer = new Serializer(fragment, {
        treeAdapter: Object.assign({}, treeAdapter, {
            getTagName (node: AST.HtmlParser2.Element) {
                const {attribs, name} = node;

                if (replaceDirectives) {
                    const tagName: string = searchNgAttr(name, replaceDirectives);

                    if (tagName) {
                        return tagName;
                    }

                    for (const name in attribs) {
                        if (Object.prototype.hasOwnProperty.call(attribs, name)) {
                            const tagName: string = searchNgAttr(name, replaceDirectives);

                            if (tagName) {
                                return tagName;
                            }
                        }
                    }
                }

                return getTagName.call(this, node);
            }
        })
    });

    serializer._serializeElement = function (node: AST.HtmlParser2.Element) {
        let condition: string = '';
        let isConditionWrapped: boolean = false;
        const {attribs} = node;

        for (const name in attribs) {
            if (Object.prototype.hasOwnProperty.call(attribs, name)) {
                const value: string = attribs[name];

                switch (name) {
                    case 'ng-if':
                    case 'ng-show':
                        condition += condition ? ` && ${ value }` : value;
                        break;
                    case 'ng-hide':
                        condition += condition ? ` && !${ value }` : `!${ value }`;
                        break;
                    default:
                        //
                }
            }
        }

        if (condition) {
            if (this.html) {
                isConditionWrapped = true;
                this.html += '{';
            }

            this.html += `${ condition } ? (`;
        }

        const tn: string = this.treeAdapter.getTagName(node);
        const ns: string = this.treeAdapter.getNamespaceURI(node);

        this.html += '<' + tn;
        this._serializeAttributes(node);
        const childNodesHolder = tn === $.TEMPLATE && ns === NS.HTML ?
            this.treeAdapter.getTemplateContent(node) :
            node;
        const childNodes: AST.Node[] = this.treeAdapter.getChildNodes(childNodesHolder);

        // make all empty tags self-closed in JSX
        if (childNodes[0]) {
            this.html += '>';
            this._serializeChildNodes(childNodesHolder);
            this.html += '</' + tn + '>';
        } else {
            this.html += '/>';
        }

        if (condition) {
            this.html += `) : null${ isConditionWrapped ? '}' : ''}`;
        }
    };

    serializer._serializeAttributes = function (node: AST.HtmlParser2.Element) {
        const {attribs} = node;
        const filteredAttibs: {[key: string]: string} = {};

        for (const name in attribs) {
            if (Object.prototype.hasOwnProperty.call(attribs, name)) {
                const value: string = attribs[name];

                switch (name) {
                    case 'class':
                        filteredAttibs.className = value;
                        break;
                    case 'for':
                        filteredAttibs.htmlFor = value;
                        break;
                    case 'ng-click':
                        filteredAttibs.onClick = parseNgExpression(ngParser, value);
                        break;
                    default:
                        if (
                            !ngAttrsOutputBlackList.includes(name) &&
                            (!replaceDirectives || !searchNgAttr(name, replaceDirectives))
                        ) {
                            if (isNgInterpolation(value)) {
                                filteredAttibs[name] = parseNgExpression(ngParser, value);
                            } else {
                                filteredAttibs[name] = value;
                            }
                        }
                }
            }
        }

        node.attribs = filteredAttibs;
        const attrs: AST.Default.Attribute[] = this.treeAdapter.getAttrList(node);

        for (let i = 0, attrsLength = attrs.length; i < attrsLength; i++) {
            const attr: AST.Default.Attribute = attrs[i];
            const value: string = Serializer.escapeString(attr.value, true);

            this.html += ' ';

            if (!attr.namespace) {
                this.html += attr.name;
            } else if (attr.namespace === NS.XML) {
                this.html += 'xml:' + attr.name;
            } else if (attr.namespace === NS.XMLNS) {
                if (attr.name !== 'xmlns') {
                    this.html += 'xmlns:';
                }

                this.html += attr.name;
            } else if (attr.namespace === NS.XLINK) {
                this.html += 'xlink:' + attr.name;
            } else {
                this.html += attr.namespace + ':' + attr.name;
            }

            // it's interpolation or event handler
            if (isNgInterpolation(attribs[attr.name]) || /^on[A-Z][a-z]/.test(attr.name)) {
                this.html += '={' + value + '}';
            } else {
                this.html += '="' + value + '"';
            }
        }
    };

    return {
        template: serializer.serialize(),
        methods
    };
}