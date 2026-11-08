import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import { vi } from 'vitest';
import { GmailService } from './gmail.service.ts';

vi.mock('nodemailer', () => ({
  default: { createTransport: vi.fn() },
}));

describe('GmailService', () => {
  it('sends the code through TLS SMTP with the configured app password', async () => {
    const sendMail = vi
      .fn()
      .mockResolvedValue({ accepted: ['student@dimigo.hs.kr'] });
    vi.mocked(nodemailer.createTransport).mockReturnValue({
      sendMail,
    } as never);
    const settings: Record<string, string> = {
      GMAIL_SMTP_USER: 'council@dimigo.hs.kr',
      GMAIL_APP_PASSWORD: 'app-password',
    };
    const config = {
      getOrThrow: (key: string) => settings[key],
    } as ConfigService;
    await new GmailService(config).sendCode('student@dimigo.hs.kr', '123456');

    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.gmail.com',
      secure: true,
      auth: { user: 'council@dimigo.hs.kr', pass: 'app-password' },
    });
    expect(sendMail).toHaveBeenCalledWith({
      from: 'council@dimigo.hs.kr',
      to: 'student@dimigo.hs.kr',
      subject: '[디미고 학생회] 인증번호를 안내해드립니다.',
      text: expect.stringContaining('123456'),
    });
  });
});
