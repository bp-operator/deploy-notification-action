import {Issue} from './dto/issue'
import {Milestone} from './dto/milestone'
import fetch from 'node-fetch'
import * as core from '@actions/core'

const perPage = 30

function getRepository(): string {
  const repository = process.env.GITHUB_REPOSITORY
  if (!repository)
    throw ReferenceError(
      'Failed To Get GITHUB_REPOSITORY in workflow environment'
    )
  return repository
}

function getToken(): string {
  const token = process.env.GITHUB_TOKEN
  if (!token)
    throw ReferenceError('Failed To Get GITHUB_TOKEN in workflow environment')
  return token
}

async function getMilestoneNumber(version: string, page = 0): Promise<any> {
  core.debug(`get milestone number: ${version}`)
  const result = await fetch(
    `https://api.github.com/repos/${getRepository()}/milestones?per_page=${perPage}&page=${page}&state=all`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${getToken()}`
      }
    }
  )
    .then(res => res.json())
    .then(data => data as Milestone[])

  const matchingMilestone = result.find(it => it.title.includes(version))
  if (matchingMilestone) {
    return matchingMilestone.number
  }

  if (result.length === perPage) {
    return await getMilestoneNumber(version, page + 1)
  }

  return null
}

async function getIssues(milestoneNumber: string): Promise<any> {
  const res = await fetch(
    `https://api.github.com/repos/${getRepository()}/issues?milestone=${milestoneNumber}&state=all`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${getToken()}`
      }
    }
  )
    .then(res => res.json())
    .then(data => data as Issue[])
  return res
}

export async function getMilestoneIssues(version: string): Promise<any> {
  const milestoneNumber = await getMilestoneNumber(version)
  const milestoneIssues = milestoneNumber
    ? await getIssues(milestoneNumber)
    : null
  if (milestoneIssues == null)
    throw ReferenceError(
      `Failed To Get milestone issues milestone number:${milestoneNumber}`
    )
  return milestoneIssues
}

export async function getDriver(): Promise<any> {
  const res = await fetch(
    `https://api.github.com/user`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${getToken()}`
      }
    }
  )
    .then(res => res.json())

  return res.login
}
