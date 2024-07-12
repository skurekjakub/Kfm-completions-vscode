import { SYMBOLS, Scope } from "./constants";

interface TokenData {
    scope: Scope,
}

interface LineContext {
    currentScope: Scope,
    cursorPosition: Number,
    tokenData: TokenData[]
}

// export const parseLine = (line: string, position: Number): LineContext => {

//     const tokens = tokenize(line);

//     return context
// }

const tokenize = (line: string) => {
    const tokens = line.split(' ');
    return decorate(tokens);
}

const decorate = (tokens: string[]) => {
    tokens.forEach(token => {
        switch (token) {
            case SYMBOLS.TAG_OPEN:

            default:

        }
    });
};
