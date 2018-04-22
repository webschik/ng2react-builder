import * as types from 'babel-types';
import * as babylon from 'babylon';
import {ComponentOptions, TransformOptions} from '../index';

const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const jsxResultKeyword: string = 'JSX_RESULT';
const jsxResultKeywordPattern: RegExp = new RegExp(`"${ jsxResultKeyword }";`, 'g');

interface NodePath {
    node: types.Node;
    scope: {
        rename (from: string, to: string): void;
    };
    get (name: string): any;
}

interface ClassDeclarationPath extends NodePath {
    node: types.ClassDeclaration;
}

export default function parseController (
    componentOptions: ComponentOptions,
    jsxResult: string,
    transformOptions: TransformOptions
): string {
    const {controller, componentName} = componentOptions;
    const controllerName: string = controller.name;
    const ast: types.File = babylon.parse(controller.code, {
        sourceType: 'module'
    });

    traverse(ast, {
        Program (path: NodePath) {
            path.scope.rename(controllerName, componentName);
        },

        ClassDeclaration (path: ClassDeclarationPath) {
            const {node} = path;

            if (node.id && node.id.name === componentName) {
                path.get('body').pushContainer(
                    'body',
                    types.expressionStatement(types.stringLiteral(jsxResultKeyword))
                );
            }
        }
    });

    return generate(ast).code.replace(jsxResultKeywordPattern, `
        render () {
            return ${ jsxResult };
        }
    `);
}