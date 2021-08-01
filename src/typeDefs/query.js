const query = `
    type Query {
        _empty: String
    }
    enum CacheControlScope {
        PUBLIC,
        PRIVATE
    }
    directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
    ) on FIELD_DEFINITION | OBJECT | INTERFACE
`
export default query