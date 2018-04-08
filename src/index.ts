import * as prettier from 'prettier';
import parseTemplate from './parser/parse-template';

export interface ComponentInfo {
    template: string;
}

export interface DirectiveReplaceInfo {
    tagName: string;
    valueProp?: string;
}

export interface AngularInterpolateOptions {
    startSymbol: string;
    endSymbol: string;
    bindOnce: string;
}

export interface ReactComponentOptions {
    template?: string;
    replaceDirectives?: {
        [key: string]: DirectiveReplaceInfo;
    };
    react: {
        componentName: string;
        componentType?: 'stateless' | 'stateful' | 'pure';
        typescript?: boolean;
        prettier?: prettier.Options;
    };
    angular?: {
        interpolate: Partial<AngularInterpolateOptions>;
    };
}

export function createReactComponent (customOptions: ReactComponentOptions): string {
    const options: ReactComponentOptions = Object.assign({}, customOptions, {
        angular: Object.assign({}, customOptions.angular, {
            interpolate: Object.assign({
                startSymbol: '{{',
                endSymbol: '}}',
                bindOnce: '::'
            }, customOptions.angular && customOptions.angular.interpolate)
        }),
        react: Object.assign({
            componentType: 'pure'
        }, customOptions.react)
    });

    const {template, react} = options;
    const {typescript, componentType, componentName} = react;
    let componentInfo: ComponentInfo;

    if (template) {
        componentInfo = parseTemplate(template, options);
    }

    const componentRenderResult: string = componentInfo && componentInfo.template || 'null';

    debugger;
    return prettier.format(`
        ${ typescript ? 'import * as React from \'react\';' : 'import React from \'react\';'}

        ${ componentType === 'stateless' ? (
            `const ${ componentName }${ typescript ? ': React.StatelessComponent<{}>' : ''} = (props) => {
                return ${ componentRenderResult };
            };

            export default ${ componentName };
        `) : (`
            export default class ${ componentName } extends React.PureComponent${ typescript ? '<{}>' : ''} {
                render () {
                    return ${ componentRenderResult };
                }
            }
        `)}
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
    }, react.prettier));
}