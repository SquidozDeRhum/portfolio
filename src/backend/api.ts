import { writeFileSync, readFileSync } from 'fs';

const POSITIONS_PATH = './public/positions.json';

export async function read_request_body(req: import('http').IncomingMessage) {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf-8');
}

export function write_file(file_name: string, content: string) {
    writeFileSync(`./public/${file_name}`, content);
}

export function get_positions() {
    const positions = readFileSync(POSITIONS_PATH).toString('utf-8');
    return positions;
}