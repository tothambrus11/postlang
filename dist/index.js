"use strict";
/*import * as fs from "fs";
import * as util from "util";

console.clear();
console.log("==============================================================================================");
fs.readFile("deutsch.ptl", (err, data) => {
    if (err) {
        throw err;
    }
    let text = data.toString();

    parseCode(text).forEach(value => {
        console.log(util.inspect(value, false, null, true));
    })
});*/
exports.__esModule = true;
function unescapeString(text) {
    return text.replace(/\\"/g, '"');
}
var LexemeType;
(function (LexemeType) {
    LexemeType[LexemeType["string"] = 0] = "string";
    LexemeType[LexemeType["openingParenthesis"] = 1] = "openingParenthesis";
    LexemeType[LexemeType["closingParenthesis"] = 2] = "closingParenthesis";
    LexemeType[LexemeType["openingCurlyBrace"] = 3] = "openingCurlyBrace";
    LexemeType[LexemeType["closingCurlyBrace"] = 4] = "closingCurlyBrace";
    LexemeType[LexemeType["openingSquareBracket"] = 5] = "openingSquareBracket";
    LexemeType[LexemeType["closingSquareBracket"] = 6] = "closingSquareBracket";
    LexemeType[LexemeType["componentName"] = 7] = "componentName";
    LexemeType[LexemeType["attributeName"] = 8] = "attributeName";
    LexemeType[LexemeType["attributeEqualSign"] = 9] = "attributeEqualSign";
})(LexemeType = exports.LexemeType || (exports.LexemeType = {}));
/**
 * It makes something out of sh1t
 * @param code
 */
function lex(code) {
    code += " ";
    var lexemes = [];
    var strings = getStringsInText(code);
    var lineCount = 1;
    var columnCount = 0;
    for (var i = 0; i < code.length; i++) {
        var c = code[i];
        columnCount++;
        if (c == "\n") {
            lineCount++;
            columnCount = 0;
        }
        else if (c === '"') {
            if (code.substring(i).indexOf(strings[0]) == 0) {
                lexemes.push({
                    type: LexemeType.string,
                    content: strings[0],
                    startPos: {
                        line: lineCount,
                        column: columnCount
                    }
                });
                i += strings[0].length - 1;
                strings.shift();
            }
        }
        else if (c === "[") {
            lexemes.push({
                type: LexemeType.openingSquareBracket,
                content: "["
            });
        }
        else if (c === "]") {
            lexemes.push({
                type: LexemeType.closingSquareBracket,
                content: "]"
            });
        }
        else if (c === "(") {
            var endPos = i;
            while (true) {
                endPos--;
                if (endPos < 0) {
                    throw new Error("Component name not found");
                }
                if (!code[endPos].match(/\s/)) { // Ha már nem whitespace
                    if (!code[endPos].match(/\w/)) {
                        throw new Error("Invalid component name near " + lineCount + ":" + columnCount);
                    }
                    endPos++;
                    break;
                }
            }
            var startPos = endPos;
            while (startPos > 0) {
                startPos--;
                if (code[startPos].match(/[^\w-]/)) {
                    startPos++;
                    break;
                }
            }
            lexemes.push({
                type: LexemeType.componentName,
                content: code.substring(startPos, endPos)
            });
            lexemes.push({
                type: LexemeType.openingParenthesis,
                content: "("
            });
        }
        else if (c === ")") {
            lexemes.push({
                type: LexemeType.closingParenthesis,
                content: ")"
            });
        }
        else if (c === '{') {
            var foundAttributes = void 0;
            var endPos = i;
            while (true) {
                endPos--;
                if (endPos < 0) {
                    throw new Error("Component name not found");
                }
                if (!code[endPos].match(/\s/)) { // Ha már nem whitespace
                    if (code[endPos] == ")") {
                        foundAttributes = true;
                    }
                    else if (code[endPos].match(/\w/)) {
                        foundAttributes = false;
                    }
                    else {
                        throw new Error("Invalid component syntax near " + lineCount + ":" + columnCount);
                    }
                    endPos++;
                    break;
                }
            }
            if (!foundAttributes) {
                // Komponens addolása
                var startPos = endPos;
                while (startPos > 0) {
                    startPos--;
                    if (code[startPos].match(/[^\w-]/)) { // ez volt itt, de wtf:     if (code[startPos].match(/[^\w-(,]/)) {
                        startPos++;
                        break;
                    }
                }
                lexemes.push({
                    type: LexemeType.componentName,
                    content: code.substring(startPos, endPos)
                });
            }
            lexemes.push({
                type: LexemeType.openingCurlyBrace,
                content: "{"
            });
        }
        else if (c === "}") {
            lexemes.push({
                type: LexemeType.closingCurlyBrace,
                content: "}"
            });
        }
        else if (c.match(/\w/g)) {
            // Olyan tagok, amiknek nincs attribútuma se és contentje se
            // <component-name> csomó whitespace <következő komponens neve>
            var firstMatch = (code.substring(i, code.length - 1).match(/[\w-]+((\s+\w+)|\s*[,\]]|(\s*$))/g) || [])[0];
            if (firstMatch) {
                var shortFirstMatch = firstMatch.match(/[\w-]+/g)[0];
                if (code.indexOf(firstMatch, i) == i) {
                    lexemes.push({
                        type: LexemeType.componentName,
                        content: shortFirstMatch
                    });
                    i += shortFirstMatch.length - 1;
                }
            }
        }
        else if (c == "=") {
            var attributeStart = void 0;
            var attributeEnd = void 0;
            if (i < 1) {
                throw new Error("Not expected equal sign");
            }
            // TODO ERROR HANDLING
            for (var ic = i - 1; ic >= 0; ic--) {
                if (code[ic].match(/[\w-]/g)) {
                    if (!attributeEnd) {
                        attributeEnd = ic + 1;
                    }
                }
                else if (code[ic].match(/([^\w-])/g) && attributeEnd) {
                    attributeStart = ic + 1;
                    break;
                }
                else if (code[ic].match(/\s/g)) {
                }
                else {
                    throw new Error("Wrong attribute at line " + code.substring(0, i).split("\n").length);
                }
            }
            if (!attributeEnd) {
                throw new Error("Attribute end not found");
            }
            if (!attributeStart) {
                throw new Error("Attribute start not found");
            }
            var attributeName = code.substring(attributeStart, attributeEnd);
            lexemes.push({
                type: LexemeType.attributeName,
                content: attributeName
            });
            lexemes.push({
                type: LexemeType.attributeEqualSign,
                content: "="
            });
        }
    }
    lexemes.forEach(function (lexeme) {
        if (lexeme.type === LexemeType.string) {
            lexeme.content = lexeme.content.substring(1, lexeme.content.length - 1).replace(/\\"/g, '"');
        }
    });
    return lexemes;
}
exports.lex = lex;
/**
 * It makes beauty out of something
 * @param lexemes
 */
function parse(lexemes) {
    var componentTree = [];
    for (var i = 0; i < lexemes.length;) {
        var cucc = parseContent(i, lexemes);
        componentTree.push(cucc.content);
        i = cucc.i;
    }
    return componentTree;
}
exports.parse = parse;
function parseCode(code) {
    return parse(lex(code));
}
exports.parseCode = parseCode;
function parseContent(i, lexemes) {
    var content;
    if (!lexemes[i]) {
        throw new Error("Invalid content");
    }
    if (lexemes[i].type == LexemeType.string) { // A content egy string
        content = lexemes[i].content;
        i++;
    }
    else if (lexemes[i].type == LexemeType.componentName) { // A content egy komponens
        if (lexemes[i + 1] && lexemes[i + 1].type == LexemeType.openingParenthesis) { // Van attribútum, lehet hogy van content is
            var attributes = {};
            var componentName = lexemes[i].content;
            i += 2;
            while (true) { // adding attributes
                if (lexemes[i].type == LexemeType.closingParenthesis) {
                    i++;
                    break;
                }
                if (lexemes[i].type != LexemeType.attributeName) {
                    throw new Error("lexemes[" + i + "] was expected to be an attribute name."); // TODO code pos
                }
                if (lexemes[i + 1].type != LexemeType.attributeEqualSign) {
                    throw new Error("lexemes[" + (i + 1) + "] was expected to be an equal sign."); // TODO code pos
                }
                if (lexemes[i + 2].type != LexemeType.string) {
                    throw new Error("Attribute value must be a string"); // TODO code pos
                }
                attributes[lexemes[i].content] = lexemes[i + 2].content;
                i += 3;
                if (i >= lexemes.length) {
                    throw new Error("Missing closing curly brace");
                }
            }
            if (lexemes[i] && lexemes[i].type == LexemeType.openingCurlyBrace) { // Van content
                i++;
                var cucc = parseContent(i, lexemes);
                content = {
                    componentName: componentName,
                    attributes: attributes,
                    content: cucc.content || null
                };
                i = cucc.i + 1; // + 1 stands for the closing curly brace.
                if (!lexemes[cucc.i] || lexemes[cucc.i].type !== LexemeType.closingCurlyBrace) { // todo test
                    throw new Error("Missing closing curly brace");
                }
            }
            else {
                content = {
                    componentName: componentName,
                    attributes: attributes,
                    content: null
                };
            }
        }
        else if (lexemes[i + 1] && lexemes[i + 1].type == LexemeType.openingCurlyBrace) { // Nincs attribútum, content most jön
            var componentName = lexemes[i].content;
            var cucc = parseContent(i + 2, lexemes);
            i = cucc.i + 1; // + 1 stands for the closing curly brace.
            if (!lexemes[cucc.i] || lexemes[cucc.i].type !== LexemeType.closingCurlyBrace) {
                throw new Error("Missing closing curly brace");
            }
            content = {
                attributes: {},
                componentName: componentName,
                content: cucc.content || null
            };
        }
        else { // Nincs content, nincs attribútum
            content = {
                attributes: {},
                componentName: lexemes[i].content,
                content: null
            };
            i++;
        }
    }
    else if (lexemes[i].type == LexemeType.openingSquareBracket) { // A content egy tömb
        content = [];
        i++;
        while (true) {
            if (lexemes[i].type == LexemeType.closingSquareBracket) {
                i++;
                break;
            }
            else if (lexemes[i].type == LexemeType.string || lexemes[i].type == LexemeType.openingSquareBracket || lexemes[i].type == LexemeType.componentName) {
                var cucc = parseContent(i, lexemes);
                i = cucc.i;
                content.push(cucc.content);
            }
            else {
                throw new Error("Missing closing square bracket");
            }
        }
    }
    return { content: content, i: i };
}
exports.parseContent = parseContent;
function getCodePos(pos0, text) {
    var endPos = { line: pos0.line, column: pos0.column };
    for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (c == "\n") {
            endPos.line++;
            endPos.column = 1;
        }
        else if (i != 0) {
            endPos.column++;
        }
    }
    return endPos;
}
function getStringsInText(text) {
    return text.match(/"(?:[^"\\]|\\.)*"/g);
}
