export default function isNgInterpolation (expression: string): boolean {
    return Boolean(expression && expression.trim().indexOf('{{') === 0);
}