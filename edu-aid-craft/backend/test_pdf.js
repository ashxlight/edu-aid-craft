import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const run = async () => {
    try {
        const fakePdfBuffer = Buffer.from('%PDF-1.4\n%EOF\n');
        await pdfParse(fakePdfBuffer);
        console.log("PDF parsed successfully.");
    } catch (e) {
        console.error("PDF parse error:", e.message);
    }
}
run();
