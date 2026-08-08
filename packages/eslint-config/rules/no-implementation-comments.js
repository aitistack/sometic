const allowedLicensePattern =
    /(?:^|\n)(?:SPDX-License-Identifier:|@license|Copyright|Licensed under)/i;

function isAllowedComment(comment) {
    const value = comment.value.trim();
    if (comment.type === "Shebang") {
        return true;
    }
    if (allowedLicensePattern.test(value)) {
        return true;
    }
    if (/^eslint(?:-|\s)/.test(value) || /^ts-/.test(value) || /^@ts-/.test(value)) {
        return true;
    }
    if (/^vite-/.test(value) || /^webpack-/.test(value) || /^istanbul\s+ignore/.test(value)) {
        return true;
    }
    return false;
}

const noImplementationComments = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow comments in implementation files except license headers and required directives",
        },
        schema: [],
        messages: {
            unexpected:
                "Implementation comments are forbidden. Move explanation to documentation. Allowed: license headers and required tooling directives.",
        },
    },
    create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    if (!isAllowedComment(comment)) {
                        context.report({
                            loc: comment.loc,
                            messageId: "unexpected",
                        });
                    }
                }
            },
        };
    },
};

export default noImplementationComments;
