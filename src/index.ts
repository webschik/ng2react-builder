import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import * as prettier from 'prettier';
import {promisify} from 'util';
import parseTemplate from './parser/parse-template';

const readFile = promisify(fs.readFile);

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

export interface AngularASTNode {
    name: string;
    type: string;
    value?: string;
}

export interface AngularASTExpressionCallee extends AngularASTNode {
    property: AngularASTNode;
    object: AngularASTNode;
}

export interface AngularASTExpression {
    type: string;
    callee: AngularASTExpressionCallee;
    arguments: AngularASTNode[];
}

export interface AngularParser {
    new (lexer: AngularLexer, options?: {[key: string]: any}): this;
    ast (source: string): AngularAST;
}

export interface Angular {
    Lexer: AngularLexer;
    AST: AngularParser;
}

export interface ComponentMethod {
    name: string;
    args: string[];
}

export interface ComponentInfo {
    template: string;
    methods: ComponentMethod[];
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
    templatePath?: string;
    replaceDirectives?: {
        [key: string]: string;
    };
    output: {
        name: string;
        typescript?: boolean;
        prettier?: prettier.Options;
    };
}

export function createReactComponent (options: ReactComponentOptions): Promise<string> {
    const {templatePath, output} = options;
    const {typescript} = output;
    const queue: Array<Promise<ComponentInfo>> = [];

    if (templatePath) {
        const angular: Angular = initAngular();

        queue.push(readFile(path.resolve(process.cwd(), templatePath), 'utf8').then((template: string) => {
            return parseTemplate(angular, template, options);
        }));
    }

    return Promise.all(queue).then((componentInfoParts: ComponentInfo[]) => {
        const componentInfo: ComponentInfo = componentInfoParts.reduce((componentInfo: ComponentInfo, part) => {
            return Object.assign(componentInfo, part);
        }, {} as ComponentInfo);

        return prettier.format(`
            ${ typescript ? 'import * as React from \'react\';' : 'import React from \'react\';'}

            export default class ${ output.name } extends React.PureComponent${ typescript ? '<{}>' : ''} {
                render () {
                    return (
                        ${ componentInfo && componentInfo.template || ''}
                    );
                }
            }
        `, Object.assign({
            printWidth: 120,
            tabWidth: 4,
            useTabs: false,
            semi: true,
            singleQuote: true,
            trailingComma: 'none',
            bracketSpacing: false,
            jsxBracketSameLine: true,
            arrowParens: 'always',
            parser: typescript ? 'typescript' : 'babylon'
        }, output.prettier));
    });
}