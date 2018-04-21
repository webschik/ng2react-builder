import {createReactComponent} from '../../src/index';
import readFiles from '../read-files';

describe('createReactComponent()', () => {
    describe('component7', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component7/template.html',
                './component7/controller.js',
                './component7/index.tsx'
            ).then(([template, controllerCode, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    controller: {
                        name: 'ArticleCtrl',
                        code: controllerCode
                    },
                    react: {
                        typescript: true,
                        componentName: 'RealWorld'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});