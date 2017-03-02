export default function prrrToPullRequestURL(prrr){
  return `https://github.com/${prrr.owner}/${prrr.repo}/pull/${prrr.number}`
}
