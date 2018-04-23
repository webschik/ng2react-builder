import * as types from 'babel-types';
import * as babylon from 'babylon';
import {ComponentOptions, TransformOptions} from '../index';
import {statefulComponentType} from '../react';

const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const jsxResultKeyword: string = 'JSX_RESULT';
const jsxResultKeywordPattern: RegExp = new RegExp(`\\/\\/${ jsxResultKeyword }`, 'g');

interface NodePath {
    node: types.Node;
    scope: {
        rename (from: string, to: string): void;
    };
    insertBefore (nodes: types.Node[]): void;
    get (name: string): any;
    unshiftContainer (type: string, content: any): this;
    pushContainer (type: string, content: any): this;
}

interface ClassDeclarationPath extends NodePath {
    node: types.ClassDeclaration;
}

interface ClassMethodNodePath extends NodePath {
    node: types.ClassMethod;
}

export default function parseController (
    componentOptions: ComponentOptions,
    jsxResult: string,
    transformOptions: TransformOptions
): string {
    const {typescript} = transformOptions.react;
    const {controller, componentName, componentType} = componentOptions;
    const componentPropsInterface: string = `${ componentName }Props`;
    const componentStateInterface: string = `${ componentName }State`;
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
                if (typescript) {
                    path.insertBefore([
                        types.identifier('\n'),
                        types.exportNamedDeclaration(
                            types.interfaceDeclaration(
                                types.identifier(componentPropsInterface),
                                null,
                                [],
                                types.objectTypeAnnotation(
                                    [],
                                    [
                                        types.objectTypeIndexer(
                                            types.identifier('key'),
                                            types.stringTypeAnnotation(),
                                            types.anyTypeAnnotation()
                                        )
                                    ],
                                    []
                                )
                            ),
                            []
                        ),
                        types.identifier('\n'),
                        types.exportNamedDeclaration(
                            types.interfaceDeclaration(
                                types.identifier(componentStateInterface),
                                null,
                                [],
                                types.objectTypeAnnotation(
                                    [],
                                    [
                                        types.objectTypeIndexer(
                                            types.identifier('key'),
                                            types.stringTypeAnnotation(),
                                            types.anyTypeAnnotation()
                                        )
                                    ],
                                    []
                                )
                            ),
                            []
                        )
                    ]);
                }

                if (!node.superClass) {
                    node.superClass = types.memberExpression(
                        types.identifier('React'),
                        types.identifier(componentType === statefulComponentType ? 'Component' : 'PureComponent')
                    );

                    if (typescript) {
                        node.superTypeParameters = types.typeParameterInstantiation([
                            types.genericTypeAnnotation(types.identifier(componentPropsInterface)),
                            types.genericTypeAnnotation(types.identifier(componentStateInterface))
                        ]);
                    }

                    const methodsPaths: ClassMethodNodePath[] = path.get('body').get('body') || [];
                    const constructorMethodPath: ClassMethodNodePath = methodsPaths.find(({node}) => {
                        return node.kind === 'constructor';
                    });

                    if (constructorMethodPath) {
                        constructorMethodPath.get('body').unshiftContainer(
                            'body',
                            types.expressionStatement(
                                types.callExpression(
                                    types.identifier('super'),
                                    [
                                        types.identifier('props'),
                                        types.identifier('context')
                                    ]
                                )
                            )
                        );
                    }
                }

                path.get('body').pushContainer(
                    'body',
                    types.identifier(`//${ jsxResultKeyword }`)
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