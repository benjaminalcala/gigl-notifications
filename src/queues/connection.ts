import client, { Channel, Connection } from 'amqplib';
import { config } from '@notifications/config';
import { winstonLogger } from '@benjaminalcala/gigl-shared';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueServer', 'debug');

export async function createConnection(): Promise<Channel | undefined> {
  try {
    const connection: Connection = await client.connect(config.RABBITMQ_ENDPOINT as string);
    const channel: Channel = await connection.createChannel();
    log.info('Notification service has connected to queue successfully');
    closeConnection(connection, channel);

    return channel;
  } catch (error) {
    log.error(`Notification service createConnection() error: ${error}`);
    return undefined;
  }
}

function closeConnection(connection: Connection, channel: Channel): void {
  process.once('SIGINT', async () => {
    await connection.close();
    await channel.close();
  });
}
