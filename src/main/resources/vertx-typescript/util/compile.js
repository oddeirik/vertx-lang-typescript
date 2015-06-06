function compileTypescript(file) {
  var output = "";
  var opts = ts.getDefaultCompilerOptions();

  var host = {
    getDefaultLibFilename: function() {
      return "typescript/bin/" + (opts.target === 2 ? "lib.es6.d.ts" : "lib.d.ts");
    },

    getCurrentDirectory: function() {
      return '';
    },

    useCaseSensitiveFileNames: function() {
      return true;
    },

    getCanonicalFileName: function(name) {
      return name;
    },

    getNewLine: function() {
      return java.lang.System.lineSeparator();
    },

    getSourceFile: function(filename, languageVersion, onError) {
      var body;
      try {
        var input = __typeScriptClassLoader.getSource(filename);
        body = input.toString();
      } catch (e) {
        java.lang.System.out.println(JSON.stringify(ts.Diagnostics));
        if (onError) {
          onError(e.getMessage() || "Unknown error");
        }
        body = "";
      }

      return ts.createSourceFile(filename, body, opts.target, '0');
    },

    writeFile: function(filename, data, writeByteOrderMark, onError) {
      output += data;
    }
  };

  var prog = ts.createProgram([file], opts, host);

  var errs = prog.getDiagnostics();
  if (errs.length) {
    // TODO print diagnostics to errout
    throw errs;
  }

  function reportDiagnostic(diagnostic) {
    var output = "";
    if (diagnostic.file) {
        var loc = diagnostic.file.getLineAndCharacterFromPosition(diagnostic.start);
        output += diagnostic.file.filename + "(" + loc.line + "," + loc.character + "): ";
    }
    var category = ts.DiagnosticCategory[diagnostic.category].toLowerCase();
    output += category + " TS" + diagnostic.code + ": " + diagnostic.messageText + host.getNewLine();
    java.lang.System.err.println(output);
  }

  var checker = prog.getTypeChecker(true);
  errs = checker.getDiagnostics();
  if (errs.length) {
    errs.forEach(function(err) {
      reportDiagnostic(err);
    });
    throw "Could not compile source file " + file;
  }

  checker.emitFiles();

  return output;
}