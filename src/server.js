import { GraphQLServer } from 'graphql-yoga'
import { register, collectDefaultMetrics } from 'prom-client'
import query from './typeDefs/query'
import mutation from './typeDefs/mutation'
import helloResolver from './resolvers/helloResolver'
import helloType from './typeDefs/helloType'
import characterResolver from './resolvers/characterResolver'
import characterType from './typeDefs/characterType'
import CharactersAPI from './api/CharactersAPI'

collectDefaultMetrics({ register })

register.setDefaultLabels({
  app: 'knautiluz-marvel-characters-api'
})

const server = new GraphQLServer({
  typeDefs: [
    query, mutation, characterType, helloType
  ],
  resolvers: [
    helloResolver, characterResolver
  ],
  context: () => ({
    dataSources: () => {
      return {
        charactersAPI: new CharactersAPI()
      }
    },
  }),
})

server.express.get('/', async (_, res) => {
  res.set('Content-Type', 'text/plain')
  res.send('Kon\'nichiwa Worudo, access /graphql to play with me.')
})

server.express.get('/metrics', async (_, res) => {
  res.set('Content-Type', register.contentType)
  res.send(await register.metrics())
})

const app = server.start({ playground: '/graphql' }, ({ port }) => {
  if(process.env.NODE_ENV !== 'test')
    console.log(
      `Listening on port ${port} for incoming requests.`,
    )
})

export default app