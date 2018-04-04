import {AngularASTExpression, AngularParser} from '../angular';
import {ReactComponentOptions} from '../index';
import {reactInterpolation} from '../react';

function stringifyCallExpression (expression: AngularASTExpression) {
    const {callee, arguments: args} = expression;

    if (!callee.name) {
        return stringifyExpression(callee);
    }

    if (!args[0]) {
        return callee.name;
    }

    return `${ callee.name }(${ args.map((arg: AngularASTExpression) => {
        if (arg.type === 'Literal') {
            return `'${ arg.value }'`;
        }

        return arg.value;
    }).join(', ') })`;
}

function stringifyMemberExpression (expression: AngularASTExpression) {
    return `${ expression.object.name }.${ expression.property.name }`;
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
        case 'Identifier':
            output += expression.name || '';
            break;
        default:
        //
    }

    return output;
}

function escapeForRegExp (ch: string) {
    return `\\\\\\${ ch }`;
}

function unescapeText (
    text: string,
    escapedStartRegexp: RegExp,
    escapedEndRegexp: RegExp,
    startSymbol: string,
    endSymbol: string
) {
    return text.replace(escapedStartRegexp, startSymbol).replace(escapedEndRegexp, endSymbol);
}

export default function interpolate (ngParser: AngularParser, text: string, options: ReactComponentOptions): string {
    const {startSymbol, endSymbol, bindOnce} = options.angular.interpolate;
    const startSymbolLength: number = startSymbol.length;
    const endSymbolLength: number = endSymbol.length;
    const textLength: number = text.length;
    const escapedStartRegexp: RegExp = new RegExp(startSymbol.replace(/./g, escapeForRegExp), 'g');
    const escapedEndRegexp: RegExp = new RegExp(endSymbol.replace(/./g, escapeForRegExp), 'g');
    let index: number = 0;
    let output: string = '';

    while (index < textLength) {
        const startIndex: number = text.indexOf(startSymbol, index);
        const endIndex: number = text.indexOf(endSymbol, startIndex + startSymbolLength);

        if ((startIndex !== -1) && (endIndex !== -1)) {
            if (index !== startIndex) {
                output += unescapeText(
                    text.substring(index, startIndex),
                    escapedStartRegexp,
                    escapedEndRegexp,
                    startSymbol,
                    endSymbol
                );
            }
            const exp: string = text
                .substring(startIndex + startSymbolLength, endIndex)
                .trim()
                .replace(bindOnce, '');
            const ast = ngParser.ast(exp);
            const expContent: string = ast.body.reduce((result: string, {expression}) => {
                return result += stringifyExpression(expression);
            }, '');

            if (expContent) {
                output += reactInterpolation.startSymbol + expContent + reactInterpolation.endSymbol;
            }

            index = endIndex + endSymbolLength;
        } else {
            if (index !== textLength) {
                output += unescapeText(
                    text.substring(index),
                    escapedStartRegexp,
                    escapedEndRegexp,
                    startSymbol,
                    endSymbol
                );
            }
            break;
        }
    }

    return output;
}