import * as prettier from 'prettier';
import parseController from './parser/parse-controller';
import parseTemplate from './parser/parse-template';
import {pureComponentType, ReactComponentType} from './react';

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

export interface ComponentOptions {
    componentName: string;
    componentType?: ReactComponentType;
    template?: string;
    controller?: AngularControllerOptions;
}

export interface TransformOptions {
    components: ComponentOptions[];
    replaceDirectives?: {
        [key: string]: DirectiveReplaceInfo;
    };
    react?: {
        typescript?: boolean;
        prettier?: prettier.Options;
    };
    angular?: {
        interpolate: Partial<AngularInterpolateOptions>;
    };
}

export interface GeneratedComponent {
    code: string;
}

export function transform (options: TransformOptions): GeneratedComponent[] {
    const transformOptions: TransformOptions = Object.assign({}, options, {
        angular: Object.assign({}, options.angular, {
            interpolate: Object.assign({
                startSymbol: '{{',
                endSymbol: '}}',
                bindOnce: '::'
            }, options.angular && options.angular.interpolate)
        }),
        react: Object.assign({
            typescript: false
        }, options.react),
        replaceDirectives: Object.assign({
            'ng-view': {
                tagName: 'Switch'
            },
            'ui-sref': {
                tagName: 'NavLink',
                valueProp: 'to'
            }
        }, options.replaceDirectives)
    });
    const {typescript} = transformOptions.react;

    return transformOptions.components.map((componentOptions: ComponentOptions) => {
        const {template, controller, componentName, componentType = pureComponentType} = componentOptions;
        let jsxResult: string = 'null';
        let componentCode: string;

        if (template) {
            jsxResult = parseTemplate(template, transformOptions);
        }

        if (controller) {
            componentCode = parseController(componentOptions, jsxResult, transformOptions);
        } else {
            componentCode = `
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

        const code: string = prettier.format(`
            ${ typescript ? 'import * as React from \'react\';' : 'import React from \'react\';'}
            ${ componentCode }
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
        }, transformOptions.react && transformOptions.react.prettier));

        return {
            code
        };
    });
}