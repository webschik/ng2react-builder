const tsc = require('typescript');

module.exports = {
    process(src, path) {
        if (path.endsWith('.ts')) {
            return tsc.transpile(
                src,
                {
                    target: tsc.ScriptTarget.ES2016,
                    module: tsc.ModuleKind.CommonJS,
                    moduleResolution: tsc.ModuleResolutionKind.NodeJs,
                    jsx: tsc.JsxEmit.React,
                    inlineSourceMap: true
                },
                path,
                []
            );
        }

        return src;
    }
};