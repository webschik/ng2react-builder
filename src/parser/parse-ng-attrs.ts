import {AngularInterpolateOptions, DirectiveReplaceInfo, TransformOptions} from '../index';
import {angularAttr2React, htmlAttr2React} from '../react';
import cleanNgAttrExpression from '../serializer/clean-ng-attr-expression';
import parseNgIterator from './parse-ng-iterator';
import {ASTElement} from '../transformer/transform-template';
import searchNgAttr from './search-ng-attr';

const ngAttr: string = 'ng-attr-';

export default function parseNgAttrs (el: ASTElement, transformOptions: TransformOptions): ASTElement {
    const {attribs} = el;
    const {replaceDirectives} = transformOptions;
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
                    el.iteratorInfo = parseNgIterator(value);
                    el.isIteratorEnd = true;
                    break;
                case 'ng-repeat-start':
                    el.iteratorInfo = parseNgIterator(value);
                    el.isGroupIterator = true;
                    break;
                case 'ng-repeat-end':
                    el.isIteratorEnd = true;
                    break;
                case 'ng-cloak':
                case 'ng-app':
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

                    let reactAttrName: string = htmlAttr2React(name) || angularAttr2React(name) || name;

                    if (replaceDirectives) {
                        const directiveInfo: DirectiveReplaceInfo = searchNgAttr(name, replaceDirectives);

                        if (directiveInfo) {
                            if (value) {
                                reactAttrName = directiveInfo.valueProp || 'value';
                            } else {
                                reactAttrName = void 0;
                            }
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