export interface Lexeme {
    type: LexemeType;
    content: string;
    startPos?: CodePosition;
    endPos?: CodePosition;
}
export interface Component {
    componentName?: string;
    attributes: Attributes;
    content: Content;
}
export declare type Attributes = {
    [key: string]: any;
};
export interface CodePosition {
    column: number;
    line: number;
}
export declare enum LexemeType {
    string = 0,
    openingParenthesis = 1,
    closingParenthesis = 2,
    openingCurlyBrace = 3,
    closingCurlyBrace = 4,
    openingSquareBracket = 5,
    closingSquareBracket = 6,
    componentName = 7,
    attributeName = 8,
    attributeEqualSign = 9
}
/**
 * It makes something out of sh1t
 * @param code
 */
export declare function lex(code: string): Lexeme[];
/**
 * It makes beauty out of something
 * @param lexemes
 */
export declare function parse(lexemes: Lexeme[]): Component[];
export declare function parseCode(code: string): Component[];
export declare type Content = string | Component | ContentArray;
export interface ContentArray extends Array<Content> {
}
export declare function parseContent(i: number, lexemes: Lexeme[]): {
    content: Content;
    i: number;
};
