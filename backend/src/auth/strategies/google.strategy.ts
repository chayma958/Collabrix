import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  type Profile,
  type VerifyCallback,
} from 'passport-google-oauth20';

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

function splitDisplayName(displayName: string): {
  firstName: string;
  lastName: string;
} {
  const spaceIndex = displayName.indexOf(' ');
  if (spaceIndex === -1) {
    return { firstName: displayName || 'User', lastName: '' };
  }
  return {
    firstName: displayName.slice(0, spaceIndex),
    lastName: displayName.slice(spaceIndex + 1),
  };
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      done(new Error('Google account has no email'));
      return;
    }
    const { firstName, lastName } = profile.name?.givenName
      ? {
          firstName: profile.name.givenName,
          lastName: profile.name.familyName ?? '',
        }
      : splitDisplayName(profile.displayName);

    const googleProfile: GoogleProfile = {
      googleId: profile.id,
      email,
      firstName,
      lastName,
      avatarUrl: profile.photos?.[0]?.value,
    };
    done(null, googleProfile);
  }
}
