import {AST} from 'parse5/lib';
import {AngularLexer, AngularParser, Angular, initAngular} from '../angular';
import {AngularInterpolateOptions, DirectiveReplaceInfo, ReactComponentOptions} from '../index';
import {angularAttr2React, htmlAttr2React, reactInterpolation} from '../react';
import cleanNgAttrExpression from './clean-ng-attr-expression';
import getNgIteratorEndNode from './get-ng-iterator-end-node';
import getNgIteratorStartAttr from './get-ng-iterator-start-attr';
import hasMultipleSiblingElements from './has-multiple-sibling-elements';
import interpolate from './interpolate';
import parseNgIterator from './parse-ng-iterator';
import searchNgAttr from './search-ng-attr';
import stringifyNgExpression from './stringify-ng-expression';

const angular: Angular = initAngular();
const Serializer = require('parse5/lib/serializer/index');
const {NAMESPACES: NS, TAG_NAMES: $} = require('parse5/lib/common/html');
const ngAttrsOutputBlackList: string[] = [
    'ng-if',
    'ng-show',
    'ng-hide',
    'ng-repeat',
    'ng-repeat-start',
    'ng-repeat-end'
];

export interface ASTElement extends AST.HtmlParser2.Element {
    htmlEnd?: string;
}

interface ASTSerializer {
    isOpenedIterator?: boolean;
    [key: string]: any;
}

