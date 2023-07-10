import fs from 'fs'

const winner = fs.readdirSync('winner')

const inscriptionsIds = []

for (const file of winner) {
    if (file === '.gitkeep') continue
    const fileContent = fs.readFileSync(`winner/${file}`, 'utf8')
    const json = JSON.parse(fileContent)
    inscriptionsIds.push(...json.map((inscription: any) => inscription.id))
}

const inscriptions = inscriptionsIds.map((id: string) => id)

fs.writeFileSync('collections/winner.txt', inscriptions.join(', '))
