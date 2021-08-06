import { gql } from 'apollo-server-core'

const helloType = gql`
  extend type Query {
    hello: String @cacheControl(maxAge: 400)
  }
`
export default helloType