import nock from 'nock'
import { makeExecutableSchema } from '@graphql-tools/schema'
import queryType from '../../typeDefs/query'
import helloType from '../../typeDefs/helloType'
import helloResolver from '../helloResolver'
import { graphql } from 'graphql'
import CharactersAPI from '../../api/CharactersAPI'
import { beforeEach, expect } from '@jest/globals'


describe('should resolve all queries and mutation', () => {
  const CharAPI = new CharactersAPI()
  
  beforeEach(() => {
    CharAPI.initialize({})
  })

  it('should post new character', async () => {
    nock('https://knautiluz-characters.herokuapp.com').get('/').reply(200, 'Kon\'nichiwa Worudo')
    const query = 'query {hello}'
    const schema = makeExecutableSchema({
      typeDefs: [
        helloType, queryType
      ],
      resolvers: [
        helloResolver
      ]
    })
    const dataSources = { charactersAPI: CharAPI }
    const result = await graphql(schema, query, {}, { dataSources })
    expect(result.data).toEqual({ hello: 'Kon\'nichiwa Worudo' })
  })
  
})