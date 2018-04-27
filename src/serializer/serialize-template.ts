import {AST} from 'parse5/lib';
import {AngularLexer, AngularParser, Angular, initAngular} from '../angular';
import {AngularInterpolateOptions, TransformOptions} from '../index';
import {ASTElement} from '../transformer/transform-template';
import {htmlAttr2React, reactInterpolation} from '../react';
import cleanNgAttrExpression from './clean-ng-attr-expression';
import hasMultipleSiblingElements from '../parser/has-multiple-sibling-elements';
import interpolate from './interpolate';
import stringifyNgExpression from './stringify-ng-expression';

const angular: Angular = initAngular();
const Serializer = require('parse5/lib/serializer/index');
const {NAMESPACES: NS, TAG_NAMES: $} = require('parse5/lib/common/html');
const ampPattern: RegExp = /&amp;/g;
const ltPattern: RegExp = /&lt;/g;
const gtPattern: RegExp = /&gt;/g;
const quotePattern: RegExp = /&quot;/g;
const emptyParenthesesPattern: RegExp = /\(\)/g;
const nonEmptyParenthesesPattern: RegExp = /([a-z])\(([^\)])/g;

interface ASTSerializer {
    [key: string]: any;
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
            this.html += key.includes('${') ? ` key={\`${ key }\`}` : ` key="${ key }"`;
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
            let reactAttrValue: string = Serializer.escapeString(attr.value, true);
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
            } else if (attrName === 'ng-model' || attrName === 'data-ng-model') {
                isNgModelAttr = true;
                attrName = htmlAttr2React('value');
            } else if ((attrName === 'ng-trim' || attrName === 'data-ng-trim') && reactAttrValue === 'false') {
                continue;
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
                reactAttrValue = startSymbol +
                    (reactAttrValue ? `{__html: ${
                        stringifyNgExpression(ngParser, cleanNgAttrExpression(reactAttrValue, ngInterpolateOptions))
                    }}` : '') +
                    endSymbol;
            } else {
                const interpolatedValue: string =
                    reactAttrValue &&
                    interpolate(ngParser, reactAttrValue, transformOptions);
                const isEventHandlerAttr: boolean = /^on[A-Z][a-z]{2,}/.test(attrName);

                // has interpolation or event handler
                if (interpolatedValue && (reactAttrValue !== interpolatedValue || isEventHandlerAttr)) {
                    let attrValue: string = cleanNgAttrExpression(interpolatedValue, ngInterpolateOptions);

                    if (isEventHandlerAttr) {
                        attrValue = attrValue
                            .replace(ampPattern, '&')
                            .replace(ltPattern, '<')
                            .replace(gtPattern, '>')
                            .replace(quotePattern, '"')
                            .replace(emptyParenthesesPattern, '')
                            .replace(nonEmptyParenthesesPattern, '$1.bind(this, $2');
                    }

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
                } else {
                    reactAttrValue = `"${ interpolatedValue }"`;
                }

                if (reactAttrValue[0] !== startSymbol) {
                    switch (attrName) {
                        case htmlAttr2React('disabled'):
                        case htmlAttr2React('autofocus'):
                        case htmlAttr2React('required'):
                        case htmlAttr2React('readonly'):
                        case htmlAttr2React('spellcheck'):
                            if (reactAttrValue === '""' || reactAttrValue === `"${ attrName }"`) {
                                reactAttrValue = `${ startSymbol }true${ endSymbol }`;
                            } else {
                                reactAttrValue = startSymbol + reactAttrValue.slice(1, -1) + endSymbol;
                            }
                            break;
                        case htmlAttr2React('tabindex'):
                        case htmlAttr2React('rows'):
                        case htmlAttr2React('cols'):
                        case htmlAttr2React('min'):
                        case htmlAttr2React('max'):
                        case htmlAttr2React('step'):
                        case htmlAttr2React('maxlength'):
                        case htmlAttr2React('minlength'):
                            reactAttrValue = startSymbol + reactAttrValue.slice(1, -1) + endSymbol;
                            break;
                        default:
                            //
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

            this.html += content;
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