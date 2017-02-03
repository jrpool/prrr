import Queries from '../server/queries'
import Commands from '../server/commands'

const commands = new Commands()

const withUsersInTheDatabase = callback => {
  context('When several users exist in the database', function(){
    beforeEach(function(){
      return Promise.all([
        commands.createUser({
          name: 'Graham Campbell',
          email: 'graham@alt-three.com',
          avatar_url: 'https://avatars1.githubusercontent.com/u/2829600?v=3&s=460',
          github_id: 2829600,
          github_username: 'GrahamCampbell',
          github_access_token: 'GRAHAM_CAMPBELL_GITHUB_ACCESS_TOKEN',
          github_refresh_token: null,
        }),
        commands.createUser({
          name: 'Fabien Potencier',
          email: 'fabien@symfony.com',
          avatar_url: 'https://avatars0.githubusercontent.com/u/47313?v=3&s=460',
          github_id: 47313,
          github_username: 'fabpot',
          github_access_token: 'FABIEN_POTENCIER_GITHUB_ACCESS_TOKEN',
          github_refresh_token: null,
        }),
        commands.createUser({
          name: 'Abraham Ferguson',
          email: 'jhnfgie1989@gmail.com',
          avatar_url: 'https://avatars0.githubusercontent.com/u/15825329?v=3&s=460',
          github_id: 15825329,
          github_username: 'AbrahamFergie',
          github_access_token: 'ABRAHAM_FERGUSON_GITHUB_ACCESS_TOKEN',
          github_refresh_token: null,
        }),
      ])
    })
    callback()
  })
}

export { withUsersInTheDatabase }
