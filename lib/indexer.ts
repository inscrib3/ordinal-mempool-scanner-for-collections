import fs from 'fs'

const ordinals = 'https://ordinals.com/'
const hiro = 'https://api.hiro.so/ordinals/v1/'

let totalSetted = false
let total = 0
let offset = 0

let latestBlock = 0
let firstBlock = 798801

let block = firstBlock

const script = '<script><![CDATA[ let t,e=60;const l=()=>{document.getElementById("ordinals").style.transform="translateY(-20px)",setTimeout((()=>{document.getElementById("ordinals").style.transform="translateY(0px)"}),250),e+=10,e>60&&(e=60),t||(t=setInterval((()=>{e--,e>=40&&document.getElementById("lifes").setAttribute("fill","#4ED85F"),e<40&&document.getElementById("lifes").setAttribute("fill","#FF811A"),e<20&&document.getElementById("lifes").setAttribute("fill","#E92525"),document.querySelectorAll("#lifes [data-timer]").forEach((t=>{const l=parseInt(t.getAttribute("data-timer"));e<=l?t.setAttribute("fill","#ffffff"):t.removeAttribute("fill")}));const l=document.querySelectorAll("#lifes [data-timer]:not([fill])");if(l.length){const t=l[l.length-1];t.setAttribute("fill","#ffffff"),setTimeout((()=>{t.removeAttribute("fill")}),500)}if(e<=0)return clearInterval(t),void(t=null)}),1e3))};document.getElementById("right-button").addEventListener("click",l),document.getElementById("left-button").addEventListener("click",l),document.getElementById("center-button").addEventListener("click",l); ]]></script></svg>'

const indexer = async (block: number, mimetype: string = 'image%2Fsvg%2Bxml', code: string = script) => {
    const blockheightRes = await fetch(`${ordinals}blockheight`)
    const blockheight = await blockheightRes.text()
    latestBlock = parseInt(blockheight)

    const filename = `indexer/${block}.json`
    if (fs.existsSync(filename)) fs.unlinkSync(filename)

    while (!totalSetted || total > offset) {
        const inscriptionsRes = await fetch(`${hiro}inscriptions?limit=60&genesis_block=${block}&offset=${offset}&mime_type=${mimetype}`)
        const _inscriptions = await inscriptionsRes.json()

        if (total === 0) {
            total = _inscriptions.total
            totalSetted = true
        }

        offset += _inscriptions.limit

        const inscriptions = _inscriptions.results.filter((inscription: any) => inscription.mime_type.includes('svg'))

        for (const inscription of inscriptions) {
            console.log('fetching', inscription.id)
            const inscriptionRes = await fetch(`${ordinals}content/${inscription.id}`)
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
    const blockheightRes = await fetch(`${ordinals}blockheight`)
    const blockheight = await blockheightRes.text()
    latestBlock = parseInt(blockheight)

    for (block; block <= latestBlock; block++) {
        console.log('indexing block', block, 'of', latestBlock)
        await indexer(block)           
    }
}

main().catch(console.error)