import {transform, GeneratedComponent} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component6', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component6/template.html',
                './component6/index.tsx'
            ).then(([template, componentCode]: string[]) => {
                const generatedComponents: GeneratedComponent[] = transform({
                    react: {
                        typescript: true
                    },
                    replaceDirectives: {
                        'ng-view': {
                            tagName: 'Switch'
                        }
                    },
                    components: [
                        {
                            template,
                            componentName: 'PhoneDetail'
                        }
                    ]
                });

                expect(generatedComponents).toEqual([{code: componentCode}]);
            });
        });
    });
});