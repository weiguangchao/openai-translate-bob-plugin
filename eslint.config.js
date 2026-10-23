const noComments = {
  meta: {
    type: 'problem',
    schema: [],
    messages: { forbidden: 'Comments are not allowed.' }
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          context.report({ loc: comment.loc, messageId: 'forbidden' });
        }
      }
    };
  }
};

module.exports = [
  { ignores: ['dist/**'] },
  {
    linterOptions: { noInlineConfig: true },
    plugins: { local: { rules: { 'no-comments': noComments } } },
    rules: { 'local/no-comments': 'error' }
  }
];
