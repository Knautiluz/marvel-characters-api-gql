import { gql } from 'apollo-server-core'

const characterType = gql`
  
  extend type Query {
    
    characters(
        name: String
        nameStartsWith: String
        modifiedSince: String
        orderBy: String
        limit: Int
        offset: Int
    ): Characters

    character(id: Int!): Character
  }

  extend type Mutation {
    addNewCharacter(character: InputCharacter!): Boolean
  }

  extend type Mutation {
    updateExistingCharacter(id: Int!, character: InputCharacter!): Boolean
  }

  extend type Mutation {
    deleteExistingCharacter(id: Int!): Boolean
  }

  type Item @cacheControl(inheritMaxAge: true) {
    resourceURI: String
    name: String
  }
  type Comic @cacheControl(inheritMaxAge: true) {
    available: Int
    returned: Int
    collectionURI: String
    items: [Item]
  }
  type Thumbnail @cacheControl(inheritMaxAge: true) {
    path: String
    extension: String
  }
  type TypeUrl @cacheControl(inheritMaxAge: true) {
    type: String
    url: String
  }
  
  type Character @cacheControl(maxAge: 360) {
    id: Int
    name: String
    description: String
    modified: String
    resourceURI: String
    urls: [TypeUrl]
    thumbnail: Thumbnail
    comics: [Comic]
  }

  type Characters {
    characters: [Character]
  }

  input InputTypeUrl {
    type: String
    url: String
  }
  input InputThumbnail {
    path: String
    extension: String
  }
  input InputItem {
    resourceURI: String
    name: String
  }
  input InputComic {
    collectionURI: String
    items: [InputItem]
  }
  input InputCharacter {
    name: String!
    description: String!
    resourceURI: String
    urls: [InputTypeUrl]
    thumbnail: InputThumbnail
    comics: [InputComic]
  }
`

export default characterType