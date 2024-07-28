import * as Twitter from '@models/twitter';
import Response from '../responses';
import { AsyncRequestHandler } from '.';
import {
  getUserTimeline,
  getMentionTimeline,
  searchByHashtag,
  deleteTweet,
  tweet,
} from '@services/twitter';
import { SendTweetV2Params } from 'twitter-api-v2';

export const userTimelineHandler: AsyncRequestHandler = 
  async (_, res, next) => {
    const timeline = await getUserTimeline();

    if (timeline.isErr()) {
      return next(timeline.error);
    }

    return res.json(Response.success(timeline.value));
  };

export const mentionTimelineHandler: AsyncRequestHandler =
async (_, res, next) => {
  const mentionTimeline = await getMentionTimeline();

  if (mentionTimeline.isErr()) {
    return next(mentionTimeline.error);
  }

  return res.json(Response.success(mentionTimeline.value));
}

export const searchByHashtagHandler: AsyncRequestHandler =
async (_, res, next) => {
  const searchedTweets = await searchByHashtag();

  if (searchedTweets.isErr()) {
    return next(searchedTweets.error);
  }

  return res.json(Response.success(searchedTweets.value))
}

type UpdateStatusRequest = {
  status: string;
  media_ids?: string | NonNullable<SendTweetV2Params['media']>['media_ids'];
  in_reply_to_tweet_id?: Twitter.v2.TweetId | null;
  quote_tweet_id?: Twitter.v2.TweetId | null;
}

export const updateStatusHandler: AsyncRequestHandler<
  unknown, unknown, UpdateStatusRequest
> = async (req, res, next) => {
  const mediaIds = typeof req.body.media_ids === 'string'
    ? [ req.body.media_ids ] as [string] : req.body.media_ids;
  const tweetResult = await tweet({
    text: req.body.status,
    media: mediaIds?.length ? {
      media_ids: mediaIds
    } : undefined,
    reply: req.body.in_reply_to_tweet_id ? {
      in_reply_to_tweet_id: req.body.in_reply_to_tweet_id
    } : undefined,
    quote_tweet_id: req.body.quote_tweet_id || undefined,
  });
  if (tweetResult.isErr()) {
    return next(tweetResult.error);
  }

  const timeline = await getUserTimeline();
  if (timeline.isErr()) {
    return next(timeline.error);
  }
      
  return res.json(Response.success(timeline.value));

}

type DestroyStatusParameter = {
  id: string;
}

export const destroyStatusHandler: AsyncRequestHandler<
  DestroyStatusParameter
> = async (req, res, next) => {
  await deleteTweet(req.params.id);
  const timeline = await getUserTimeline();

  if (timeline.isErr()) {
    return next(timeline.error);
  }
    
  return res.json(Response.success(timeline.value));
}