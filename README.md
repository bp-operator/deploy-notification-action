# deploy-notification-action

## 배포공지 알림 action
배포시 슬랙에 배포 공지를 자동으로 작성해주는 action입니다. \
workflow가 성공적으로 동작하고 나면 slack에 배포공지 안내를 알려주는 공지를 합니다.

## 사용방법
- 아래의 코드를 workflow에 하단에 추가해줍니다.
- pull request시 source branch는 `release/{version}` 형태여야 합니다.
- 아래의 GITHUB Secret이 추가
  - SLACK_WEBHOOK_URL : 공지할 slack webhook url
- Slack에 공지가 올라오는 시점은 workflow가 완료된 시점입니다.
- optional 변수 
  - slack-receiver-user: 공지에서 멘션할 slack UserID로 콤마로 구분 ex) 'U04B8FG9GHH,U04B8FG9GHH'
  - slack-receiver-group: 공지에서 멘션할 slack의 GroupId로 콤마로 구분 ex) 'SAZ94GDB8,SAZ94GDB8' 

#### release verison 을 다른 step에서 환경변수로 지정한 경우
```yaml
jobs:
  announce-to-slack:
    name: Notify Deploy Information To Slack
    runs-on: ubuntu-latest
    steps:
      - name: Announce To Slack
        uses: bp-operator/deploy-notification-action@v1.0
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          GITHUB_REPOSITORY: $GITHUB_REPOSITORY
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          version: ${{ needs.{job-name}.outputs.release_version }} // change job-name
          slack-receiver-user: 'U04B8FG9GHH,U04B8FG9GHH'
          slack-receiver-group: 'SAZ94GDB8,SAZ94GDB8'
```
#### release version 을 이전 step에서 가지고 있지 않은경우
```yaml
jobs:
  announce-to-slack:
    name: Notify Deploy Information To Slack
    runs-on: ubuntu-latest
    steps:
      - name: get version
        id: vars
        run: |
          # 'release/**' 브랜치에서 'release/' 문자열을 제거한 나머지를 버전으로 사용
          RELEASE_BRANCH="${{ github.head_ref }}"
          RELEASE_VERSION="${RELEASE_BRANCH/release\//}"
          echo "release_version=${RELEASE_VERSION}" >> $GITHUB_OUTPUT
      - name: Announce To Slack
        uses: bp-operator/deploy-notification-action@v1.0
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
          GITHUB_REPOSITORY: $GITHUB_REPOSITORY
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          version: ${{ steps.vars.outputs.release_version }}
          slack-receiver-user: 'U04B8FG9GHH,U04B8FG9GHH'
          slack-receiver-group: 'SAZ94GDB8,SAZ94GDB8'
```
