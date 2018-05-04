import {AST} from 'parse5/lib';
import {AngularInterpolateOptions, DirectiveToTagInfo, DirectiveToTextNodeInfo, TransformOptions} from '../index';
import {angularAttr2React, htmlAttr2React} from '../react';
import cleanNgAttrExpression from '../serializer/clean-ng-attr-expression';
import parseNgIterator from './parse-ng-iterator';
import {ASTElement} from '../transformer/transform-template';
import searchNgAttr from './search-ng-attr';

const ngAttr: string = 'ng-attr-';

export default function parseNgAttrs (
    treeAdapter: AST.TreeAdapter,
    el: ASTElement,
    transformOptions: TransformOptions
): ASTElement {
    const {attribs} = el;
    const {directivesToTags, directivesToTextNodes} = transformOptions;
    const filteredAttribs: {[key: string]: string} = Object.create(null);
    const ngInterpolateOptions: AngularInterpolateOptions =
        transformOptions.angular.interpolate as AngularInterpolateOptions;

    for (const key in attribs) {
        if (Object.prototype.hasOwnProperty.call(attribs, key)) {
            const name: string = key.replace('data-ng', 'ng');
            const value: string = attribs[key];

            switch (name) {
                case 'ng-if':
                case 'ng-show':
                case 'ng-hide':
                    let attrValue: string = cleanNgAttrExpression(value, ngInterpolateOptions);

                    if (name === 'ng-hide') {
                        attrValue = `!${ attrValue }`;
                    }

                    el.condition = el.condition || '';
                    el.condition += el.condition ? ` && ${ attrValue }` : attrValue;
                    break;
                case 'ng-repeat':
                    el.iteratorInfo = parseNgIterator(value, ngInterpolateOptions);
                    el.isIteratorEnd = true;
                    break;
                case 'ng-repeat-start':
                    el.iteratorInfo = parseNgIterator(value, ngInterpolateOptions);
                    el.isGroupIterator = true;
                    break;
                case 'ng-repeat-end':
                    el.isIteratorEnd = true;
                    break;
                case 'ng-cloak':
                case 'ng-app':
                    break;
                case 'ng-bind':
                    treeAdapter.insertText(
                        el,
                        `${ ngInterpolateOptions.startSymbol }${ value }${ ngInterpolateOptions.endSymbol }`
                    );
                    break;
                default:
                    if (name === 'ng-trim' && value === 'false') {
                        break;
                    }

                    if (name.indexOf(ngAttr) === 0) {
                        const attrName: string = name.slice(ngAttr.length);

                        filteredAttribs[htmlAttr2React(attrName) || angularAttr2React(attrName) || attrName] = value;

                        break;
                    }

                    const directiveToTextNodeInfo: DirectiveToTextNodeInfo = searchNgAttr(name, directivesToTextNodes);

                    if (directiveToTextNodeInfo) {
                        let textContent: string = `'${ cleanNgAttrExpression(value, ngInterpolateOptions) }'`;

                        if (directiveToTextNodeInfo.callee) {
                            textContent = `${ directiveToTextNodeInfo.callee }(${
                                (directiveToTextNodeInfo.calleeArguments || []).concat(textContent).join(', ')
                            })`;
                        }

                        treeAdapter.insertText(
                            el,
                            `${ ngInterpolateOptions.startSymbol }${ textContent }${ ngInterpolateOptions.endSymbol }`
                        );
                        break;
                    }

                    let reactAttrName: string = htmlAttr2React(name) || angularAttr2React(name) || name;
                    const directiveToTagInfo: DirectiveToTagInfo = searchNgAttr(name, directivesToTags);

                    if (directiveToTagInfo) {
                        if (value) {
                            reactAttrName = directiveToTagInfo.valueProp || 'value';
                        } else {
                            reactAttrName = void 0;
                        }
                    }

                    if (reactAttrName) {
                        filteredAttribs[reactAttrName] = value;
                    }
            }
        }
    }

    el.attribs = filteredAttribs;

    return el;
}