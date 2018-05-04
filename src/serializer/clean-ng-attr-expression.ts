import {AngularInterpolateOptions} from '../index';

export default function cleanNgAttrExpression (
    expression: string,
    ngInterpolateOptions: AngularInterpolateOptions
): string {
    return expression
        .trim()
        .replace(ngInterpolateOptions.bindOnce, '')
        .replace(/;$/, '');
}