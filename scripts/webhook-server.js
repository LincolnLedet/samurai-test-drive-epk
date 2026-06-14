import http from 'http';
import crypto from 'crypto';
import { exec } from 'child_process';

const PORT = 9001;
const SECRET = process.env.WEBHOOK_SECRET || 'change-this-secret';
const DEPLOY_SCRIPT = '/home/ubuntu/samurai-test-drive-epk/scripts/deploy.sh';

function verifySignature(payload, signature) {
    if (!signature) return false;
    const hmac = crypto.createHmac('sha256', SECRET);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'];

            if (!verifySignature(body, signature)) {
                console.log(`${new Date().toISOString()}: Invalid signature`);
                res.writeHead(401);
                res.end('Unauthorized');
                return;
            }

            try {
                const payload = JSON.parse(body);
                const branch = payload.ref?.replace('refs/heads/', '');

                if (branch === 'main' || branch === 'master') {
                    console.log(`${new Date().toISOString()}: Push to ${branch}, deploying...`);

                    exec(`bash ${DEPLOY_SCRIPT}`, (err, stdout, stderr) => {
                        if (err) {
                            console.error('Deploy error:', stderr);
                        } else {
                            console.log('Deploy output:', stdout);
                        }
                    });

                    res.writeHead(200);
                    res.end('Deploying...');
                } else {
                    console.log(`${new Date().toISOString()}: Push to ${branch}, ignoring`);
                    res.writeHead(200);
                    res.end('Ignored (not main branch)');
                }
            } catch (e) {
                console.error('Parse error:', e);
                res.writeHead(400);
                res.end('Bad request');
            }
        });
    } else {
        res.writeHead(200);
        res.end('Samurai webhook server');
    }
});

server.listen(PORT, () => {
    console.log(`Webhook server listening on port ${PORT}`);
});
