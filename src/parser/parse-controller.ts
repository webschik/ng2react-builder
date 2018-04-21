import {ClassDeclaration} from 'babel-types';
import * as types from 'babel-types';
import * as babylon from 'babylon';
import {AngularControllerOptions, ReactComponentOptions} from '../index';

const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;

export default function parseController (
    controller: AngularControllerOptions,
    jsxResult: string,
    componentOptions: ReactComponentOptions
): string {
    const controllerName: string = controller.name;
    const ast: types.File = babylon.parse(controller.code, {
        sourceType: 'module'
    });

    traverse(ast, {
        enter (path: object) {
            if (types.isClassDeclaration(path) && path.id && path.id.name === controllerName) {
                const {body} = path as ClassDeclaration;

                debugger;
            }
        }
    });

    // return generate(ast);
    return '';
}