import fs from 'fs'

const dir = 'indexer'

const files = fs.readdirSync(dir)

const inscriptionsIds = []

for (const file of files) {
    if (file === '.gitkeep') continue
    const fileContent = fs.readFileSync(`${dir}/${file}`, 'utf8')
    const json = JSON.parse(fileContent)
    inscriptionsIds.push(...json.map((inscription: any) => inscription.id))
}

const inscriptions = inscriptionsIds.map((id: string, i: number) => ({ id, meta: { name: `Gotchi #${i+1}` } }))

fs.writeFileSync('collections/inscriptions.json', JSON.stringify(inscriptions))

console.log(`Found ${inscriptions.length} ordinals`)