import fs from 'fs'

const ordinals = 'https://ordinals.com/'
const hiro = 'https://api.hiro.so/ordinals/v1/'

let totalSetted = false
let total = 0
let offset = 0

let latestBlock = 0
let firstBlock = 812050

let block = firstBlock

const script = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><script id="btceggs"'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const indexer = async (block: number, mimetype: string = 'image%2Fsvg%2Bxml', code: string = script) => {
    let blockheightRes;
    try {
        blockheightRes = await fetch(`${ordinals}blockheight`)
    } catch (e) {
        sleep(2000)
        blockheightRes = await fetch(`${ordinals}blockheight`)
    }
    if (!blockheightRes || blockheightRes.status !== 200) {
        sleep(2000)
        blockheightRes = await fetch(`${ordinals}blockheight`)
    }
    const blockheight = await blockheightRes.text()
    latestBlock = parseInt(blockheight)

    console.log('blockheight', latestBlock, blockheight)

    const filename = `btceggs/${block}.json`
    if (fs.existsSync(filename)) fs.unlinkSync(filename)

    while (!totalSetted || total > offset) {
        let inscriptionsRes;

        try {
            inscriptionsRes = await fetch(`${hiro}inscriptions?limit=60&genesis_block=${block}&offset=${offset}&mime_type=${mimetype}`)
        } catch (e) {
            sleep(2000)
            inscriptionsRes = await fetch(`${hiro}inscriptions?limit=60&genesis_block=${block}&offset=${offset}&mime_type=${mimetype}`)
        }
        if (!inscriptionsRes || inscriptionsRes.status !== 200) {
            sleep(2000)
            inscriptionsRes = await fetch(`${hiro}inscriptions?limit=60&genesis_block=${block}&offset=${offset}&mime_type=${mimetype}`)
        }
        const _inscriptions = await inscriptionsRes.json()

        console.log('ins', _inscriptions.results.length);

        if (total === 0) {
            total = _inscriptions.total
            totalSetted = true
        }

        offset += _inscriptions.limit

        const inscriptions = _inscriptions.results.filter((inscription: any) => inscription.mime_type.includes('svg'))

        for (const inscription of inscriptions) {
            await sleep(2000);
            console.log('fetching', inscription.id)
            let inscriptionRes;
            try {
                inscriptionRes = await fetch(`${ordinals}content/${inscription.id}`)
            } catch (e) {
                inscriptionRes = await fetch(`${ordinals}content/${inscription.id}`)
            }
            if (!inscriptionRes || inscriptionRes.status !== 200) {
                inscriptionRes = await fetch(`${ordinals}content/${inscription.id}`)
            }
            const res = await inscriptionRes.text()
            if (res.includes(code)) {
                console.log('this is a match!', inscription.id)
                try {
                    const file = fs.readFileSync(filename, 'utf8')
                    const json = JSON.parse(file)
                    json.push(inscription)
                    fs.writeFileSync(filename, JSON.stringify(json))
                } catch (e) {
                    fs.writeFileSync(filename, JSON.stringify([inscription]))
                }
            }
        }
        
        console.log(total, offset)

        await new Promise(resolve => setTimeout(resolve, 2000))
    }

    totalSetted = false
    total = 0
    offset = 0
}


const main = async () => {
    let blockheightRes;
    try {
        blockheightRes = await fetch(`${ordinals}blockheight`)
    } catch (e) {
        sleep(2000)
        blockheightRes = await fetch(`${ordinals}blockheight`)
    }
    if (!blockheightRes || blockheightRes.status !== 200) {
        sleep(2000)
        blockheightRes = await fetch(`${ordinals}blockheight`)
    }
    const blockheight = await blockheightRes.text()
    latestBlock = parseInt(blockheight)

    for (block; block <= latestBlock; block++) {
        console.log('indexing block', block, 'of', latestBlock)
        await indexer(block)           
    }
}

main().catch(console.error)