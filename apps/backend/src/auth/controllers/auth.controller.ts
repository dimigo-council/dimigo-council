import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  StandardSchemaValidationPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { parseCookie } from 'cookie';
import type { Request, Response } from 'express';
import {
  emailCodeDtoSchema,
  emailDtoSchema,
  googleCallbackDtoSchema,
  onboardingDtoSchema,
  type EmailCodeDto,
  type EmailDto,
  type GoogleCallbackDto,
  type OnboardingDto,
} from '../dto/auth.dto.ts';
import { AuthService } from '../providers/auth.service.ts';
import {
  AllowPending,
  Public,
  type AuthenticatedRequest,
} from '../session.guard.ts';
import { UserService } from '../providers/user.service.ts';
import { Users } from '#/db/schema/index';

const OAUTH_STATE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/auth',
};
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  path: '/auth/refresh',
};

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly user: UserService,
    private readonly config: ConfigService,
  ) {}

  @AllowPending()
  @Get('/ping')
  ping() {
    return 'pong';
  }

  @AllowPending()
  @Get('/profile')
  getProfile(@Req() request: AuthenticatedRequest): Promise<Users> {
    return this.user.getProfile(request.authSession.user.id);
  }

  @Public()
  @Get('/signup/google')
  async signupWithGoogle(@Res({ passthrough: true }) response: Response) {
    const { url, state } = await this.auth.startGoogle('signup');
    response.cookie('oauth_state', state, {
      ...OAUTH_STATE_COOKIE_OPTIONS,
      maxAge: 10 * 60 * 1000,
    });
    return { url };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/signup/google/callback')
  async signupWithGoogleCallback(
    @Body({
      schema: googleCallbackDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: GoogleCallbackDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.finishGoogle('signup', body, request, response);
  }

  @Public()
  @Get('/login/google')
  async loginWithGoogle(@Res({ passthrough: true }) response: Response) {
    const { url, state } = await this.auth.startGoogle('login');
    response.cookie('oauth_state', state, {
      ...OAUTH_STATE_COOKIE_OPTIONS,
      maxAge: 10 * 60 * 1000,
    });
    return { url };
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login/google/callback')
  async loginWithGoogleCallback(
    @Body({
      schema: googleCallbackDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: GoogleCallbackDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.finishGoogle('login', body, request, response);
  }

  private async finishGoogle(
    purpose: 'signup' | 'login',
    body: GoogleCallbackDto,
    request: Request,
    response: Response,
  ) {
    const state = parseCookie(request.headers.cookie ?? '')[
      'oauth_state'
    ];
    response.clearCookie('oauth_state', OAUTH_STATE_COOKIE_OPTIONS);
    const callbackUrl = new URL(
      this.config.getOrThrow<string>(
        purpose === 'signup'
          ? 'GOOGLE_SIGNUP_REDIRECT_URI'
          : 'GOOGLE_LOGIN_REDIRECT_URI',
      ),
    );
    callbackUrl.searchParams.set('code', body.code);
    callbackUrl.searchParams.set('state', body.state);
    if (body.iss) callbackUrl.searchParams.set('iss', body.iss);
    const tokens = await this.auth.finishGoogle(
      purpose,
      callbackUrl,
      body.state,
      state,
    );
    response.cookie('refresh_token', tokens.refreshToken, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: tokens.refreshMaxAge,
    });
    return {
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
    };
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/signup/email')
  async requestSignupCode(
    @Body({ schema: emailDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: EmailDto,
  ): Promise<void> {
    await this.auth.requestEmailCode(body.email, 'signup');
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/signup/email/callback')
  async signupWithEmailCode(
    @Body({ schema: emailCodeDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: EmailCodeDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.auth.finishEmailCode(
      body.email,
      'signup',
      body.code,
    );
    response.cookie('refresh_token', tokens.refreshToken, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: tokens.refreshMaxAge,
    });
    return {
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
    };
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/login/email')
  async requestLoginCode(
    @Body({ schema: emailDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: EmailDto,
  ): Promise<void> {
    await this.auth.requestEmailCode(body.email, 'login');
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login/email/callback')
  async loginWithEmailCode(
    @Body({ schema: emailCodeDtoSchema, pipes: [StandardSchemaValidationPipe] })
    body: EmailCodeDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.auth.finishEmailCode(
      body.email,
      'login',
      body.code,
    );
    response.cookie('refresh_token', tokens.refreshToken, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: tokens.refreshMaxAge,
    });
    return {
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
    };
  }

  @AllowPending()
  @Get('/signup/onboarding')
  onboarding(@Req() request: AuthenticatedRequest) {
    return request.authSession.user;
  }

  @AllowPending()
  @HttpCode(HttpStatus.OK)
  @Post('/signup/onboarding')
  async completeOnboarding(
    @Req() request: AuthenticatedRequest,
    @Body({
      schema: onboardingDtoSchema,
      pipes: [StandardSchemaValidationPipe],
    })
    body: OnboardingDto,
  ) {
    return this.auth.completeOnboarding(
      request.authSession.user.id,
      request.authSession.sessionId,
      body,
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = parseCookie(request.headers.cookie ?? '')[
      'refresh_token'
    ];
    if (!refreshToken) throw new UnauthorizedException();
    const tokens = await this.auth.refresh(refreshToken);
    response.cookie('refresh_token', tokens.refreshToken, {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      maxAge: tokens.refreshMaxAge,
    });
    return {
      accessToken: tokens.accessToken,
      tokenType: 'Bearer',
      expiresIn: tokens.expiresIn,
    };
  }

  @AllowPending()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/logout')
  async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.auth.logout(request.authSession!.sessionId);
    response.clearCookie('refresh_token', REFRESH_TOKEN_COOKIE_OPTIONS);
    response.clearCookie('refresh_token', {
      ...REFRESH_TOKEN_COOKIE_OPTIONS,
      path: '/auth',
    });
  }
}
