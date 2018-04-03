import {AngularASTExpression, AngularASTNode, AngularParser} from '../index';

function stringifyCallExpression (expression: AngularASTExpression) {
    const {callee, arguments: args} = expression;

    if (callee.type === 'MemberExpression') {
        return `${ callee.object.name }.${ callee.property.name }`;
    }

    if (!args[0]) {
        return callee.name;
    }

    return `${ callee.name }(${ args.map((arg: AngularASTNode) => {
        if (arg.type === 'Literal') {
            return `'${ arg.value }'`;
        }

        return arg.value;
    }).join(', ') })`;
}

export default function parseNgExpression (ngParser: AngularParser, expression: string): string {
    try {
        const ast = ngParser.ast(expression
            .replace('{{', '')
            .replace('::', '')
            .replace('}}', ''));
        let output: string = '';

        ast.body.forEach(({expression}) => {
            switch (expression && expression.type) {
                case 'CallExpression':
                    output += stringifyCallExpression(expression);
                    break;
                default:
                //
            }
        });

        return output;
    } catch (e) {
        //
    }

    return expression;
}