const express = require('express');
const crypto = require('crypto');
const { execFile } = require('child_process');

const router = express.Router();

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const DEPLOY_BRANCH = 'refs/heads/production';

function verifySignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.body).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

router.post(
  '/deploy-webhook',
  express.raw({ type: 'application/json', limit: '5mb' }),
  (req, res) => {
    if (!verifySignature(req)) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    let payload;
    try {
      payload = JSON.parse(req.body.toString('utf8'));
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid JSON' });
    }

    const event = req.headers['x-github-event'];
    if (event !== 'push') {
      return res.status(200).json({ success: true, message: 'Ignored non-push event' });
    }

    if (payload.ref !== DEPLOY_BRANCH) {
      return res.status(200).json({ success: true, message: `Ignored branch ${payload.ref}` });
    }

    res.status(200).json({ success: true, message: 'Deploy triggered' });

    const child = execFile('/bin/bash', ['/home/hjienmqchosting/deploy.sh'], { detached: true });
    child.unref();
  },
);

module.exports = router;
