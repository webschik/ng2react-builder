import * as fs from 'fs';
import * as vm from 'vm';

export interface AngularParseOptions {
    csp?: boolean;
    expensiveChecks?: boolean;
}

export interface AngularLexer {
    new (options?: AngularParseOptions): this;
}

export interface AngularAST {
    body: Array<{
        expression: AngularASTExpression;
    }>;
    [key: string]: any;
}

export interface AngularASTExpression {
    name: string;
    type: string;
    value?: string;
    callee?: AngularASTExpression;
    arguments?: AngularASTExpression[];
    property?: AngularASTExpression;
    object?: AngularASTExpression;
}

export interface AngularParser {
    new (lexer: AngularLexer, options?: {[key: string]: any}): this;
    ast (source: string): AngularAST;
}

export interface Angular {
    Lexer: AngularLexer;
    AST: AngularParser;
}

export function initAngular () {
    const source: string = fs.readFileSync('node_modules/angular/angular.js', 'utf8') as string;
    const externalAPICode: string = 'function publishExternalAPI(angular) {\n  extend(angular, {';
    const angularCode: string = source.replace(
        externalAPICode,
        `${ externalAPICode }\n'AST': AST, 'Lexer': Lexer,\n`
    );
    const document = {
        createElement () {
            return {
                setAttribute () {
                    //
                },
                pathname: 'dummy'
            };
        },
        querySelector () {
            //
        },
        addEventListener () {
            //
        }
    };
    const window: {[key: string]: any} = {
        document,
        location: {
            href: 'dummy'
        },
        addEventListener () {
            //
        },
        Node: {
            prototype: {}
        }
    };

    window.window = window;
    window.self = window;

    vm.runInContext(angularCode, vm.createContext(window));

    return window.angular;
}