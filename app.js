import fs from "fs"
import path from "path"
import extract from 'extract-zip'

const checkFiles = (name) => {

    if (fs.existsSync("./results/" + name + ".txt")) {
        fs.rmSync("./results/" + name + ".txt", { recursive: true, force: true });
    }

    let maxScoreIsNull = 0
    let customRP = 0

    let itemFolders = fs.readdirSync("./" + name + "/items/")

    for (const fileindex in itemFolders) {

        const filename = itemFolders[fileindex]

        let printString = ""
        let content = fs.readFileSync("./" + name + "/items/" + filename + "/qti.xml", 'utf-8')

        let startIndex = content.indexOf(`<outcomeDeclaration identifier="MAXSCORE"`)
        let endIndex = content.indexOf(`</outcomeDeclaration>`)
        let maxScoreString = content.slice(startIndex, endIndex)

        let identifier1 = `https://forfatter.eps.udir.no/#${filename}`
        let identifier2 = `https://noudi01aup.udir.taocloud.org/#${filename}`

        let customRPString = content.slice(content.indexOf("<responseProcessing"), content.length - 1)
        let customResponseProcessing = !customRPString.includes("template=")

        let regex1 = new RegExp(" ", 'g');
        customRPString = customRPString.replace(regex1, "")

        let regex2 = new RegExp("\n", 'g');
        customRPString = customRPString.replace(regex2, "")

        let regex3 = new RegExp("\t", 'g');
        customRPString = customRPString.replace(regex3, "")

        if (customRPString.includes("<responseProcessing><responseCondition><responseIf><match>")) {
            customResponseProcessing = false
        }

        let maxScore = "X"

        if (maxScoreString.length > 100 && maxScoreString.length < 200) {

            let startValueIndex = maxScoreString.indexOf(`<value>`)
            let endValueIndex = maxScoreString.indexOf(`</value>`)
            let value = maxScoreString.slice(startValueIndex, endValueIndex).replace("<value>", "")

            maxScore = parseFloat(value)
        }
        const logId = maxScore > 1 || customResponseProcessing || maxScore === "X"

        if (logId) {
            printString += ("MAXSCORE: " + maxScore + " - " + "Egendefinert skåring: " + customResponseProcessing + "\n")
            if (customResponseProcessing) {
                printString += (content.slice(content.indexOf("<responseProcessing"), content.length - 1) + "\n")
            }
            printString += (identifier1 + "\n");
            printString += (identifier2 + "\n");
            printString += "\n\n\n"
        }

        let lastString = fs.existsSync("./results/" + name + ".txt") ? fs.readFileSync("./results/" + name + ".txt") : ""
        fs.writeFileSync("./results/" + name + ".txt", lastString += printString)

        if (maxScore === "X" || maxScore === 0) {
            maxScoreIsNull++
        }

        if (customResponseProcessing) {
            customRP++
        }
    }

    let printString = "TOTALT ANTALL OPPGAVER UTEN MAXSCORE            : " +
        maxScoreIsNull + "\nTOTALT ANTALL OPPGAVER MED EGENDEFINERT SKÅRING : " +
        customRP + "\n\n"

    let lastString = fs.existsSync("./results/" + name + ".txt") ? fs.readFileSync("./results/" + name + ".txt") : ""
    fs.writeFileSync("./results/" + name + ".txt", printString += lastString)
    fs.rmSync("./" + name, { recursive: true })
}

const getAllTestPaths = () => {

    const testFolder = './tests/'
    const tests = fs.readdirSync(testFolder)
    return tests
}

const checkAllTests = () => {

    const paths = getAllTestPaths();

    if (!fs.existsSync('./results')) {
        fs.mkdirSync("./results")
    }

    paths.forEach(async(p, index) => {

        const name = p.substring(0, p.length - 4)

        fs.rmSync("./" + name, { recursive: true, force: true });
        fs.mkdirSync("./" + name);

        const source = path.resolve("./tests/" + p)
        const target = path.resolve("./" + name)

        try {
            await extract(source, { dir: target })
            checkFiles(name)
        } catch (err) {
            console.log(err);
            console.log("ERROR D:");
        }
    })
}

checkAllTests()