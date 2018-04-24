import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component2', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component2/template.html',
                './component2/index.tsx'
            ).then(([template, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template: {code: template},
                            componentName: 'Icon',
                            componentType: 'stateless'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});