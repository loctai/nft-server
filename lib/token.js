
const fs = require('fs').promises;
const existsSync = require('fs').existsSync;
const path = require('path')
const { getLogger } = require('./logger')

module.exports = async (config) => {

    const logger = getLogger(config)

    const dataDir = process.env.DATA_DIR || path.resolve(__dirname, '../data')
    await fs.mkdir(dataDir, { recursive: true })
    logger.info(`Storing files to ${dataDir}`)

    const tokensDir = path.resolve(dataDir, 'tokens')
    await fs.mkdir(tokensDir, { recursive: true })

    const imagesDir = path.resolve(dataDir, 'images')
    await fs.mkdir(imagesDir, { recursive: true })

    const getTokenFilePath = (tokenId) => path.resolve(tokensDir, `${tokenId}.json`)
    const getImageFilePath = (name) => path.resolve(imagesDir, `${name}`)
    const existsFilePath = async (filepath) => {
        try {
            await fs.access(filepath)
        } catch (e) {
            return false
        }
        return true
    }
    return {
        async list() {
            const files = await fs.readdir(tokensDir)
            return await Promise.all(files
                .filter(filepath => filepath.split(".").pop().toLocaleLowerCase() === "json")
                .map(f => `${tokensDir}/${f}`)
                .map(async (f) => JSON.parse((await fs.readFile(f)).toString())))
        },
        async get(tokenId) {
            const filePath = getTokenFilePath(tokenId)
            const existsFile = await existsFilePath(filePath);
            if(!existsFile) return {}
            try {
                const raw = (await fs.readFile(filePath)).toString()
                return JSON.parse(raw)
            } catch (e) {
                logger.error(`Error loading token: ${e.stack}`)
                return {}
            }
        },
        async save(tokenId, tokenData) {
            const filePath = getTokenFilePath(tokenId)
            await fs.writeFile(filePath, JSON.stringify(tokenData, null, 2))
        },
        async edit(tokenId, body) {
            const filePath = getTokenFilePath(tokenId)
            const existsFile = await existsFilePath(filePath);
            if(!existsFile) return {}
            const data = (await fs.readFile(filePath)).toString()
            const json = {
                ...JSON.parse(data),
                ...body
            };
            await fs.writeFile(filePath, JSON.stringify(json, null, 2));
            console.log('[Edit]', "success");
            return json
        },
        async image (imageName, res) {
            const filePath = getImageFilePath(imageName);
            
            console.log(`${filePath} exists: ${existsSync(filePath)}`);
        
            fs.readFile(filePath, (err, content) => {
                if (err) return {};
        
                res.writeHead(200, { 'Content-type': 'image/png' });
                res.end(content);
            });
        },
        async delete(tokenId) {
            const filePath = getTokenFilePath(tokenId)
            await fs.unlink(filePath);
            return filePath
        }
    }
}