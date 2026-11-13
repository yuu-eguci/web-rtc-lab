// テスト用の静的ファイルサーバです。 Docker の nginx と同じくリポジトリ直下を配信します。
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = join(import.meta.dirname, '..');
const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

createServer(async (req, res) => {
  try {
    const path = normalize(decodeURIComponent(new URL(req.url!, 'http://localhost').pathname));
    const file = join(root, path.endsWith('/') ? `${path}index.html` : path);
    if (!file.startsWith(root) || !(await stat(file)).isFile()) {
      throw new Error('not found');
    }
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404).end();
  }
}).listen(4173, 'localhost');
