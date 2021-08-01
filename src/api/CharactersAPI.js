
import { RESTDataSource } from 'apollo-datasource-rest'
import { Counter } from 'prom-client'
import logger from '../../settings/logger'
import { getCharactersData, getCharacterData } from '../utils/parseCharactersData'

const counter = new Counter({
  name: 'characters_api_request_errors',
  help: 'register errors from characters api',
  labelNames: ['method', 'status', 'url']
})

class CharactersAPI extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = 'https://knautiluz-characters.herokuapp.com'
    this.initialize({})
  }

  async getIndex() {
    const response = await this.get('/')
    return response
  }

  async postCharacter(character) {
    const base = {
      'name': character.name,
      'description': character.description,
      'modified': new Date().getTime(),
      'resourceURI': character.resourceURI,
      'urls': character.urls || [],
      'thumbnail': character.thumbnail,
      'comics': character.comics || []
    }

    try {
      await this.post('/characters', base)
      return true
    } catch ({ extensions }) {
      counter.labels({ method: 'POST', status: extensions.response.status, url: extensions.response.url }).inc()
      logger.error(extensions.response.body || extensions.response.status)
      if(extensions.response.status === 409)
        throw new Error('[Conflict] this character already exists.')
    }
  }

  async putCharacter(id, character) {
    const base = {
      'name': character.name,
      'description': character.description,
      'modified': new Date().getTime(),
      'resourceURI': character.resourceURI,
      'urls': character.urls || [],
      'thumbnail': character.thumbnail,
      'comics': character.comics || []
    }

    try {
      await this.put(`/characters/${id}`, base)
      return true
    } catch ({ extensions }) {
      counter.labels({ method: 'PUT', status: extensions.response.status, url: extensions.response.url }).inc()
      logger.error(extensions.response.body || extensions.response.status)
      if(extensions.response.status === 404)
        throw new Error('[Not Found] this character doesn\'t exist')
    }
  }

  async deleteCharacter(id) {

    try {
      await this.delete(`/characters/${id}`)
      return true
    } catch ({ extensions }) {
      counter.labels({ method: 'DELETE', status: extensions.response.status, url: extensions.response.url }).inc()
      logger.error(extensions.response.body || extensions.response.status)
      if(extensions.response.status === 404)
        throw new Error('[Not Found] this character doesn\'t exist')
    }
  }
  
  async getCharacterByID(id) {
    let response
    try {
      response = await this.get(`/characters/${id}`)
      const character = getCharacterData(response)
      return character
    } catch ({ extensions }) {
      counter.labels({ method: 'GET', status: extensions.response.status, url: extensions.response.url }).inc()
      logger.error(extensions.response.body || extensions.response.status)
      if(extensions.response.status === 404)
        throw new Error('[Not Found] this character doesn\'t exist')
    }
  }

  async getCharacters(name, nameStartsWith, modifiedSince, orderBy, limit, offset) {
    
    const params = new URLSearchParams()
    if(name !== undefined)
        params.set('name', name)
    if(nameStartsWith !== undefined)
        params.set('nameStartsWith', nameStartsWith)
    if(modifiedSince !== undefined)
        params.set('modifiedSince', modifiedSince)
    if(orderBy !== undefined)
        params.set('orderBy', orderBy)
    if(limit !== undefined)
        params.set('limit', limit)
    if(offset !== undefined)
        params.set('offset', offset)

    let response
    try {
      response = await this.get('/characters', params)
      if(response.data.results !== undefined) {
        const characters = getCharactersData(response.data.results)
        return { characters }
      }
      return { characters: [] }
    } catch ({ extensions }) {
      counter.labels({ method: 'GET', status: extensions.response.status, url: extensions.response.url }).inc()
      logger.error(extensions.response.body || extensions.response.status)
    }

  }
}

export default CharactersAPI