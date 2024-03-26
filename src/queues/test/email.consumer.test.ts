import amqp from 'amqplib';
import * as connection from '@notifications/queues/connection';
import {
  consumeAuthQueue,
  AUTH_QUEUE,
  AUTH_EXCHANGE,
  AUTH_KEY,
  consumeOrderQueue,
  ORDER_QUEUE,
  ORDER_EXCHANGE,
  ORDER_KEY
} from '@notifications/queues/email.consumer';

jest.mock('@notifications/queues/connection');
jest.mock('amqplib');
jest.mock('@benjaminalcala/gigl-shared');

describe('Notifications Messages Consumer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('consumeAuthQueue method', () => {
    it('should be called', async () => {
      const channel = {
        assertExchange: jest.fn(),
        assertQueue: jest.fn(),
        bindQueue: jest.fn(),
        consume: jest.fn(),
        ack: jest.fn()
      };

      jest.spyOn(channel, 'assertExchange');
      jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: AUTH_QUEUE, consumerCount: 0, messageCount: 0 });
      jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);
      const authChannel: amqp.Channel | undefined = await connection.createConnection();
      await consumeAuthQueue(authChannel!);
      expect(authChannel?.assertExchange).toHaveBeenCalledWith(AUTH_EXCHANGE, 'direct');
      expect(authChannel?.assertQueue).toHaveBeenCalled();
      expect(authChannel?.bindQueue).toHaveBeenCalledWith(AUTH_QUEUE, AUTH_EXCHANGE, AUTH_KEY);
    });
  });

  describe('consumeOrderQueue method', () => {
    it('should be called', async () => {
      const channel = {
        assertExchange: jest.fn(),
        assertQueue: jest.fn(),
        bindQueue: jest.fn(),
        consume: jest.fn(),
        ack: jest.fn()
      };

      jest.spyOn(channel, 'assertExchange');
      jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: ORDER_QUEUE, consumerCount: 0, messageCount: 0 });
      jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);
      const orderChannel: amqp.Channel | undefined = await connection.createConnection();
      await consumeOrderQueue(orderChannel!);
      expect(orderChannel?.assertExchange).toHaveBeenCalledWith(ORDER_EXCHANGE, 'direct');
      expect(orderChannel?.assertQueue).toHaveBeenCalled();
      expect(orderChannel?.bindQueue).toHaveBeenCalledWith(ORDER_QUEUE, ORDER_EXCHANGE, ORDER_KEY);
    });
  });
});
