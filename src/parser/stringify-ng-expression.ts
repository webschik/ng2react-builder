import {AngularASTExpression, AngularParser} from '../angular';

function stringifyCallExpression (expression: AngularASTExpression) {
    const {callee, arguments: args} = expression;

    if (!callee.name) {
        return stringifyExpression(callee);
    }

    if (!args[0]) {
        return callee.name;
    }

    return `${ callee.name }(${ args.map(stringifyExpression).join(', ') })`;
}

function stringifyMemberExpression (expression: AngularASTExpression) {
    return `${ expression.object.name }.${ expression.property.name }`;
}

function stringifyBinaryExpression ({left, operator, right}: AngularASTExpression) {
    return `${ left ? stringifyExpression(left) : '' }${ operator }${ right ? stringifyExpression(right) : '' }`;
}

function stringifyConditionalExpression ({alternate, test, consequent}: AngularASTExpression) {
    return `${ stringifyExpression(test) }?${ stringifyExpression(alternate) }:${ stringifyExpression(consequent) }`;
}

function stringifyIdentifier (expression: AngularASTExpression) {
    return expression.name || '';
}

function stringifyLiteral ({value}: AngularASTExpression) {
    return value ? `'${ value }'` : '';
}

function stringifyExpression (expression: AngularASTExpression): string {
    let output: string = '';

    switch (expression && expression.type) {
        case 'CallExpression':
            output += stringifyCallExpression(expression);
            break;
        case 'MemberExpression':
            output += stringifyMemberExpression(expression);
            break;
        case 'BinaryExpression':
            output += stringifyBinaryExpression(expression);
            break;
        case 'ConditionalExpression':
            output += stringifyConditionalExpression(expression);
            break;
        case 'Identifier':
            output += stringifyIdentifier(expression);
            break;
        case 'Literal':
            output += stringifyLiteral(expression);
            break;
        default:
        //
    }

    return output;
}

export default function stringifyNgExpression (ngParser: AngularParser, exp: string): string {
    try {
        const ast = ngParser.ast(exp);

        return ast.body.reduce((result: string, {expression}) => {
            return result += stringifyExpression(expression);
        }, '');
    } catch (e) {
        //
    }

    return exp;
}