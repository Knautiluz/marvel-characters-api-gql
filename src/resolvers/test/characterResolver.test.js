import nock from 'nock'
import { makeExecutableSchema } from '@graphql-tools/schema'
import queryType from '../../typeDefs/query'
import mutationType from '../../typeDefs/mutation'
import characterType from '../../typeDefs/characterType'
import characterResolver from '../characterResolver'
import { graphql } from 'graphql'
import CharactersAPI from '../../api/CharactersAPI'
import { beforeEach, expect } from '@jest/globals'

describe('should resolve all queries and mutation', () => {
  const schema = makeExecutableSchema({
    typeDefs: [
      queryType, mutationType, characterType
    ],
    resolvers: [
      characterResolver
    ]
  })

  let dataSources
  beforeEach(() => {
    const CharAPI = new CharactersAPI()
    CharAPI.initialize({})
    dataSources = { charactersAPI: CharAPI }
  })

  it('should post new character', async () => {
    nock('https://knautiluz-characters.herokuapp.com').post('/characters').reply(201)
    const mutation = 'addNewCharacter(character: { name: "Odin" description: "The brabo of nordic mythology" urls: { type: "comic", url: "https://knautiluz.net/characters/Odin" } })'
    const query = `mutation { ${mutation} }`
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ addNewCharacter: true })
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
    nock('https://knautiluz-characters.herokuapp.com').get('/characters/1').reply(200, character)
    const query = 'query { character(id: 1) { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }} }'
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ character })
  })

  it('should get single character by id and be null when error is catch', async () => {
    nock('https://knautiluz-characters.herokuapp.com').get('/characters/1').reply(401)
    const query = 'query { character(id: 1) { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }} }'
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ character: null })
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
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').reply(200, { data: { results: characters } })
    const query = 'query { characters { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}} }'
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ 'characters': { characters } })
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
    const query = 'query { characters(name: "Zoro" nameStartsWith: "Z" modifiedSince: "30/08/1992" orderBy: "-name" limit: 10 offset: 10) { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}} } '
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').query({
      name: 'Zoro',
      nameStartsWith: 'Z',
      modifiedSince: '30/08/1992',
      orderBy: '-name',
      limit: 10,
      offset:10
    }).reply(200, { data: { results: characters } })
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ 'characters': { characters } })
  })

  it('should get multiple characters then get null when server error', async () => {
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').reply(500)
    const query = 'query { characters { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}} }'
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ 'characters': null })
  })


  it('should get empty array for get characters when no characters was found', async () => {
    const query = 'query { characters { characters { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }}} }'
    nock('https://knautiluz-characters.herokuapp.com').get('/characters').reply(200, { data: {} })
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ 'characters': { characters: [] } })
  })

  it('should update single character by id', async () => {
    const query = 'mutation { updateExistingCharacter(id: 1, character: { name: "Worudo", description: "The Worudo!" } ) }'
    nock('https://knautiluz-characters.herokuapp.com').put('/characters/1').reply(204)
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ updateExistingCharacter: true })
  })

  it('should delete single character by id', async () => {
    const query = 'mutation { deleteExistingCharacter(id: 1) } '
    nock('https://knautiluz-characters.herokuapp.com').delete('/characters/1').reply(200)
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ deleteExistingCharacter: true })
  })

})

describe('should resolve successfuly all errors', () => {

  const schema = makeExecutableSchema({
    typeDefs: [
      queryType, mutationType, characterType
    ],
    resolvers: [
      characterResolver
    ]
  })

  let dataSources
  beforeEach(() => {
    const CharAPI = new CharactersAPI()
    CharAPI.initialize({})
    dataSources = { charactersAPI: CharAPI }
  })

  it('should return null when caracter not exist and then return  data null with error response', async () => {
    const query = 'mutation { deleteExistingCharacter(id: 1) }'
    nock('https://knautiluz-characters.herokuapp.com').delete('/characters/1').reply(404)
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ deleteExistingCharacter: null })
    expect(result.errors[0].message).toEqual('[Not Found] this character doesn\'t exist')
  })

  it('should return null when caracter not exist and then return data null with error response', async () => {
    nock('https://knautiluz-characters.herokuapp.com').put('/characters/1').reply(404)
    const query = 'mutation { updateExistingCharacter(id: 1, character: { name: "Worudo", description: "The Worudo!" } ) }'
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ updateExistingCharacter: null })
    expect(result.errors[0].message).toEqual('[Not Found] this character doesn\'t exist')
  })

  it('should get single character by id and be null when error is catch and must have errors array', async () => {
    nock('https://knautiluz-characters.herokuapp.com').get('/characters/1').reply(404)
    const query = 'query { character(id: 1) { id name description modified resourceURI urls { type url } thumbnail { path extension } comics { available returned collectionURI items { resourceURI name } }} }'
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ character: null })
    expect(result.errors[0].message).toEqual('[Not Found] this character doesn\'t exist')
  })

  it('should post new character and get null when conflit', async () => {
    nock('https://knautiluz-characters.herokuapp.com').post('/characters').reply(409)
    const mutation = 'addNewCharacter(character: { name: "Odin" description: "The brabo of nordic mythology" urls: { type: "comic", url: "https://knautiluz.net/characters/Odin" } })'
    const query = `mutation { ${mutation} }`
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ addNewCharacter: null })
    expect(result.errors[0].message).toEqual('[Conflict] this character already exists.')
  })
})