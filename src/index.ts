import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import {argv} from 'yargs';
import parseTemplate from './parser/parse-template';

export interface AngularParseOptions {
    csp?: boolean;
    expensiveChecks?: boolean;
}

export interface AngularLexer {
    new (options?: AngularParseOptions): this;
}

export interface AngularAST {
    [key: string]: any;
}

export interface AngularParser {
    new (lexer: AngularLexer, options?: {[key: string]: any}): this;
    ast (source: string): AngularAST;
}

export interface Angular {
    Lexer: AngularLexer;
    AST: AngularParser;
}

function initAngular () {
    const source: string = fs.readFileSync('node_modules/angular/angular.js', 'utf8');
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

export interface ReactComponentOptions {
    name: string;
    template: string;
}

export function createReactComponent ({template}: ReactComponentOptions): string {
    const angular: Angular = initAngular();

    parseTemplate(angular, template);

    return '';
}

if (require.main === module) {
    const cwd: string = process.cwd();

    createReactComponent({
        name: 'Component1',
        template: fs.readFileSync(path.resolve(cwd, argv.template), 'utf8')
    });
}