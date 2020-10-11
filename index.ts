


// todo két ugyanolyan string egymás után

export interface Lexeme {
    type: LexemeType,
    content: string,
    startPos?: CodePosition;
    endPos?: CodePosition;
}


export interface Component {
    componentName?: string;
    attributes: Attributes;
    content: Content
}

export type Attributes = { [key: string]: any }

export interface CodePosition {
    column: number;
    line: number;
}

export enum LexemeType {
    string,
    openingParenthesis,
    closingParenthesis,
    openingCurlyBrace,
    closingCurlyBrace,
    openingSquareBracket,
    closingSquareBracket,
    componentName,
    attributeName,
    attributeEqualSign,
}

/**
 * It makes something out of sh1t
 * @param code
 */
export function lex(code: string): Lexeme[] {
    code += " ";

    let lexemes: Lexeme[] = [];

    let strings = getStringsInText(code);
    let lineCount = 1;
    let columnCount = 0;
    for (let i = 0; i < code.length; i++) {
        let c = code[i];

        columnCount++;
        if (c == "\n") {
            lineCount++;
            columnCount = 0;
        } else if (c === '"') {
            if (code.substring(i).indexOf(strings[0]) == 0) {
                lexemes.push({
                    type: LexemeType.string,
                    content: strings[0],
                    startPos: {
                        line: lineCount,
                        column: columnCount
                    },
                });
                i += strings[0].length - 1;
                strings.shift();
            }
        } else if (c === "[") {
            lexemes.push({
                type: LexemeType.openingSquareBracket,
                content: "["
            })
        } else if (c === "]") {
            lexemes.push({
                type: LexemeType.closingSquareBracket,
                content: "]"
            })
        } else if (c === "(") {
            let endPos = i;
            while (true) {
                endPos--;
                if (!code[endPos].match(/\s/)) { // Ha már nem whitespace
                    if (!code[endPos].match(/\w/)) {
                        throw new Error(`Invalid component name near ${lineCount}:${columnCount}`);
                    }
                    endPos++;
                    break;
                }
            }
            let startPos = endPos;
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
            })
        } else if (c === ")") {
            lexemes.push({
                type: LexemeType.closingParenthesis,
                content: ")"
            })
        } else if (c === '{') {
            let foundAttributes: boolean;
            let endPos = i;
            while (true) {
                endPos--;
                if (!code[endPos].match(/\s/)) { // Ha már nem whitespace
                    if (code[endPos] == ")") {
                        foundAttributes = true;
                    } else if (code[endPos].match(/\w/)) {
                        foundAttributes = false;
                    } else {
                        throw new Error(`Invalid component syntax near ${lineCount}:${columnCount}`);
                    }
                    endPos++;
                    break;
                }
            }

            if (!foundAttributes) {
                // Komponens addolása
                let startPos = endPos;
                while (startPos > 0) {
                    startPos--;
                    if (code[startPos].match(/[^\w-(,]/)) {
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
        } else if (c === "}") {
            lexemes.push({
                type: LexemeType.closingCurlyBrace,
                content: "}"
            })
        } else if (c.match(/\w/g)) {
            // Olyan tagok, amiknek nincs attribútuma se és contentje se
            // <component-name> csomó whitespace <következő komponens neve>
            let firstMatch = (code.substring(i, code.length - 1).match(/[\w-]+((\s+\w+)|\s*[,\]]|(\s*$))/g) || [])[0];
            if (firstMatch) {
                let shortFirstMatch = firstMatch.match(/[\w-]+/g)[0];
                if (code.indexOf(firstMatch, i) == i) {
                    lexemes.push({
                        type: LexemeType.componentName,
                        content: shortFirstMatch
                    });
                    i += shortFirstMatch.length - 1;
                }
            }
        } else if (c == "=") {
            let attributeStart: number;
            let attributeEnd: number;

            for (let ic = i - 1; ic >= 0; ic--) {
                if (code[ic].match(/[\w-]/g)) {
                    if (!attributeEnd) {
                        attributeEnd = ic + 1;
                    }
                } else if (code[ic].match(/([^\w-])/g) && attributeEnd) {
                    attributeStart = ic + 1;
                    break;
                } else if (code[ic].match(/\s/g)) {

                } else {
                    throw new Error("Wrong attribute at line " + code.substring(0, i).split("\n").length)
                }
            }

            if (!attributeEnd) {
                throw new Error("Parser error, [attributeEnd] not found");
            }
            let attributeName = code.substring(attributeStart, attributeEnd);
            lexemes.push({
                type: LexemeType.attributeName,
                content: attributeName
            });
            lexemes.push({
                type: LexemeType.attributeEqualSign,
                content: "="
            })
        }

    }

    lexemes.forEach(lexeme => {
        if (lexeme.type === LexemeType.string) {
            lexeme.content = lexeme.content.substring(1, lexeme.content.length - 1);
        }
    });

    return lexemes;
}

/**
 * It makes beauty out of something
 * @param lexemes
 */
export function parse(lexemes: Lexeme[]): Component[] {
    let componentTree: Component[] = [];
    for (let i = 0; i < lexemes.length;) {
        const cucc = parseContent(i, lexemes);
        componentTree.push(cucc.content as Component);
        i = cucc.i;
        "s";

    }
    return componentTree;
}

export function parseCode(code: string): Component[] {
    return parse(lex(code));
}

export type Content = string | Component | ContentArray;

export interface ContentArray extends Array<Content> {
};

export function parseContent(i: number, lexemes: Lexeme[]): { content: Content, i: number } {
    let content: Content;

    if (lexemes[i].type == LexemeType.string) { // A content egy string
        content = lexemes[i].content;
        i++;
    } else if (lexemes[i].type == LexemeType.componentName) { // A content egy komponens
        if (lexemes[i + 1] && lexemes[i + 1].type == LexemeType.openingParenthesis) { // Van attribútum, lehet hogy van content is
            let attributes = {};
            let componentName = lexemes[i].content;
            i += 2;
            while (true) { // adding attributes
                if (lexemes[i].type == LexemeType.closingParenthesis) {
                    i++;
                    break;
                }
                if (lexemes[i].type != LexemeType.attributeName) {
                    throw new Error(`lexemes[${i}] was expected to be an attribute name.`); // TODO code pos
                }
                if (lexemes[i + 1].type != LexemeType.attributeEqualSign) {
                    throw new Error(`lexemes[${i + 1}] was expected to be an equal sign.`) // TODO code pos
                }
                if (lexemes[i + 2].type != LexemeType.string) {
                    throw new Error(`lexemes[${i + 2}] was expected to be a string`) // TODO code pos
                }
                attributes[lexemes[i].content as string] = lexemes[i + 2].content as string;
                i += 3;
            }
            if (lexemes[i] && lexemes[i].type == LexemeType.openingCurlyBrace) { // Van content
                i++;
                let cucc = parseContent(i, lexemes);
                content = {
                    componentName,
                    attributes,
                    content: cucc.content || null
                };
                i = cucc.i + 1; // + 1 stands for the closing curly brace.
            } else {
                content = {
                    componentName,
                    attributes,
                    content: null
                }
            }
        } else if (lexemes[i + 1] && lexemes[i + 1].type == LexemeType.openingCurlyBrace) { // Nincs attribútum, content most jön
            let componentName = lexemes[i].content;
            let cucc = parseContent(i + 2, lexemes);
            i = cucc.i + 1; // + 1 stands for the closing curly brace.
            content = {
                attributes: {},
                componentName: componentName,
                content: cucc.content || null
            }
        } else { // Nincs content, nincs attribútum
            content = {
                attributes: {},
                componentName: lexemes[i].content,
                content: null
            };
            i++;
        }
    } else if (lexemes[i].type == LexemeType.openingSquareBracket) { // A content egy tömb
        content = [];
        i++;
        while (true) {
            if (lexemes[i].type == LexemeType.closingSquareBracket) {
                i++;
                break;
            }

            let cucc = parseContent(i, lexemes);
            i = cucc.i;
            content.push(cucc.content);
        }
    }
    return {content, i};
}

function getCodePos(pos0: CodePosition, text: string) {
    let endPos: CodePosition = {line: pos0.line, column: pos0.column};
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c == "\n") {
            endPos.line++;
            endPos.column = 1;
        } else if (i != 0) {
            endPos.column++;
        }
    }
    return endPos;
}

function getStringsInText(text: string) {
    return text.match(/"(?:[^"\\]|\\.)*"/g);
}
