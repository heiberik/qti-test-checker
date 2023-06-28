import fs from "fs"
import path from "path"
import extract from 'extract-zip'
import { checkCustomRP } from "./checks/customRP.js";
import { checkMaxscore } from "./checks/maxscore.js";
import { getItemInfo } from "./util/itemInfo.js";

const checkFiles = (name) => {

    if (fs.existsSync("./results/" + name + ".txt")) {
        fs.rmSync("./results/" + name + ".txt", { recursive: true, force: true });
    }

    const reports = []
    let containsNoMaxscore = 0
    let containsCustomRP = 0

    let itemFolders = fs.readdirSync("./" + name + "/items/")

    for (const fileindex in itemFolders) {

        const filename = itemFolders[fileindex]
        const itemContent = fs.readFileSync("./" + name + "/items/" + filename + "/qti.xml", 'utf-8')

        const itemInfo = getItemInfo(itemContent, name, filename)
        const customRPReport = checkCustomRP(itemContent)
        const maxscoreReport = checkMaxscore(itemContent)
        containsNoMaxscore += maxscoreReport.numberOfIncidents
        containsCustomRP += customRPReport.numberOfIncidents

        reports.push(createItemReport(customRPReport, maxscoreReport, itemInfo))
    }

    createFinalReport(reports, containsNoMaxscore, containsCustomRP, name)
}


const createItemReport = (customRPReport, maxscoreReport, itemInfo) => {

    let printString = ""

    const maxscoreValue = maxscoreReport.text
    const customRPString = customRPReport.text
    const containsCustomRP = customRPReport.numberOfIncidents === 1

    const shouldCreateReport = maxscoreValue > 1 || containsCustomRP || maxscoreValue === 0

    if (shouldCreateReport) {
        printString += "LABEL    : " + itemInfo.label + "\n"
        printString += "RESSURS  : " + itemInfo.identifier + "\n"
        printString += "MAXSCORE : " + maxscoreValue + "\n"
        printString += "SKÅRING  : " + customRPString
        printString += "\n\n"

        const priority = Math.min(customRPReport.priority, maxscoreReport.priority)

        return {
            priority,
            printString
        }
    }
    else return null
}

const createFinalReport = (reports, containsNoMaxscore, containsCustomRP, itemName) => {

    //items
    const sortedByPriority = reports.filter(report => report).sort((a, b) => { return a.priority - b.priority })
    for (const index in sortedByPriority){
        const report = sortedByPriority[index]
        let lastString = fs.existsSync("./results/" + itemName + ".txt") ? fs.readFileSync("./results/" + itemName + ".txt") : ""
        fs.writeFileSync("./results/" + itemName + ".txt", lastString += report.printString)
    }

    //overview
    let printString = ""
    printString += "OVERSIKT:" + "\n"
    printString += "Oppgaver uten maxscore            : " + containsNoMaxscore + "\n"
    printString += "Oppgaver med egendefinert skåring : " + containsCustomRP + "\n"
    printString += "\n"
    printString += "---------------------------------"
    printString += "\n\n"

    let lastString = fs.existsSync("./results/" + itemName + ".txt") ? fs.readFileSync("./results/" + itemName + ".txt") : ""
    fs.writeFileSync("./results/" + itemName + ".txt", printString += lastString)
    fs.rmSync("./" + itemName, { recursive: true })
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

    paths.forEach(async (p) => {

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
        }
    })
}

checkAllTests()