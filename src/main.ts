import * as core from '@actions/core'
import {GitHubService, IFile} from './github-services'
import {PatternMatcher} from './pattern-matcher'
import {context} from '@actions/github'

async function run(): Promise<void> {
  try {
    const trustedAuthors: string = core.getInput('trusted-authors')
    const pullRequestAuthor: string = context.actor
    const eventName: string = context.eventName
    core.debug(
      `Event='${eventName}', Author='${pullRequestAuthor}', Trusted Authors='${trustedAuthors}'`
    )
    if (await isTrustedAuthor(pullRequestAuthor, trustedAuthors)) {
      core.info(
        `${pullRequestAuthor} is a trusted author and is allowed to modify any matching files.`
      )
    } else if (eventName === 'pull_request') {
      const githubToken: string = core.getInput('token', {required: true})
      const gitHubService = new GitHubService(githubToken)
      const pullRequestNumber: number =
        context.payload?.pull_request?.number || 0
      if (pullRequestNumber) {
        const files: IFile[] = await gitHubService.getChangedFiles(
          context.repo.owner,
          context.repo.repo,
          pullRequestNumber
        )
        const pattern: string = core.getInput('pattern', {required: true})
        const patternMatcher = new PatternMatcher()
        await patternMatcher.checkChangedFilesAgainstPattern(files, pattern)
      } else {
        core.setFailed('Pull request number is missing in github event payload')
      }
    } else {
      core.setFailed(
        `Only pull_request events are supported. Event was: ${eventName}`
      )
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error occurred')
    }
  }
}

export async function isTrustedAuthor(
  pullRequestAuthor: string,
  trustedAuthors: string
): Promise<boolean> {
  if (!trustedAuthors) {
    return false
  }
  const authors: string[] = trustedAuthors
    .split(',')
    .map((author: string) => author.trim())
  return authors.includes(pullRequestAuthor)
}

run()
