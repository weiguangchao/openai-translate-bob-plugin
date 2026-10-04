var api = require('./api.js');
var languages = require('./languages.js');

function supportLanguages() {
  return Object.keys(languages);
}

// Bob 0.10.2 uses completion, not query.onCompletion or streamRequest.
function translate(query, completion) {
  var completed = false;
  var apiKey = typeof $option.apiKey === 'string' ? $option.apiKey.trim() : '';
  function finish(value) {
    if (completed) return;
    completed = true;
    completion(value);
  }
  function report(error) {
    finish({ error: { type: error.type || 'unknown', message: api.redact(error.message, apiKey) } });
  }
  try {
    var request = api.translationRequest($option, query);
    var from = request.from;
    var to = request.to;
    delete request.from;
    delete request.to;
    request.handler = function (response) {
      try {
        var text = api.translationText(api.responseData(response, apiKey));
        // One paragraph preserves the model's own line breaks on old Bob versions.
        finish({ result: { from: from, to: to, toParagraphs: [text] } });
      } catch (error) { report(error); }
    };
    $http.request(request);
  } catch (error) { report(error); }
}
