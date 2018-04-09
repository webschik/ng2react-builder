import {AngularParser} from '../angular';
import {ReactComponentOptions} from '../index';
import {reactInterpolation} from '../react';
import stringifyNgExpression from './stringify-ng-expression';

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
            const expContent: string = stringifyNgExpression(ngParser, exp);

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