export default function serialize (
    fragment: AST.DocumentFragment,
    serializerOptions: {treeAdapter: AST.TreeAdapter},
    componentOptions: ReactComponentOptions
): string {
    const {replaceDirectives, react} = componentOptions;
    const serializer: ASTSerializer = new Serializer(fragment, serializerOptions);
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
    const ngInterpolateOptions: AngularInterpolateOptions =
        componentOptions.angular.interpolate as AngularInterpolateOptions;

    serializer._serializeElement = function (node: ASTElement) {
        let condition: string = '';
        const {attribs} = node;

        for (const name in attribs) {
            if (Object.prototype.hasOwnProperty.call(attribs, name)) {
                const value: string = attribs[name];

                switch (name) {
                    case 'ng-if':
                    case 'ng-show':
                    case 'ng-hide':
                        let attrValue: string = cleanNgAttrExpression(value, ngInterpolateOptions);

                        if (name === 'ng-hide') {
                            attrValue = `!${ attrValue }`;
                        }

                        condition += condition ? ` && ${ attrValue }` : attrValue;
                        break;
                    default:
                    //
                }
            }
        }

        const parent: ASTElement = node.parent as ASTElement;
        const isRootChild: boolean = parent.type === 'root';
        const iteratorStartAttr: string = getNgIteratorStartAttr(node);
        const hasInterpolateWrapper: boolean =
            !isRootChild &&
            !getNgIteratorStartAttr(parent) &&
            !node.htmlEnd;

        this.isOpenedIterator = false;

        if (iteratorStartAttr) {
            const {
                aliasAs,
                collectionIdentifier,
                collectionTransform,
                valueIdentifier
            } = parseNgIterator(iteratorStartAttr);
            const iteratorEndNode: ASTElement = getNgIteratorEndNode(node);

            if (!iteratorEndNode) {
                throw new Error('Missing iterator closing node: ng-repeat-end');
            }

            this.isOpenedIterator = node !== iteratorEndNode;

            this.html += `
                ${ hasInterpolateWrapper ? reactInterpolation.startSymbol : ''}
                ${ condition ? `${ condition } ? (` : ''}
                ${ collectionIdentifier }
                    ${ collectionTransform.join('') }
                    .map((
                        ${ valueIdentifier },
                        index${ react.typescript ? ': number' : ''}
                        ${ aliasAs ? `, ${ aliasAs }` : '' }
                    ) => ${ reactInterpolation.startSymbol }return ${ this.isOpenedIterator ? '[' : '(' }
            `.trim();

            iteratorEndNode.htmlEnd = `
                ${ this.isOpenedIterator ? ']' : ')' }
                ${ reactInterpolation.endSymbol })
                ${ condition ? ') : null' : '' }
                ${ hasInterpolateWrapper ? reactInterpolation.endSymbol : '' }
            `.trim();
        } else if (condition) {
            this.html += `${ hasInterpolateWrapper ? reactInterpolation.startSymbol : ''}${ condition } ? (`;
            node.htmlEnd = `
                ) : null${ hasInterpolateWrapper ? reactInterpolation.endSymbol : ''}
                ${ node.htmlEnd || ''}
            `.trim();
        }

        const tn: string = this.treeAdapter.getTagName(node);
        const ns: string = this.treeAdapter.getNamespaceURI(node);
        const hasNextElementsSeparator: boolean = (
            isRootChild || this.isOpenedIterator
        ) && hasMultipleSiblingElements(node);
        let key: string = '';
        let isTemplateLiteralKey: boolean;
        this.html += '<' + tn;

        if (this.isOpenedIterator || iteratorStartAttr) {
            key += 'item-${ index }';
            isTemplateLiteralKey = true;
        }

        if (hasNextElementsSeparator) {
            key += `child-${ parent.children.indexOf(node) }`;
        }

        if (key) {
            this.html += isTemplateLiteralKey ? ` key={\`${ key }\`}` : ` key="${ key }"`;
        }

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

        this.html += node.htmlEnd || '';
        node.htmlEnd = void 0;

        if (hasNextElementsSeparator) {
            this.html += ',';
        }
    };

    serializer._serializeAttributes = function (node: ASTElement) {
        const {attribs} = node;
        const filteredAttibs: {[key: string]: string} = {};

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

            let reactAttrValue: string;

            this.html += '=';

            if (attr.name === 'dangerouslySetInnerHTML') {
                reactAttrValue = reactInterpolation.startSymbol +
                    (value ? `{__html: ${
                        stringifyNgExpression(ngParser, cleanNgAttrExpression(value, ngInterpolateOptions))
                    }}` : '') +
                    reactInterpolation.endSymbol;
            } else {
                const interpolatedValue: string = value && interpolate(ngParser, value, componentOptions);
                const isEventHandlerAttr: boolean = /^on[A-Z][a-z]{3,}/.test(attr.name);

                // has interpolation or event handler
                if (value !== interpolatedValue || isEventHandlerAttr) {
                    if (interpolatedValue) {
                        let attrValue: string = cleanNgAttrExpression(interpolatedValue, ngInterpolateOptions);

                        if (isEventHandlerAttr) {
                            attrValue = attrValue
                                .replace(/\(\)/g, '')
                                .replace(/([a-z])\(([^\)])/g, '$1.bind(null, $2');
                        }

                        const {startSymbol, endSymbol} = reactInterpolation;
                        const attrValueLastIndex: number = attrValue.length - 1;

                        if (
                            attrValue.indexOf(startSymbol) === 0 &&
                            attrValue.lastIndexOf(startSymbol) === 0 &&
                            attrValue.indexOf(endSymbol) === attrValueLastIndex &&
                            attrValue.lastIndexOf(endSymbol) === attrValueLastIndex
                        ) {
                            reactAttrValue = attrValue;
                        } else if (attrValue.includes(startSymbol) && attrValue.includes(endSymbol)) {
                            reactAttrValue =
                                `${ startSymbol }\`` +
                                attrValue.replace(new RegExp(`\\${ startSymbol }`, 'g'), '${') +
                                `\`${ endSymbol }`;
                        } else if (isEventHandlerAttr) {
                            reactAttrValue = startSymbol + attrValue + endSymbol;
                        } else {
                            reactAttrValue = `"${ attrValue }"`;
                        }
                    }
                } else {
                    reactAttrValue = `"${ interpolatedValue }"`;
                }
            }

            this.html += reactAttrValue;
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