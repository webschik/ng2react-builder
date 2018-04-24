import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component5', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component5/template.html',
                './component5/index.tsx'
            ).then(([template, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template: {code: template},
                            componentName: 'PhoneDetail'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});