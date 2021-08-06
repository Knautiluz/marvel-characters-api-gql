import { gql } from 'apollo-server-core'

const query = gql`
    enum CacheControlScope {
        PUBLIC
        PRIVATE
    }
    directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
        inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE
    type Query {
        _empty: String
    }
`
export default query