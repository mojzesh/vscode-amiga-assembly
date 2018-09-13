import { Range, Uri, workspace } from 'vscode';
import { ASMLine } from './parser';

export class SymbolFile {
    private uri: Uri;
    private definedSymbols = new Array<Symbol>();
    //private importedFiles = new Array<SymbolFile>();

    constructor(uri: Uri) {
        this.uri = uri;
    }

    public readFile(): Promise<SymbolFile> {
        return new Promise(async (resolve, reject) => {
            // Read the file
            let document = await workspace.openTextDocument(this.uri);
            if (document) {
                for (let i = 0; i < document.lineCount; i++) {
                    let line = document.lineAt(i);
                    let asmLine = new ASMLine(line.text, line);
                    let [symbol, range] = asmLine.getSymbolFromLabel();
                    if ((symbol !== undefined) && (range !== undefined)) {
                        this.definedSymbols.push(new Symbol(symbol, this, range));
                    }
                }
                resolve(this);
            } else {
                reject(new Error("Error opening document: '" + this.uri + "'"));
            }
        });
    }
    public getUri(): Uri {
        return this.uri;
    }
    public getDefinedSymbols(): Array<Symbol> {
        return this.definedSymbols;
    }
}

export class Symbol {
    private label: string;
    private file: SymbolFile;
    private range: Range;
    constructor(label: string, file: SymbolFile, range: Range) {
        this.label = label;
        this.file = file;
        this.range = range;
    }
    public getFile(): SymbolFile {
        return this.file;
    }
    public getRange(): Range {
        return this.range;
    }
    public getLabel(): string {
        return this.label;
    }
}