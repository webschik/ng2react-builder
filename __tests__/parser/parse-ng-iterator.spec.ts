import parseNgIterator from '../../src/parser/parse-ng-iterator';

describe('Parser', () => {
    describe('parseNgIterator()', () => {
        const ngInterpolateOptions = {
            bindOnce: '::',
            startSymbol: '{{',
            endSymbol: '}}'
        };

        it('should throw an error for invalid expression', () => {
            let error: Error;

            try {
                parseNgIterator('Test expression', ngInterpolateOptions);
            } catch (e) {
                error = e;
            }

            expect(error).toEqual(new Error('Invalid iterator expression \'Test expression\''));
        });

        it('should throw an error for invalid left-side expression of the iterator', () => {
            let error: Error;

            try {
                parseNgIterator('() in numbers', ngInterpolateOptions);
            } catch (e) {
                error = e;
            }

            expect(error).toEqual(new Error('Invalid left-side expression () in iterator \'() in numbers\''));
        });

        it('should throw an error for invalid alias in the iterator', () => {
            let error: Error;

            try {
                parseNgIterator('number in numbers as this', ngInterpolateOptions);
            } catch (e) {
                error = e;
            }

            expect(error).toEqual(new Error(
                'Iterator alias this is invalid - must be a valid JS identifier which is not a reserved name'
            ));
        });

        it('should convert limitTo filter', () => {
            expect(parseNgIterator('number in numbers | limitTo:numLimit', ngInterpolateOptions)).toEqual({
                aliasAs: undefined,
                collectionIdentifier: 'numbers',
                collectionTransform: ['.slice(0, 0 + numLimit)'],
                keyIdentifier: undefined,
                valueIdentifier: 'number'
            });

            expect(parseNgIterator(
                'number in numbers | limitTo : numLimit : limitBegin', ngInterpolateOptions
            )).toEqual({
                aliasAs: undefined,
                collectionIdentifier: 'numbers',
                collectionTransform: ['.slice(limitBegin, limitBegin + numLimit)'],
                keyIdentifier: undefined,
                valueIdentifier: 'number'
            });
        });

        it('should convert custom filter', () => {
            expect(parseNgIterator('item in list | customFilter:param', ngInterpolateOptions)).toEqual({
                aliasAs: undefined,
                collectionIdentifier: 'list',
                collectionTransform: ['.customFilter(param)'],
                keyIdentifier: undefined,
                valueIdentifier: 'item'
            });

            expect(parseNgIterator('item in list | customFilter: param1: param2', ngInterpolateOptions)).toEqual({
                aliasAs: undefined,
                collectionIdentifier: 'list',
                collectionTransform: ['.customFilter(param1, param2)'],
                keyIdentifier: undefined,
                valueIdentifier: 'item'
            });
        });
    });
});