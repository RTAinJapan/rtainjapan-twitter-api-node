import { PostResult } from '@models/twitter/v2';
import { CacheContainer } from 'node-ts-cache';
import { MemoryStorage } from 'node-ts-cache-storage-memory';

const storage = new CacheContainer(new MemoryStorage());
const KEY = 'TWEETS';
const STORAGE_SIZE = 50;

export const listTweetHistoryInMemory = async (): Promise<PostResult[]> => {
  return (await storage.getItem<PostResult[]>(KEY)) || [];
};

export const saveTweetHistory = async (
  tweet: PostResult
): Promise<PostResult[]> => {
  const cached = (await storage.getItem<PostResult[]>(KEY)) || [];
  const newTweets = [tweet, ...cached].slice(0, STORAGE_SIZE);

  await storage.setItem(KEY, newTweets, { isCachedForever: true });

  return newTweets;
};

export const removeTweetFromHistory = async (
  id: string
): Promise<PostResult[]> => {
  const cached = (await storage.getItem<PostResult[]>(KEY)) || [];
  const newTweets = cached.filter(t => t.id !== id);

  await storage.setItem(KEY, newTweets, { isCachedForever: true });

  return newTweets;
}
