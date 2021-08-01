import chai from 'chai'
import chaiHttp from 'chai-http'
import appPromise from '../../server'
import nock from 'nock'
import { beforeAll, afterAll } from '@jest/globals'

let app

const { expect } = chai
chai.use(chaiHttp)

describe('should resolve all queries and mutation', () => {
  beforeAll(async () => {
    app = await appPromise
  })
  afterAll(() => {
    app.close()
  })
  it('should post new character', async () => {
    const query = ' hello '
    nock('https://knautiluz-characters.herokuapp.com').get('/').reply(200, 'Kon\'nichiwa Worudo')
    const res = await chai.request(app).post('/').send({ query: ` { ${query} } ` })
    expect(res.body).to.be.an('object').that.deep.eq({ data: { hello: 'Kon\'nichiwa Worudo' } })
  })
  
})