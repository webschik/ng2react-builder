import {AngularInterpolateOptions, DirectiveReplaceInfo, ReactComponentOptions} from '../index';
import {angularAttr2React, htmlAttr2React} from '../react';
import cleanNgAttrExpression from '../serializer/clean-ng-attr-expression';
import parseNgIterator from './parse-ng-iterator';
import {ASTElement} from './parse-template';
import searchNgAttr from './search-ng-attr';

const ngAttr: string = 'ng-attr-';

export default function parseNgAttrs (el: ASTElement, componentOptions: ReactComponentOptions): ASTElement {
    const {attribs} = el;
    const {replaceDirectives} = componentOptions;
    const filteredAttribs: {[key: string]: string} = Object.create(null);
    const ngInterpolateOptions: AngularInterpolateOptions =
        componentOptions.angular.interpolate as AngularInterpolateOptions;

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
                default:
                    if (name.indexOf(ngAttr) === 0) {
                        filteredAttribs[name.slice(ngAttr.length)] = value;

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