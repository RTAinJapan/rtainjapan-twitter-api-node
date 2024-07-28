import {
  ApiPartialResponseError,
  ApiRequestError,
  ApiResponseError,
  ApiV2Includes,
  TweetV2,
  TweetV2PaginableTimelineParams,
  Tweetv2SearchParams,
  Tweetv2TimelineResult,
  TweetV2UserTimelineParams,
  TwitterApi,
  TwitterApiV2Settings,
} from 'twitter-api-v2';
import { config } from '@app/config';
import {
  Media,
  Tweet,
  PostTweet,
  TweetId,
  PostResult,
} from '@models/twitter/v2'; 

TwitterApiV2Settings.debug = config.debug;

const client = new TwitterApi({
  appKey: config.twitter.apiKey,
  appSecret: config.twitter.apiSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessSecret,
});

const timelineOptions:
  Partial<TweetV2UserTimelineParams>
  & Partial<Tweetv2SearchParams>
  & Partial<TweetV2PaginableTimelineParams>
= {
  'tweet.fields': [
    'id',
    'text',
    'created_at',
    'in_reply_to_user_id',
    'referenced_tweets',
    'entities',
    'attachments',
  ],
  'media.fields': [
    'media_key',
    'type',
    'url',
    'preview_image_url',
    'width',
    'height',
  ],
  'user.fields': [
    'id',
    'name',
    'username',
    'created_at',
    'profile_image_url',
  ],
  expansions: [
    'in_reply_to_user_id',
    'referenced_tweets.id',
    'referenced_tweets.id.author_id',
    'attachments.media_keys',
    'author_id',
  ]
};

export class TwitterError extends Error {}

const wrapCallTwitter = async <T>(callback: () => Promise<T>): Promise<T> => {
  try {
    return await callback();
  } catch (e) {
    if (e instanceof ApiRequestError || e instanceof ApiPartialResponseError) {
      throw new TwitterError(e.message);
    }
    if (e instanceof ApiResponseError) {
      throw new TwitterError(
        e.data.detail || e.message,
      );
    }
    throw e;
  }
}

export const listUserTimeline = async (): Promise<Tweet[]> => {
  const { data: me } = await wrapCallTwitter(() => client.currentUserV2());
  console.log(`logged in as ${JSON.stringify(me)}`);
  const timelinePage = await wrapCallTwitter(
    () => client.v2.userTimeline(me.id, timelineOptions)
  );

  return timelineToTweets(timelinePage.data);
}

export const listMentionTimeline = async (): Promise<Tweet[]> => {
  const { data: me } = await wrapCallTwitter(
    () => client.currentUserV2()
  );
  const timelinePage = await wrapCallTwitter(
    () => client.v2.userMentionTimeline(
      me.id, timelineOptions
    )
  );

  return timelineToTweets(timelinePage.data);
}

export const updateStatus = async (post: PostTweet): Promise<PostResult> => {
  const { data: me } = await wrapCallTwitter(() => client.currentUserV2());
  const { data } = await wrapCallTwitter(
    () => client.v2.tweet(post.text, post)
  );
  
  const now = new Date();
  return {
    ...data,
    username: me.username,
    created_at: now.toISOString(),
  };
}

export const deleteStatus = async (id: TweetId): Promise<void> => {
  await wrapCallTwitter(() => client.v2.deleteTweet(id));
}

export const searchByQuery = async (query: string): Promise<Tweet[]> => {
  const response = await wrapCallTwitter(
    () => client.search(query, timelineOptions)
  );

  return timelineToTweets(response.data);
}

const makeStatusWithIncludes = (
  data: TweetV2, includes: ApiV2Includes | undefined
): Tweet => {
  if (!data.created_at) {
    throw new Error('Invalid tweet.');
  }

  const quoted = data.referenced_tweets?.find((ref) => ref.type === 'quoted');
  const quotedStatus = quoted
    && includes?.tweets?.find((tw) => tw.id === quoted.id);
  const inReplyTo = data.referenced_tweets?.find(
    (ref) => ref.type === 'replied_to'
  );
  const inReplyToStatus = inReplyTo
    && includes?.tweets?.find((tw) => tw.id === inReplyTo?.id);

  const user = includes?.users?.find((u) => u.id === data.author_id);
  if (!(user && user.created_at && user.profile_image_url)) {
    throw new Error('Status must have user in includes!!');
  }

  return {
    id: data.id,
    text: data.text,
    created_at: data.created_at,
    entities: data.entities,
    media: data.attachments?.media_keys?.map((mediaKey) => {
      return includes?.media?.find((m) => m.media_key === mediaKey);
    }).filter((m):m is Media => !!m),
    in_reply_to_status: inReplyToStatus
      && makeStatusWithIncludes(inReplyToStatus, includes),
    quoted_status: quotedStatus
      && makeStatusWithIncludes(quotedStatus, includes),
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      profile_image_url: user.profile_image_url,
      created_at: user.created_at,
    },
  }
};

const timelineToTweets = (timeline: Tweetv2TimelineResult): Tweet[] => {
  
  const { data, includes } = timeline;

  // 対象ツイートがない場合空配列でなく undefined になる
  return (data || []).map((d) => {
    return makeStatusWithIncludes(d, includes);
  });
}

export const getMe = async (): Promise<string> => {

  const {data: me} = await wrapCallTwitter(() => 
    client.currentUserV2());
  
  return me.username;
}