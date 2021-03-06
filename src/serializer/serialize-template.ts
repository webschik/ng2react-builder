import {AST} from 'parse5/lib';
import {AngularLexer, AngularParser, Angular, initAngular} from '../angular';
import {AngularInterpolateOptions, TransformOptions} from '../index';
import {ASTElement} from '../transformer/transform-template';
import {htmlAttr2React, htmlBooleanAttribute, htmlNumericAttributes, reactInterpolation} from '../react';
import cleanNgAttrExpression from './clean-ng-attr-expression';
import hasMultipleSiblingElements from '../parser/has-multiple-sibling-elements';
import interpolate from './interpolate';
import stringifyNgExpression from './stringify-ng-expression';

const angular: Angular = initAngular();
const Serializer = require('parse5/lib/serializer/index');
const {NAMESPACES: NS, TAG_NAMES: $} = require('parse5/lib/common/html');
const ngEventPattern: RegExp = /\$event/g;
const doubleQuote: string = '"';

interface ASTSerializer {
    [key: string]: any;
}

function wrapAttrValue (attrValue: string) {
    if (attrValue[0] === doubleQuote && attrValue.slice(-1) === doubleQuote) {
        return attrValue;
    }

    return doubleQuote + Serializer.escapeString(attrValue, true) + doubleQuote;
}

