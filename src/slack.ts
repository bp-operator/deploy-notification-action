import {Issue} from './dto/issue'
import fetch from 'node-fetch'

function getPayload(
  issues: Issue[],
  version: string,
  slackReceiverUser?: string,
  slackReceiverTeam?: string
): any {
  const milestoneUrl = issues[0] ? issues[0].milestone.html_url : ''
  const repoName = issues[0] ? issues[0].repository_url.split('/').pop() : ''
  const releaseVersion = version
  const description = issues.map(it => it.title).join('\n')
  const creator = issues[0] ? issues[0].milestone.creator.login : ''
  const now = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})

  const receiverUser = slackReceiverUser
    ? slackReceiverUser
        .split(',')
        .map(target => `<@${target}>`)
        .join(' ')
    : ''
  const receiverTeam = slackReceiverTeam
    ? slackReceiverTeam
        .split(',')
        .map(target => `<!subteam^${target}>`)
        .join(' ')
    : ''

  const payload = {
    text: 'anouncement',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: '[빌드 완료 / 배포 예정 안내]'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• Schedule: ${now}\n• Release Version: ${repoName} ${releaseVersion}\n• Milestone: ${milestoneUrl}\n• Driver: ${creator}\n • Description:`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `\`\`\`${description}\`\`\``
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: receiverUser + receiverTeam
        }
      }
    ]
  }
  return payload
}

function getSlackUrl(): string {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url)
    throw ReferenceError(
      'Failed To Get SLACK_WEBHOOK_URL in workflow environment'
    )
  return url
}

export async function sendToSlack(
  issues: Issue[],
  version: string,
  slackReceiverUser?: string,
  slackReceiverTeam?: string
): Promise<void> {
  await fetch(getSlackUrl(), {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: JSON.stringify(
      getPayload(issues, version, slackReceiverUser, slackReceiverTeam)
    )
  })
}
