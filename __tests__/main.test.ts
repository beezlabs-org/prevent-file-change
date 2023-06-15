import {isTrustedAuthor} from '../src/author-checker'
import {expect, test} from '@jest/globals'

test('if trusted author is allowed', async () => {
  const pullRequestAuthor = 'examplePullRequestAuthor1'
  const trustedAuthors = 'examplePullRequestAuthor1, examplePullRequestAuthor2'

  const result = await isTrustedAuthor(pullRequestAuthor, trustedAuthors)

  expect(result).toBeTruthy()
})

test('if untrusted author is rejected', async () => {
  const pullRequestAuthor = 'examplePullRequestAuthor1'
  const trustedAuthors = 'examplePullRequestAuthor2, examplePullRequestAuthor3'

  const result = await isTrustedAuthor(pullRequestAuthor, trustedAuthors)

  expect(result).toBeFalsy()
})

test('if empty trusted author is rejected', async () => {
  const pullRequestAuthor = 'examplePullRequestAuthor'
  const trustedAuthors = ''

  const result = await isTrustedAuthor(pullRequestAuthor, trustedAuthors)

  expect(result).toBeFalsy()
})
