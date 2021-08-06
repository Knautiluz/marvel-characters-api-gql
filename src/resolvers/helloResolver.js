import { Counter, Summary } from 'prom-client'

const counter = new Counter({
  name: 'characters_api_request_hello_counter',
  help: 'count each request made at /'
})

const summary = new Summary({
  name: 'characters_api_request_hello_duration',
  help: 'duration of requests of character api made at /'
})

const helloResolver = {
    Query: {
        hello: async (_, __, { dataSources }) => {
          counter.inc()  
          const timer = summary.startTimer()
          const response = await dataSources.charactersAPI.getIndex()
          timer()
          return response
        }
    }
}

export default helloResolver