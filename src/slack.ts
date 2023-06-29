import {Issue} from './dto/issue'
import fetch from 'node-fetch'
import * as core from '@actions/core'

function getPayload(
  driver: string,
  issues: Issue[],
  version: string,
  completionNotification: boolean,
  environment: string,
  slackReceiverUser?: string,
  slackReceiverTeam?: string
): any {
  const milestoneUrl = issues[0] ? issues[0].milestone.html_url : ''
  const repoName = issues[0] ? issues[0].repository_url.split('/').pop() : ''
  const releaseVersion = version
  const description = issues.map(it => it.title).join('\n')
  const now = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})

  const receiverUser = slackReceiverUser
    ? slackReceiverUser
        .split(',')
        .map(target => `<@${target}>`)
        .join(' ')
    : ' '
  const receiverTeam = slackReceiverTeam
    ? slackReceiverTeam
        .split(',')
        .map(target => `<!subteam^${target}>`)
        .join(' ')
    : ' '
  const notificationTitle = completionNotification
    ? '[리얼 배포 완료 공지]'
    : '[리얼 배포 예정 안내]'
  const environmentTitle = environment
    ? `[${environment}]`
    : ''

  const payload = {
    text: 'anouncement',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: `${notificationTitle} ${environmentTitle}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `• Schedule: ${now}\n• Release Version: ${repoName} ${releaseVersion}\n• Milestone: ${milestoneUrl}\n• Driver: ${driver}\n • Description:`
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
  driver: string,
  issues: Issue[],
  version: string,
  slackReceiverUser?: string,
  slackReceiverTeam?: string,
  completionNotification: boolean = false,
  environment: string
): Promise<void> {
  core.debug(`send slack notification: ${version}`)
  await fetch(getSlackUrl(), {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    },
    body: JSON.stringify(
      getPayload(
        driver,
        issues,
        version,
        completionNotification,
        environment,
        slackReceiverUser,
        slackReceiverTeam
      )
    )
  })
}
