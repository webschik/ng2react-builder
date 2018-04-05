import {AST} from 'parse5/lib';
import {AngularLexer, AngularParser, Angular, initAngular} from '../angular';
import {DirectiveReplaceInfo, ReactComponentOptions} from '../index';
import {angularAttr2React, htmlAttr2React, reactInterpolation} from '../react';
import interpolate from './interpolate';
import searchNgAttr from './search-ng-attr';

const angular: Angular = initAngular();
const Serializer = require('parse5/lib/serializer/index');
const {NAMESPACES: NS, TAG_NAMES: $} = require('parse5/lib/common/html');
const ngAttrsOutputBlackList: string[] = [
    'ng-if',
    'ng-show',
    'ng-hide'
];

export default function serialize (
    fragment: AST.DocumentFragment,
    serializerOptions: {treeAdapter: AST.TreeAdapter},
    componentOptions: ReactComponentOptions
): string {
    const {replaceDirectives, angular: {interpolate: {bindOnce}}} = componentOptions;
    const serializer = new Serializer(fragment, serializerOptions);
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

        const isRootChild: boolean = Boolean(node.parent && node.parent.type === 'root');

        if (condition) {
            if (!isRootChild) {
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

        if (isRootChild && node.next) {
            this.html += ', \n';
        }
    };

    serializer._serializeAttributes = function (node: AST.HtmlParser2.Element) {
        const {attribs} = node;
        const filteredAttibs: {[key: string]: string} = {};
        const isRootChild: boolean = Boolean(node.parent && node.parent.type === 'root');

        if (isRootChild && node.parent.children[1]) {
            filteredAttibs.key = String(node.parent.children.indexOf(node));
        }

        for (const name in attribs) {
            if (Object.prototype.hasOwnProperty.call(attribs, name)) {
                const value: string = attribs[name];

                if (!ngAttrsOutputBlackList.includes(name)) {
                    let attrName: string = htmlAttr2React(name) || angularAttr2React(name) || name;

                    if (replaceDirectives) {
                        const directiveInfo: DirectiveReplaceInfo = searchNgAttr(name, replaceDirectives);

                        if (directiveInfo) {
                            if (value) {
                                attrName = directiveInfo.valueProp || 'value';
                            } else {
                                attrName = void 0;
                            }
                        }
                    }

                    if (attrName) {
                        filteredAttibs[attrName] = value;
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

            const interpolatedValue: string = value && interpolate(ngParser, value, componentOptions);
            const isEventHandlerAttr: boolean = /^on[A-Z][a-z]{3,}/.test(attr.name);

            // has interpolation or event handler
            if (value !== interpolatedValue || isEventHandlerAttr) {
                if (interpolatedValue) {
                    let attrValue: string = interpolatedValue
                        .trim()
                        .replace(bindOnce, '')
                        .replace(/;$/, '');

                    if (isEventHandlerAttr) {
                        attrValue = attrValue
                            .replace(/\(\)/g, '')
                            .replace(/([a-z])\(([^\)])/g, '$1.bind(null, $2');
                    }

                    this.html += '=';
                    const {startSymbol, endSymbol} = reactInterpolation;
                    const attrValueLastIndex: number = attrValue.length - 1;

                    if (
                        attrValue.indexOf(startSymbol) === 0 &&
                        attrValue.lastIndexOf(startSymbol) === 0 &&
                        attrValue.indexOf(endSymbol) === attrValueLastIndex &&
                        attrValue.lastIndexOf(endSymbol) === attrValueLastIndex
                    ) {
                        this.html += attrValue;
                    } else if (
                        attrValue.includes(reactInterpolation.startSymbol) &&
                        attrValue.includes(reactInterpolation.endSymbol)
                    ) {
                        this.html += '{`' + attrValue.replace(/\{/, '${') + '`}';
                    } else if (isEventHandlerAttr) {
                        this.html += reactInterpolation.startSymbol  + attrValue + reactInterpolation.endSymbol;
                    } else {
                        this.html += '"' + attrValue + '"';
                    }
                }
            } else {
                this.html += '="' + value + '"';
            }
        }
    };

    serializer._serializeTextNode = function (node: AST.HtmlParser2.TextNode) {
        const content: string = this.treeAdapter.getTextNodeContent(node);
        const parent: AST.HtmlParser2.TextNode = this.treeAdapter.getParentNode(node);
        let parentTn: string = void 0;

        if (parent && this.treeAdapter.isElementNode(parent)) {
            parentTn = this.treeAdapter.getTagName(parent);
        }

        if (parentTn === $.STYLE || parentTn === $.SCRIPT || parentTn === $.XMP || parentTn === $.IFRAME ||
            parentTn === $.NOEMBED || parentTn === $.NOFRAMES || parentTn === $.PLAINTEXT || parentTn === $.NOSCRIPT) {

            this.html += content;
        } else {
            const escapedContent: string = Serializer.escapeString(content, false);

            this.html += escapedContent && interpolate(ngParser, escapedContent, componentOptions) || '';
        }
    };

    serializer._serializeCommentNode = function (node: AST.HtmlParser2.TextNode) {
        this.html += '{/*' + this.treeAdapter.getCommentNodeContent(node) + '*/}';
    };

    return serializer.serialize();
}