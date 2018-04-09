import {AngularInterpolateOptions} from '../index';

export default function cleanNgAttrExpression (expression: string, interpolate: AngularInterpolateOptions): string {
    return expression
        .trim()
        .replace(interpolate.bindOnce, '')
        .replace(/;$/, '');
}