import configModule from 'config';

type CacheConfiguration = {
  ttl: number;
  enabled: boolean;
};

type TwitterConfiguration = {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
};

type CorsConfiguration = {
  origin: string | string[];
};

export type Configuration = {
  debug: boolean;
  hashtag: string;
  cache: CacheConfiguration;
  twitter: TwitterConfiguration;
  cors?: CorsConfiguration;
};

export const config: Configuration = {
  debug: configModule.get('debug'),
  hashtag: configModule.get('hashtag'),
  cache: {
    ttl: configModule.get('cache.ttl'),
    enabled: configModule.get('cache.enabled'),
  },
  twitter: {
    apiKey: configModule.get('twitter.apiKey'),
    apiSecret: configModule.get('twitter.apiSecret'),
    accessToken: configModule.get('twitter.accessToken'),
    accessSecret: configModule.get('twitter.accessSecret'),
  },
  cors: configModule.has('cors')
    ? {
      origin: configModule.get('cors.origin'),
    }
    : undefined,
};
