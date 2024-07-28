import { SendTweetV2Params } from 'twitter-api-v2';

export type UserId = string;

export type TweetId = string;

export type UrlEntity = {
  start: number;
  end: number;
  url: string;
  expanded_url: string;
  display_url: string;
  media_key?: string;
};

export type MentionEntity = {
  start: number;
  end: number;
  id?: string;
  username: string;
}

export type Media = PhotoMedia | VideoMedia | GifMedia;

export type PhotoMedia = {
  media_key: string;
  type: 'photo';
  url: string;
  width: number;
  height: number;
}

export type VideoMedia = {
  media_key: string;
  type: 'video';
  preview_image_url: string;
  url: string;
  width: number;
  height: number;
  variants: any;
}

export type GifMedia = {
  media_key: string;
  type: 'animated_gif';
  preview_image_url: string;
  width: number;
  height: number;
}

export type User = {
  id: UserId;
  name: string;
  username: string;
  created_at: string;
  profile_image_url: string;
};

export type Tweet = {
  id: TweetId;
  text: string;
  created_at: string;
  user: User;
  entities?: {
    annotations?: unknown[];
    urls?: UrlEntity[];
    hashtags?: unknown[];
    mentions?: MentionEntity[];
    cashtags?: unknown[];
  };
  media?: Media[];
  in_reply_to_status?: Tweet;
  quoted_status?: Tweet;
};

export type MentionTweet = Tweet & {
  in_reply_to_user_id: UserId;
};

export type PostTweet = {
  text: string;
  media?: {
    media_ids?: NonNullable<SendTweetV2Params['media']>['media_ids'];
    tagged_user_ids?: UserId[];
  };
  reply?: {
    in_reply_to_tweet_id: TweetId;
  };
  quote_tweet_id?: TweetId;
}

export type PostResult = {
  id: string;
  username: string;
  text: string;
  created_at: string;
}