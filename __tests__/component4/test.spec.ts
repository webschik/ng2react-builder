import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component4', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component4/template.html',
                './component4/controller.js',
                './component4/index.tsx'
            ).then(([template, controllerCode, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template: {code: template},
                            controller: {
                                name: 'PhoneDetailController',
                                code: controllerCode
                            },
                            componentName: 'PhoneList',
                            componentType: 'stateful'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});