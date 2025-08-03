import { Request } from 'express';
import morgan from 'morgan';

export const logger = morgan((tokens, req, res) => {
  const timestamp = new Date().toISOString();
  const remoteIp = tokens['remote-addr'](req, res) ?? '-';
  const requestMethod = tokens.method(req, res) ?? '-';
  const requestUrl = tokens.url(req, res) ?? '-';
  const status = tokens.status(req, res) ?? '-';
  const responseTimeMs = tokens['response-time'](req, res);

  // Format response time like winston format
  const formatResponseTime = (timeMs: string | undefined): string => {
    if (!timeMs || timeMs === '-') return '-';
    const ms = parseFloat(timeMs);
    return ms >= 1000 ? `${(ms / 1000).toFixed(3)} s` : `${ms.toFixed(3)} ms`;
  };

  const responseTime = formatResponseTime(responseTimeMs);

  return `${timestamp} ${remoteIp} ${requestMethod} ${requestUrl} ${status} - ${responseTime}`;
});
