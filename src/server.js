import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginCacheControl } from 'apollo-server-core'
import ApolloServerPluginResponseCache from 'apollo-server-plugin-response-cache'
import { ApolloServer } from 'apollo-server-express'
import { BaseRedisCache } from 'apollo-server-cache-redis'
import express from 'express'
import Redis from 'ioredis'
import query from './typeDefs/query'
import mutation from './typeDefs/mutation'
import helloResolver from './resolvers/helloResolver'
import helloType from './typeDefs/helloType'
import characterResolver from './resolvers/characterResolver'
import characterType from './typeDefs/characterType'
import CharactersAPI from './api/CharactersAPI'
import { register, collectDefaultMetrics } from 'prom-client'

import { config } from 'dotenv'

config()

collectDefaultMetrics({ register })

register.setDefaultLabels({
  app: 'knautiluz-marvel-characters-api'
})


const app = express()

app.get('/', async (_, res) => {
  res.set('Content-Type', 'text/plain')
  res.send('Kon\'nichiwa Worudo, access /graphql to play with me.')
})

app.get('/metrics', async (_, res) => {
  res.set('Content-Type', register.contentType)
  res.send(await register.metrics())
})

const cache = new BaseRedisCache({
  client: new Redis({
    host: process.env.REDIS_HOSTNAME,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    connectTimeout: 5000
  })
})

async function start() {
  const server = new ApolloServer({
    cache,
    persistedQueries: {
      cache,
      ttl: 3600
    },
    plugins: [
      ApolloServerPluginResponseCache(),
      ApolloServerPluginCacheControl({
        defaultMaxAge: 0,
      }),
      ApolloServerPluginLandingPageGraphQLPlayground({
        endpoint: '/playground',
      }),
    ],
    introspection: true,
    dataSources: () => ({ charactersAPI: new CharactersAPI() }),
    typeDefs: [
      query, mutation, characterType, helloType
    ],
    resolvers: [
      helloResolver, characterResolver
    ]
  })
  
  await server.start()
  server.applyMiddleware({ app, path: '/' })
  await new Promise((resolve, _) => app.listen({ port: process.env.PORT }, resolve))

  return { server, app }
}

start().then(() => {
  console.log(`Servidor iniciado na porta ${process.env.PORT}`)
}).catch(error => {
  console.log(error)
}) 