import { winstonLogger } from '@benjaminalcala/gigl-shared';
import { start } from '@notifications/server';
import express, { Express } from 'express';
import { config } from '@notifications/config';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationAppServer', 'debug');

function initialize() {
  const app: Express = express();
  start(app);

  log.info('Notification server initialized');
}

initialize();
