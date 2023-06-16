export function isTrustedAuthor(pullRequestAuthor: string, trustedAuthors: string): boolean {
  if (!trustedAuthors) {
    return false
  }
  const authors = trustedAuthors.split(',').map(author => author.trim())
  return authors.includes(pullRequestAuthor)
}
