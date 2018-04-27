import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component8', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component8/template.html',
                './component8/controller.js',
                './component8/index.tsx'
            ).then(([template, controllerCode, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template: {code: template},
                            controller: {
                                name: 'ContactDetailController',
                                code: controllerCode
                            },
                            componentType: 'stateful',
                            componentName: 'ContactDetail'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});