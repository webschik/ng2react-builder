import * as types from 'babel-types';
import * as babylon from 'babylon';
import {ComponentOptions, TransformOptions} from '../index';
import {ReactComponentType, statefulComponentType} from '../react';

const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const jsxResultKeyword: string = 'JSX_RESULT';
const jsxResultKeywordPattern: RegExp = new RegExp(`\\/\\/${ jsxResultKeyword }`, 'g');

interface NodePath {
    node: types.Node;
    scope: {
        rename (from: string, to: string): void;
    };
    remove (): void;
    replaceWith (node: types.Node): void;
    insertBefore (nodes: types.Node[]): void;
    get (name: string): any;
    unshiftContainer (type: string, content: types.Node|types.Node[]): this;
    pushContainer (type: string, content: types.Node|types.Node[]): this;
}

interface DirectivePath extends NodePath {
    node: types.Directive;
}

interface FunctionExpressionPath extends NodePath {
    node: types.FunctionExpression;
}

interface ClassDeclarationPath extends NodePath {
    node: types.ClassDeclaration;
}

interface ClassMethodNodePath extends NodePath {
    node: types.ClassMethod;
}

function createGeneralInterfaceDeclaration (interfaceName: string) {
    return types.interfaceDeclaration(
        types.identifier(interfaceName),
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
    );
}

function addComponentGlobalTypeAnnotations (programPath: NodePath, interfaces: string[]) {
    const nodes: types.Node[] = interfaces.reduce((nodes: types.Node[], interfaceName: string) => {
        return nodes.concat([
            types.exportNamedDeclaration(createGeneralInterfaceDeclaration(interfaceName), []),
            types.identifier('\n')
        ]);
    }, [
        types.identifier('\n')
    ]);
    const programChildren: NodePath[] = programPath.get('body');
    const firstNonImportDeclaration: NodePath = programChildren.find((path: NodePath) => {
        return !types.isImportDeclaration(path);
    });

    if (!firstNonImportDeclaration) {
        programPath.pushContainer('body', nodes);
    } else {
        firstNonImportDeclaration.insertBefore(nodes);
    }
}

function createComponentSuperTypeParameters (interfaces: string[]) {
    const annotations: types.GenericTypeAnnotation[] = interfaces.map((interfaceName: string) => {
        return types.genericTypeAnnotation(types.identifier(interfaceName));
    });

    return {
        annotations,
        superTypeParameters: types.typeParameterInstantiation(annotations)
    };
}

function createComponentSuperClass (componentType: ReactComponentType) {
    return types.memberExpression(
        types.identifier('React'),
        types.identifier(componentType === statefulComponentType ? 'Component' : 'PureComponent')
    );
}

function createComponentConstructorParams ({typescript, node, constructorParams}: {
    typescript: boolean;
    node: types.ClassMethod;
    constructorParams: types.LVal[]
}) {
    const propsParamIdentifier: types.Identifier = types.identifier('props');
    const contextParamIdentifier: types.Identifier = types.identifier('context');

    if (typescript) {
        (contextParamIdentifier as any).optional = true;
        contextParamIdentifier.typeAnnotation = types.typeAnnotation(types.anyTypeAnnotation());
    }

    const params: types.Identifier[] = [
        propsParamIdentifier,
        contextParamIdentifier
    ];
    const oldParams: types.LVal[] = constructorParams.slice(0);

    node.params.length = 0;
    node.params.unshift(...params);

    if (oldParams[0]) {
        node.params.push(types.identifier('/*'), ...oldParams, types.identifier('*/'));
    }

    return params;
}

function createComponentConstructorSuperCall (): types.Node[] {
    return [
        types.expressionStatement(
            types.callExpression(
                types.identifier('super'),
                [
                    types.identifier('props'),
                    types.identifier('context')
                ]
            )
        ),
        types.identifier('\n')
    ];
}

export default function transformController (
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
    let programPath: NodePath;

    traverse(ast, {
        Program (path: NodePath) {
            programPath = path;
        },

        Directive (path: DirectivePath) {
            const value: types.DirectiveLiteral = path.node.value;

            if (value && value.value.indexOf('ng') === 0) {
                path.remove();
            }
        },

        FunctionExpression (path: FunctionExpressionPath) {
            const {node} = path;

            if (node.id && node.id.name === controllerName) {
                const bodyPath: NodePath = path.get('body');

                bodyPath.unshiftContainer('body', createComponentConstructorSuperCall());

                const constructorMethod: types.ClassMethod = types.classMethod(
                    'constructor',
                    types.identifier('constructor'),
                    [],
                    bodyPath.node as types.BlockStatement
                );
                const [propsParamIdentifier] = createComponentConstructorParams({
                    typescript,
                    node: constructorMethod,
                    constructorParams: node.params
                });

                const componentClass: types.ClassExpression = types.classExpression(
                    types.identifier(componentName),
                    createComponentSuperClass(componentType),
                    types.classBody([constructorMethod]),
                    []
                );
                let propsTypeAnnotation: types.GenericTypeAnnotation;

                if (typescript) {
                    addComponentGlobalTypeAnnotations(programPath, [componentPropsInterface, componentStateInterface]);
                    const params = createComponentSuperTypeParameters([
                        componentPropsInterface,
                        componentStateInterface
                    ]);

                    propsTypeAnnotation = params.annotations[0];
                    componentClass.superTypeParameters = params.superTypeParameters;
                    propsParamIdentifier.typeAnnotation = types.typeAnnotation(propsTypeAnnotation);
                }

                path.replaceWith(componentClass);
            }
        },

        ClassDeclaration (path: ClassDeclarationPath) {
            const {node} = path;

            if (node.id && node.id.name === controllerName) {
                if (typescript) {
                    addComponentGlobalTypeAnnotations(programPath, [componentPropsInterface, componentStateInterface]);
                }

                let propsTypeAnnotation: types.GenericTypeAnnotation;

                if (typescript && !node.superTypeParameters) {
                    const params = createComponentSuperTypeParameters([
                        componentPropsInterface,
                        componentStateInterface
                    ]);

                    propsTypeAnnotation = params.annotations[0];
                    node.superTypeParameters = params.superTypeParameters;
                }

                if (!node.superClass) {
                    node.superClass = createComponentSuperClass(componentType);

                    const methodsPaths: ClassMethodNodePath[] = path.get('body').get('body') || [];
                    const constructorMethodPath: ClassMethodNodePath = methodsPaths.find(({node}) => {
                        return node.kind === 'constructor';
                    });

                    if (constructorMethodPath) {
                        const constructorMethodNode: types.ClassMethod = constructorMethodPath.node;
                        const [propsParamIdentifier] = createComponentConstructorParams({
                            typescript,
                            node: constructorMethodNode,
                            constructorParams: constructorMethodNode.params
                        });

                        if (propsTypeAnnotation) {
                            propsParamIdentifier.typeAnnotation = types.typeAnnotation(propsTypeAnnotation);
                        }

                        constructorMethodPath.get('body').unshiftContainer(
                            'body',
                            createComponentConstructorSuperCall()
                        );
                    }
                }

                path.get('body').pushContainer('body', types.identifier(`//${ jsxResultKeyword }`));
            }
        }
    });

    return generate(ast).code
        .replace(new RegExp(controllerName, 'g'), componentName)
        .replace(jsxResultKeywordPattern, `
            render () {
                return ${ jsxResult };
            }
        `);
}