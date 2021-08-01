import { Counter, Summary } from 'prom-client'

const characters_counter = new Counter({
  name: 'characters_api_request_characters_counter',
  help: 'count each request made at /characters',
  labelNames: ['method']
})

const characters_summary = new Summary({
  name: 'characters_api_request_characters_duration',
  help: 'duration of requests of characters api made at /characters',
  labelNames: ['method']
})

const historyResolver = {
    Query: {
        characters: async (_, args, { dataSources }) => {
          characters_counter.labels({ method: 'GET' }).inc()
          const timer = characters_summary.labels({ method: 'GET' }).startTimer()
          const { name, nameStartsWith, modifiedSince, orderBy, limit, offset } = args
          const response = await dataSources().charactersAPI.getCharacters(name, nameStartsWith, modifiedSince, orderBy, limit, offset)
          timer()
          return response
        },
        character: async (_, args, { dataSources }) => {
          characters_counter.labels({ method: 'GET' }).inc()
          const timer = characters_summary.labels({ method: 'GET' }).startTimer()
          const { id } = args
          const response = await dataSources().charactersAPI.getCharacterByID(id)
          timer()
          return response
        }
    },
    Mutation: {
      addNewCharacter: async (_, { character }, { dataSources }) => {
        characters_counter.labels({ method: 'POST' }).inc()
        const timer = characters_summary.labels({ method: 'POST' }).startTimer()
        const response = await dataSources().charactersAPI.postCharacter(character)
        timer()
        return response
      },
      updateExistingCharacter: async (_, { id, character }, { dataSources }) => {
        characters_counter.labels({ method: 'PUT' }).inc()
        const timer = characters_summary.labels({ method: 'PUT' }).startTimer()
        const response = await dataSources().charactersAPI.putCharacter(id, character)
        timer()
        return response
      },
      deleteExistingCharacter: async (_, { id }, { dataSources }) => {
        characters_counter.labels({ method: 'DELETE' }).inc()
        const timer = characters_summary.labels({ method: 'DELETE' }).startTimer()
        const response = await dataSources().charactersAPI.deleteCharacter(id)
        timer()
        return response
      }
    }
}

export default historyResolver