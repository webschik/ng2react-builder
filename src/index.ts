import * as prettier from 'prettier';
import parseController from './parser/parse-controller';
import parseTemplate from './parser/parse-template';

export interface DirectiveReplaceInfo {
    tagName: string;
    valueProp?: string;
}

export interface AngularInterpolateOptions {
    startSymbol: string;
    endSymbol: string;
    bindOnce: string;
}

export interface AngularControllerOptions {
    name: string;
    code: string;
}

export interface ReactComponentOptions {
    template?: string;
    controller?: AngularControllerOptions;
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
        }, customOptions.react),
        replaceDirectives: Object.assign({
            'ng-view': {
                tagName: 'Switch'
            },
            'ui-sref': {
                tagName: 'NavLink',
                valueProp: 'to'
            }
        }, customOptions.replaceDirectives)
    });

    const {template, react, controller} = options;
    const {typescript, componentType, componentName} = react;
    let jsxResult: string = 'null';
    let componentCode: string;

    if (template) {
        jsxResult = parseTemplate(template, options);
    }

    if (controller) {
        componentCode = parseController(controller, jsxResult, options);
    } else {
        componentCode = `
            ${ typescript ? 'import * as React from \'react\';' : 'import React from \'react\';'}

            ${ componentType === 'stateless' ? (
                `const ${ componentName }${ typescript ? ': React.StatelessComponent<{}>' : ''} = (props) => {
                    return ${ jsxResult };
                };
                export default ${ componentName };
            `) : (`
                export default class ${ componentName } extends React.PureComponent${ typescript ? '<{}>' : ''} {
                    render () {
                        return ${ jsxResult };
                    }
                }
            `)}
        `;
    }

    return prettier.format(componentCode, Object.assign({
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