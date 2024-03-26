import { IEmailLocals, winstonLogger } from '@benjaminalcala/gigl-shared';
import { config } from '@notifications/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { createConnection } from '@notifications/queues/connection';
import { sendEmail } from '@notifications/queues/mail.transport';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'queueConsumersServer', 'debug');

export const AUTH_EXCHANGE = 'AUTH_CONSUMER_EXCHANGE';
export const AUTH_QUEUE = 'AUTH_CONSUMER_QUEUE';
export const AUTH_KEY = 'AUTH_CONSUMER_KEY';

export const ORDER_EXCHANGE = 'ORDER_CONSUMER_EXCHANGE';
export const ORDER_QUEUE = 'ORDER_CONSUMER_QUEUE';
export const ORDER_KEY = 'ORDER_CONSUMER_KEY';

export async function consumeAuthQueue(channel: Channel) {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange(AUTH_EXCHANGE, 'direct');
    const giglQueue = await channel.assertQueue(AUTH_QUEUE, { durable: true, autoDelete: false });
    await channel.bindQueue(giglQueue.queue, AUTH_EXCHANGE, AUTH_KEY);
    channel.consume(giglQueue.queue, async (msg: ConsumeMessage | null) => {
      const { verifyLink, template, receiverEmail } = JSON.parse(msg!.content.toString());
      const locals: IEmailLocals = {
        verifyLink,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        appLink: `${config.CLIENT_URL}`
      };
      await sendEmail(template, receiverEmail, locals);
      channel.ack(msg!);
    });
  } catch (error) {
    log.error(`Notification service consumeAuthQueue(): ${error}`);
  }
}

export async function consumeOrderQueue(channel: Channel) {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }

    await channel.assertExchange(ORDER_EXCHANGE, 'direct');
    const giglQueue = await channel.assertQueue(ORDER_QUEUE, { durable: true, autoDelete: false });
    await channel.bindQueue(giglQueue.queue, ORDER_EXCHANGE, ORDER_KEY);
    channel.consume(giglQueue.queue, async (msg: ConsumeMessage | null) => {
      const {
        receiverEmail,
        username,
        template,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      } = JSON.parse(msg!.content.toString());
      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        username,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      };
      if (template === 'orderPlaced') {
        await sendEmail('orderPlaced', receiverEmail, locals);
        await sendEmail('orderReceipt', receiverEmail, locals);
      } else {
        await sendEmail(template, receiverEmail, locals);
      }
      channel.ack(msg!);
    });
  } catch (error) {
    log.error(`Notification service consumeOrderQueue(): ${error}`);
  }
}
