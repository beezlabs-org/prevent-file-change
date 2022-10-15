import core from '@actions/core'
import {context} from '@actions/github'
import {GitHubService, IFile} from './github-services'
import {checkChangedFilesAgainstPattern} from './pattern-matcher'

async function run(): Promise<void> {
  try {
    const trustedAuthors = core.getInput('trusted-authors')
    const pattern = core.getInput('pattern', {required: true})
    const githubToken = core.getInput('token', {required: true})

    core.debug('Inputs received')

    const pullRequestAuthor = context.actor
    const eventName = context.eventName

    core.debug(`Event='${eventName}', Author='${pullRequestAuthor}', Trusted Authors='${trustedAuthors}'`)

    if (await isTrustedAuthor(pullRequestAuthor, trustedAuthors)) {
      core.info(`${pullRequestAuthor} is a trusted author and is allowed to modify any matching files.`)
    } else if (eventName === 'pull_request') {
      const gitHubService = new GitHubService(githubToken)
      const pullRequestNumber = context.payload?.pull_request?.number || 0
      if (pullRequestNumber) {
        const files: IFile[] = await gitHubService.getChangedFiles(
          context.repo.owner,
          context.repo.repo,
          pullRequestNumber
        )
        await checkChangedFilesAgainstPattern(files, pattern)
      } else {
        core.setFailed('Pull request number is missing in github event payload')
      }
    } else {
      core.setFailed(`Only pull_request events are supported. Event was: ${eventName}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Unknown error occurred')
    }
  }
}

export async function isTrustedAuthor(pullRequestAuthor: string, trustedAuthors: string): Promise<boolean> {
  if (!trustedAuthors) {
    return false
  }
  const authors = trustedAuthors.split(',').map(author => author.trim())
  return authors.includes(pullRequestAuthor)
}

run()
