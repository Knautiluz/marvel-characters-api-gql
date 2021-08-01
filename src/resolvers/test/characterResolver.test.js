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

  it('should get heartbeat', async () => {
    const res = await chai.request(app).get('/')
    expect(res).to.have.status(200)
    expect(res.text).to.be.an('string').that.deep.eq('Kon\'nichiwa Worudo, access /graphql to play with me.')
  })

  it('should get metrics headers', async () => {
    const res = await chai.request(app).get('/metrics')
    expect(res).to.have.status(200)
    expect(res.text).to.be.an('string')
    expect(res.header['content-type']).to.be.an.string('text/plain; charset=utf-8; version=0.0.4')
  })

  it('should post new character', async () => {
    const mutation = 'addNewCharacter(character: { name: "Odin" description: "The brabo of nordic mythology" urls: { type: "comic", url: "https://knautiluz.net/characters/Odin" } })'
    nock('https://knautiluz-characters.herokuapp.com').post('/characters').reply(201)
    const res = await chai.request(app).post('/').send({ query: `mutation { ${mutation} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { addNewCharacter: true } })
  })

  it('should post new character and get null when conflit', async () => {
    const mutation = 'addNewCharacter(character: { name: "Odin" description: "The brabo of nordic mythology" urls: { type: "comic", url: "https://knautiluz.net/characters/Odin" } })'
    nock('https://knautiluz-characters.herokuapp.com').post('/characters').reply(409)
    const res = await chai.request(app).post('/').send({ query: `mutation { ${mutation} }` })
    expect(res).to.have.status(200)
    const response = {
      data: {
        addNewCharacter: null
      },
      errors: [
        {
          locations: [
            {
              column: 12,
              line: 1,
            },
          ],
          message: '[Conflict] this character already exists.',
          path: [
            'addNewCharacter',
          ],
        },
      ]
    }
    expect(res.body).to.be.an('object').that.deep.eq(response)
  })

  it('should get single character by id', async () => {
    const character = {
      id: 1,
      name: 'Worudo',
      description: 'The Worudo: dio?',
      modified: new Date().getTime().toString(),
      resourceURI: null,
      urls: [],
      thumbnail: null,
      comics: [],
    }
    const query = 'character(id: 1) { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters/1').reply(200, character)
    const res = await chai.request(app).post('/').send({ query: `{ ${query} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { character } })
  })

  it('should get single character by id and be null when error is catch and must have errors array', async () => {
    const query = 'character(id: 1) { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters/1').reply(404)
    const res = await chai.request(app).post('/').send({ query: `{ ${query} }` })
    expect(res).to.have.status(200)
    const response = { 
      data: { 
        character: null
      },
      errors: [
        {
          locations: [
            {
              column: 3,
              line: 1,
            },
          ],
          message: '[Not Found] this character doesn\'t exist',
          path: [
            'character',
          ],
        },
      ]
    }
    expect(res.body).to.be.an('object').that.deep.eq(response)
  })

  it('should get single character by id and be null when error is catch', async () => {
    const query = 'character(id: 1) { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters/1').reply(401)
    const res = await chai.request(app).post('/').send({ query: `{ ${query} }` })
    expect(res).to.have.status(200)
    const response = { 
      data: { 
        character: null
      }
    }
    expect(res.body).to.be.an('object').that.deep.eq(response)
  })


  it('should get multiple characters', async () => {
    const characters = [
        {
          id: 1,
          name: 'Worudo',
          description: 'The Worudo: dio?',
          modified: new Date().getTime().toString(),
          resourceURI: null,
          urls: [
            {
              'type': 'comic',
              'url': 'https://knautiluz.net/characters/Dio'
            }
          ],
          thumbnail: null,
          comics: [],
        },
        {
          id: 2,
          name: 'Joestar',
          description: 'Joestars never die',
          modified: new Date().getTime().toString(),
          resourceURI: null,
          urls: [
            {
              'type': 'comic',
              'url': 'https://knautiluz.net/characters/Jonathan-Joestar'
            }
          ],
          thumbnail: null,
          comics: [],
        }
    ]
    const query = 'characters { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}}'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').reply(200, { data: { results: characters } })
    const res = await chai.request(app).post('/').send({ query: `{ ${query} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { 'characters': { characters } } })
  })

  it('should get multiple characters with query params', async () => {
    const characters = [
        {
          id: 1,
          name: 'Zoro',
          description: 'One Piece, Huh?',
          modified: new Date().getTime().toString(),
          resourceURI: null,
          urls: [
            {
              'type': 'comic',
              'url': 'https://knautiluz.net/characters/Zoro'
            }
          ],
          thumbnail: null,
          comics: [],
        }
    ]
    const query = 'characters(name: "Zoro" nameStartsWith: "Z" modifiedSince: "30/08/1992" orderBy: "-name" limit: 10 offset: 10) { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}}'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').query({
      name: 'Zoro',
      nameStartsWith: 'Z',
      modifiedSince: '30/08/1992',
      orderBy: '-name',
      limit: 10,
      offset:10
    }).reply(200, { data: { results: characters } })
    const res = await chai.request(app).post('/').send({ query: `{ ${query} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { 'characters': { characters } } })
  })

  it('should get multiple characters then get null when server error', async () => {
    const query = 'characters { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}}'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').reply(500)
    const res = await chai.request(app).post('/').send({ query: `{ ${query} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { 'characters': null } })
  })


  it('should get empty array for get characters when no characters was found', async () => {
    const query = 'characters { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}}'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').reply(200, { data: {} })
    const res = await chai.request(app).post('/').send({ query: `{ ${query} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { 'characters': { characters: [] } } })
  })

  it('should update single character by id', async () => {
    const mutation = 'updateExistingCharacter(id: 1, character: { name: "Worudo", description: "The Worudo!" } )'
    nock('https://knautiluz-characters.herokuapp.com').put('/characters/1').reply(204)
    const res = await chai.request(app).post('/').send({ query: `mutation { ${mutation} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { updateExistingCharacter: true } })
  })

  it('should return null when caracter not exist and then return data null with error response', async () => {
    const mutation = 'updateExistingCharacter(id: 1, character: { name: "Worudo", description: "The Worudo!" } )'
    nock('https://knautiluz-characters.herokuapp.com').put('/characters/1').reply(404)
    const res = await chai.request(app).post('/').send({ query: `mutation { ${mutation} }` })
    expect(res).to.have.status(200)
    const response = {
      data: {
        updateExistingCharacter: null
      },
      errors: [
        {
          locations: [
            {
              column: 12,
              line: 1,
            },
          ],
          message: '[Not Found] this character doesn\'t exist',
          path: [
            'updateExistingCharacter',
          ],
        },
      ]
    }
    expect(res.body).to.be.an('object').that.deep.eq(response)
  })



  it('should delete single character by id', async () => {
    const mutation = 'deleteExistingCharacter(id: 1)'
    nock('https://knautiluz-characters.herokuapp.com').delete('/characters/1').reply(200)
    const res = await chai.request(app).post('/').send({ query: `mutation { ${mutation} }` })
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('object').that.deep.eq({ data: { deleteExistingCharacter: true } })
  })

  it('should return null when caracter not exist and then return  data null with error response', async () => {
    const mutation = 'deleteExistingCharacter(id: 1)'
    nock('https://knautiluz-characters.herokuapp.com').delete('/characters/1').reply(404)
    const res = await chai.request(app).post('/').send({ query: `mutation { ${mutation} }` })
    expect(res).to.have.status(200)
    const response = {
      data: {
        deleteExistingCharacter: null
      },
      errors: [
        {
          locations: [
            {
              column: 12,
              line: 1,
            },
          ],
          message: '[Not Found] this character doesn\'t exist',
          path: [
            'deleteExistingCharacter',
          ],
        },
      ]
    }
    expect(res.body).to.be.an('object').that.deep.eq(response)
  })

})