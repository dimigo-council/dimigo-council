import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class GmailService {
  private transport?: ReturnType<typeof nodemailer.createTransport>;

  constructor(private readonly config: ConfigService) {}

  async sendCode(to: string, code: string): Promise<void> {
    const user = this.config.getOrThrow<string>('GMAIL_SMTP_USER');
    const appPassword = this.config
      .getOrThrow<string>('GMAIL_APP_PASSWORD')
      .replace(/\s+/g, '');
    if (!appPassword) throw new Error('GMAIL_APP_PASSWORD is required');
    this.transport ??= nodemailer.createTransport({
      host: 'smtp.gmail.com',
      secure: true,
      auth: { user, pass: appPassword },
    });

    try {
      const result = await this.transport.sendMail({
        from: user,
        to,
        subject: '[디미고 학생회] 인증번호를 안내해드립니다.',
        text: `아래 인증 번호를 확인하신 후 이메일 인증절차를 완료하세요.\n인증번호: ${code}\n감사합니다.`,
      });
      if (!result.accepted.includes(to))
        throw new Error('Recipient was not accepted');
    } catch {
      throw new InternalServerErrorException(
        'Could not send verification code',
      );
    }
  }
}
