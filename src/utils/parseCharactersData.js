
/**
 * @param {Array} results results coming from body.data of characters api response
 * @returns array of characters
 */
const getCharactersData = (results) => {
    const characters = []
    results.forEach(char => {
        const character = {}
        character.id = char.id
        character.name = char.name
        character.description = char.description
        character.modified = char.modified
        character.resourceURI = char.resourceURI
        character.urls = char.urls
        character.thumbnail = char.thumbnail
        character.comics = char.comics
        characters.push(character)
    })
    return characters
}

const getCharacterData = (char) => {
    const character = {}
    character.id = char.id
    character.name = char.name
    character.description = char.description
    character.modified = char.modified
    character.resourceURI = char.resourceURI
    character.urls = char.urls
    character.thumbnail = char.thumbnail
    character.comics = char.comics
    return character
}

export { getCharacterData, getCharactersData }