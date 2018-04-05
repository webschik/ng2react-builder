import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {createReactComponent} from '../src';

const readFile = promisify(fs.readFile);

describe('createReactComponent()', () => {
    xdescribe('component1', () => {
        it('should generate TSX component', () => {
            return Promise.all<string>([
                readFile(path.resolve(__dirname, './component1/template.html'), 'utf8'),
                readFile(path.resolve(__dirname, './component1/index.tsx'), 'utf8')
            ]).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    replaceDirectives: {
                        'my-icon': {
                            tagName: 'Icon',
                            valueProp: 'type'
                        }
                    },
                    react: {
                        typescript: true,
                        componentName: 'TestComponent'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
    xdescribe('component2', () => {
        it('should generate TSX component', () => {
            return Promise.all<string>([
                readFile(path.resolve(__dirname, './component2/template.html'), 'utf8'),
                readFile(path.resolve(__dirname, './component2/index.tsx'), 'utf8')
            ]).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'Icon',
                        componentType: 'stateless'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
    describe('component3', () => {
        it('should generate TSX component', () => {
            return Promise.all<string>([
                readFile(path.resolve(__dirname, './component3/template.html'), 'utf8'),
                readFile(path.resolve(__dirname, './component3/index.tsx'), 'utf8')
            ]).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'TestComponent'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});