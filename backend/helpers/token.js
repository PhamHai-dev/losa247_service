const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const configFor = (audience) => ({ secret: audience === 'admin' ? env.JWT_ADMIN_SECRET : env.JWT_CLIENT_SECRET, audience: `losa-${audience}` });
const userId = (user) => String(user.id || user._id);
const signAccessToken = (user, audience) => { const c = configFor(audience); return jwt.sign({ id: userId(user), tokenType: 'access' }, c.secret, { algorithm: 'HS256', expiresIn: '15m', issuer: env.JWT_ISSUER, audience: c.audience, jwtid: crypto.randomUUID() }); };
const createRefreshToken = (user, audience, familyId = crypto.randomUUID()) => { const c = configFor(audience); const jti = crypto.randomUUID(); const token = jwt.sign({ id: userId(user), tokenType: 'refresh', familyId }, c.secret, { algorithm: 'HS256', expiresIn: '7d', issuer: env.JWT_ISSUER, audience: c.audience, jwtid: jti }); return { token, jti, familyId, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) }; };
const verifyToken = (token, audience, tokenType) => { const c = configFor(audience); const decoded = jwt.verify(token, c.secret, { algorithms: ['HS256'], issuer: env.JWT_ISSUER, audience: c.audience }); if (decoded.tokenType !== tokenType) throw new jwt.JsonWebTokenError('Invalid token type'); return decoded; };
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const cookieName = (audience) => `losa_${audience}_refresh`;
const cookiePath = (audience) => audience === 'admin' ? '/api/v1/admin/auth' : '/api/v1/auth';
const cookieOptions = (audience) => ({ httpOnly: true, secure: env.COOKIE_SECURE, sameSite: env.COOKIE_SAME_SITE, path: cookiePath(audience), maxAge: REFRESH_TTL_MS });
const setRefreshCookie = (res, audience, token) => res.cookie(cookieName(audience), token, cookieOptions(audience));
const clearRefreshCookie = (res, audience) => res.clearCookie(cookieName(audience), { httpOnly: true, secure: env.COOKIE_SECURE, sameSite: env.COOKIE_SAME_SITE, path: cookiePath(audience) });
const readRefreshCookie = (req, audience) => req.cookies?.[cookieName(audience)];
const serializeUser = (user, extra = {}) => ({ id: user.id || user._id, name: user.name, email: user.email, phone: user.phone, role: user.role || user.roleName, status: user.status, avatarUrl: user.avatarUrl, ...extra });
module.exports = { signAccessToken, createRefreshToken, verifyToken, hashToken, setRefreshCookie, clearRefreshCookie, readRefreshCookie, serializeUser };
