import { getMe } from '@infrastructure/tweets'

export default () => {
  getMe().then(username => {
    console.log(`Logged in as ${username}`);
  }).catch(e => {
    console.error(e);
  });
}