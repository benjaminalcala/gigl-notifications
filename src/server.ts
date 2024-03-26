import http from 'http';

import 'express-async-errors';
import { Application } from 'express';
import { winstonLogger } from '@benjaminalcala/gigl-shared';
import { config } from '@notifications/config';
import { healthRoutes } from '@notifications/routes';
import { checkElasticHealth } from '@notifications/elasticsearch';
import { createConnection } from '@notifications/queues/connection';
import { consumeOrderQueue, consumeAuthQueue } from '@notifications/queues/email.consumer';
import { Channel } from 'amqplib';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');
const PORT = 4001;

export function start(app: Application): void {
  startServer(app);
  app.use('./', healthRoutes);
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel: Channel = (await createConnection()) as Channel;
  await consumeAuthQueue(emailChannel);
  await consumeOrderQueue(emailChannel);
}

function startElasticSearch(): void {
  checkElasticHealth();
}

function startServer(app: Application) {
  try {
    const server: http.Server = new http.Server(app);
    log.info(`Workder with process id of ${process.pid} has started on NotificationServer`);
    server.listen(PORT, () => {
      log.info('Notification Server running on port ', PORT);
    });
  } catch (error) {
    log.error('NotificationService startServer() method:', error);
  }
}
