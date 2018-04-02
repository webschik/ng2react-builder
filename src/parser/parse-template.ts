import {Angular, AngularLexer, AngularParser} from '../index';

export default function parseTemplate (angular: Angular, template: string) {
    const lexer: AngularLexer = new angular.Lexer({
        csp: false,
        expensiveChecks: false
    });
    const ngParser: AngularParser = new angular.AST(lexer, {
        literals: {
            true: true,
            false: false,
            null: null,
            undefined
        }
    });
    const ast = ngParser.ast(template);

    // tslint:disable-next-line
    debugger;
}