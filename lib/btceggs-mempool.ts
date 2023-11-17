import fs from 'fs'

const dir = 'btceggs'

const files = fs.readdirSync(dir)

const inscriptionsIds = []
const addresses: string[] = []

for (const file of files) {
    if (file === '.gitkeep') continue
    const fileContent = fs.readFileSync(`${dir}/${file}`, 'utf8')
    const json = JSON.parse(fileContent)
    addresses.push(...json.map((inscription: any) => inscription.address))
    inscriptionsIds.push(...json.map((inscription: any) => inscription.id))
}

const inscriptions = inscriptionsIds.map((id: string, i: number) => ({ id, meta: { name: `Egg #${i+1}` }, /* address: addresses[i] */ }))

fs.writeFileSync('collections/btceggs.json', JSON.stringify(inscriptions))

console.log(`Found ${inscriptions.length} ordinals`)