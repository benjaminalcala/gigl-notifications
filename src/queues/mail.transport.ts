import { winstonLogger, IEmailLocals } from '@benjaminalcala/gigl-shared';
import { config } from '@notifications/config';
import { emailTemplates } from '@notifications/helpers';

const log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'queueConsumersServer', 'debug');

export async function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> {
  console.log('sdfdsfdsfdsfs', receiverEmail);
  try {
    await emailTemplates(template, receiverEmail, locals);
    log.info('Email sent successfully');
  } catch (error) {
    log.error(`Notification server sendMail(): ${error}`);
  }
}