export default function serializeTemplate (
    fragment: AST.HtmlParser2.DocumentFragment,
    serializerOptions: {treeAdapter: AST.TreeAdapter},
    transformOptions: TransformOptions
): string {
    const {react} = transformOptions;
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
        transformOptions.angular.interpolate as AngularInterpolateOptions;

    if (hasMultipleSiblingElements(fragment.firstChild)) {
        (fragment as any).openedElementGroupsCount = 1;
    }

    serializer._serializeElement = function (node: ASTElement) {
        const {condition} = node;
        const parent: ASTElement = node.parent as ASTElement;
        const isRootChild: boolean = parent.type === 'root';
        const hasInterpolateWrapper: boolean =
            !isRootChild &&
            !node.htmlEnd &&
            !parent.openedElementGroupsCount;

        if (node.iteratorInfo) {
            const {isGroupIterator} = node;
            const {
                aliasAs,
                collectionIdentifier,
                collectionTransform,
                valueIdentifier
            } = node.iteratorInfo;
            let iteratorEndNode: ASTElement;
            let iteratorNode: ASTElement = node;
            let openedIteratorsCount: number = 0;

            while (iteratorNode) {
                if (iteratorNode.iteratorInfo) {
                    openedIteratorsCount++;
                }

                if (openedIteratorsCount) {
                    iteratorNode.isIteratorChild = true;
                }

                if (iteratorNode.isIteratorEnd) {
                    openedIteratorsCount--;
                }

                if (!openedIteratorsCount) {
                    iteratorEndNode = iteratorNode;
                    break;
                }

                iteratorNode = iteratorNode.next as ASTElement;
            }

            if (!iteratorEndNode) {
                throw new Error('Missing iterator closing node: ng-repeat-end');
            }

            if (isGroupIterator) {
                parent.openedElementGroupsCount = (parent.openedElementGroupsCount || 0) + 1;
            }

            this.html += `
                ${ hasInterpolateWrapper ? reactInterpolation.startSymbol : ''}
                ${ condition ? `${ condition } ? (` : ''}
                ${ collectionIdentifier }
                    ${ collectionTransform.join('') }
                    .map((
                        ${ valueIdentifier },
                        index${ react.typescript ? ': number' : ''}
                        ${ aliasAs ? `, ${ aliasAs }` : '' }
                    ) => ${ reactInterpolation.startSymbol }return ${ isGroupIterator ? '[' : '(' }
            `.trim();

            iteratorEndNode.htmlEnd = `
                ${ isGroupIterator ? ']' : ')' }
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
        let key: string = '';

        this.html += '<' + tn;

        if (node.isIteratorChild) {
            key += 'item-${ index }';
        }

        if (parent.openedElementGroupsCount) {
            key += `child-${ parent.children.indexOf(node) }`;
        }

        if (key) {
            this.html += key.includes('${') ?
                ` key={\`${ key }\`}` :
                ` key=${ doubleQuote }${ key }${ doubleQuote} `;
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

        if (parent.openedElementGroupsCount) {
            this.html += ',';
        }

        if (node.isIteratorEnd && !node.iteratorInfo && parent.openedElementGroupsCount) {
            parent.openedElementGroupsCount--;
        }
    };

    serializer._serializeAttributes = function (node: ASTElement) {
        const attrs: AST.Default.Attribute[] = this.treeAdapter.getAttrList(node);

        for (let i = 0, attrsLength = attrs.length; i < attrsLength; i++) {
            const attr: AST.Default.Attribute = attrs[i];
            let reactAttrValue: string = attr.value;
            let attrName: string = attr.name;
            let isClassOddAttr: boolean;
            let isClassEvenAttr: boolean;
            let isNgModelAttr: boolean;

            if (attrName === 'ng-class-odd') {
                isClassOddAttr = true;
                attrName = htmlAttr2React('class');
            } else if (attrName === 'ng-class-even') {
                isClassEvenAttr = true;
                attrName = htmlAttr2React('class');
            } else if (attrName === 'ng-model') {
                isNgModelAttr = true;
                attrName = htmlAttr2React('value');
            }

            this.html += ' ';

            if (!attr.namespace) {
                this.html += attrName;
            } else if (attr.namespace === NS.XML) {
                this.html += 'xml:' + attrName;
            } else if (attr.namespace === NS.XMLNS) {
                if (attrName !== 'xmlns') {
                    this.html += 'xmlns:';
                }

                this.html += attrName;
            } else if (attr.namespace === NS.XLINK) {
                this.html += 'xlink:' + attrName;
            } else {
                this.html += attr.namespace + ':' + attrName;
            }

            this.html += '=';
            const {startSymbol, endSymbol} = reactInterpolation;

            if (isClassOddAttr) {
                reactAttrValue = `${ startSymbol }(index % 2) ? (${
                    stringifyNgExpression(ngParser, cleanNgAttrExpression(reactAttrValue, ngInterpolateOptions))
                }) : undefined${ endSymbol }`;
            } else if (isClassEvenAttr) {
                reactAttrValue = `${ startSymbol}(index % 2) ? undefined : (${
                    stringifyNgExpression(ngParser, cleanNgAttrExpression(reactAttrValue, ngInterpolateOptions))
                })${ endSymbol }`;
            } else if (isNgModelAttr) {
                reactAttrValue = startSymbol +
                    stringifyNgExpression(ngParser, cleanNgAttrExpression(reactAttrValue, ngInterpolateOptions)) +
                    endSymbol;
            } else if (attrName === 'dangerouslySetInnerHTML') {
                reactAttrValue = interpolate(ngParser, reactAttrValue, transformOptions);

                if (reactAttrValue.includes(startSymbol) && reactAttrValue.includes(endSymbol)) {
                    reactAttrValue =
                        '`' +
                        reactAttrValue.replace(new RegExp(`\\${ startSymbol }`, 'g'), '${') +
                        '`';
                } else {
                    reactAttrValue = wrapAttrValue(reactAttrValue);
                }

                reactAttrValue = `${ startSymbol }{__html: ${ reactAttrValue }}${ endSymbol }`;
            } else if (attrName === 'ng-model-options') {
                reactAttrValue = startSymbol + reactAttrValue + endSymbol;
            } else {
                const interpolatedValue: string =
                    reactAttrValue &&
                    interpolate(ngParser, reactAttrValue, transformOptions);
                const isEventHandlerAttr: boolean = /^on[A-Z][a-z]{2,}/.test(attrName);

                // has interpolation or event handler
                if (interpolatedValue && (reactAttrValue !== interpolatedValue || isEventHandlerAttr)) {
                    const attrValue: string = cleanNgAttrExpression(interpolatedValue, ngInterpolateOptions);

                    if (isEventHandlerAttr) {
                        const newAttrValue: string = attrValue.replace(ngEventPattern, 'event');
                        const args: string[] = [];

                        if (newAttrValue !== attrValue) {
                            args.push(`event${ react.typescript ? ': React.SyntheticEvent<HTMLElement>' : '' }`);
                        }

                        reactAttrValue = `${ startSymbol }(${ args.join(', ') }) => {${ newAttrValue }}${ endSymbol }`;
                    } else if (attrValue.includes(startSymbol) && attrValue.includes(endSymbol)) {
                        const attrValueLastIndex: number = attrValue.length - 1;

                        if (
                            attrValue.lastIndexOf(startSymbol) === 0 &&
                            attrValue.lastIndexOf(endSymbol) === attrValueLastIndex
                        ) {
                            reactAttrValue = attrValue;
                        } else {
                            reactAttrValue =
                                `${ startSymbol }\`` +
                                attrValue.replace(new RegExp(`\\${ startSymbol }`, 'g'), '${') +
                                `\`${ endSymbol }`;
                        }
                    } else if (isEventHandlerAttr) {
                        reactAttrValue = startSymbol + attrValue + endSymbol;
                    } else {
                        reactAttrValue = wrapAttrValue(reactAttrValue);
                    }
                } else {
                    reactAttrValue = wrapAttrValue(interpolatedValue);
                }

                if (reactAttrValue[0] !== startSymbol) {
                    const isBooleanAttr: boolean = htmlBooleanAttribute.some((attr: string) => {
                        return attrName === htmlAttr2React(attr);
                    });

                    if (isBooleanAttr) {
                        if (reactAttrValue === `${ doubleQuote }${ doubleQuote }` ||
                            reactAttrValue === `${ doubleQuote }${ attrName }${ doubleQuote }`
                        ) {
                            reactAttrValue = `${ startSymbol }true${ endSymbol }`;
                        } else {
                            reactAttrValue = startSymbol + reactAttrValue.slice(1, -1) + endSymbol;
                        }
                    } else {
                        const isNumericAttr: boolean = htmlNumericAttributes.some((attr: string) => {
                            return attrName === htmlAttr2React(attr);
                        });

                        if (isNumericAttr) {
                            reactAttrValue = startSymbol + reactAttrValue.slice(1, -1) + endSymbol;
                        }
                    }
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

            this.html += `${ reactInterpolation.startSymbol }\`${ content }\`${ reactInterpolation.endSymbol }`;
        } else {
            const escapedContent: string = Serializer.escapeString(content, false);

            this.html += escapedContent && interpolate(ngParser, escapedContent, transformOptions) || '';
        }
    };

    serializer._serializeCommentNode = function (node: AST.HtmlParser2.TextNode) {
        this.html += '{/*' + this.treeAdapter.getCommentNodeContent(node) + '*/}';
    };

    const output: string = serializer.serialize();

    return (fragment as any).openedElementGroupsCount ? `[\n${ output }\n]` : `(\n${ output }\n)`;
}