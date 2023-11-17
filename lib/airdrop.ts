import fs from 'fs'

const airdrop = () => {
    const balance: { [key: string]: number } = {}

    const files = fs.readdirSync('indexer')

    console.log({ files })

    files.forEach((file) => {
        if (file === '.gitkeep') return
        const json: { address: string }[] = JSON.parse(fs.readFileSync(`indexer/${file}`, 'utf8'))
        json.forEach(({ address }) => {
            if (!balance[address]) balance[address] = 0
            balance[address] += 1
        })
    })


    fs.writeFileSync('collections/airdrop.json', JSON.stringify(balance))
}

airdrop()
