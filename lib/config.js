
const {promises} = require('fs')
const path = require('path')
const dotenv = require('dotenv')

let dotEnvConfig = null

const exists = async (filepath) => {
    try {
        await promises.access(filepath)
    } catch (e) {
        return false
    }
    return true
}
function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
  }

module.exports = {
    async getConfig(reload = false) {

        if (!reload && dotEnvConfig) {
            return dotEnvConfig
        }

        const envPath = process.env.ENV_PATH || path.resolve(__dirname, '../.env')
        if (!await exists(envPath)) {
            console.error(`.env file not found. See .env.example to create one`)
            dotEnvConfig = {}
        } else {
            dotEnvConfig = dotenv.parse(await promises.readFile(envPath))
        }

        return dotEnvConfig
    }
}

