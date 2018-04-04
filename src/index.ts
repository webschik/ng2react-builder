import * as fs from 'fs';
import * as path from 'path';
import * as prettier from 'prettier';
import {promisify} from 'util';
import parseTemplate from './parser/parse-template';

const readFile = promisify(fs.readFile);

export interface ComponentMethod {
    name: string;
    args: string[];
}

export interface ComponentInfo {
    template: string;
    methods: ComponentMethod[];
}

export interface DirectiveReplaceInfo {
    tagName: string;
    valueProp?: string;
}

export interface ReactComponentOptions {
    templatePath?: string;
    replaceDirectives?: {
        [key: string]: DirectiveReplaceInfo;
    };
    angular?: {
        interpolate: {
            startSymbol?: string;
            endSymbol?: string;
            bindOnce?: string;
        }
    };
    output: {
        name: string;
        typescript?: boolean;
        prettier?: prettier.Options;
    };
}

export function createReactComponent (customOptions: ReactComponentOptions): Promise<string> {
    const options: ReactComponentOptions = Object.assign({}, customOptions, {
        angular: Object.assign({}, customOptions.angular, {
            interpolate: Object.assign({
                startSymbol: '{{',
                endSymbol: '}}',
                bindOnce: '::'
            }, customOptions.angular &&  customOptions.angular.interpolate)
        })
    });

    const {templatePath, output} = options;
    const {typescript} = output;
    const queue: Array<Promise<ComponentInfo>> = [];

    if (templatePath) {
        queue.push(readFile(path.resolve(process.cwd(), templatePath), 'utf8').then((template: string) => {
            return parseTemplate(template, options);
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