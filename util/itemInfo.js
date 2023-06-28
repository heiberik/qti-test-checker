import fs from "fs"

const getItemInfo = (itemContent, testName, itemName) => {

    return {
        identifier: getIdentifier(testName, itemName),
        label: getLabel(itemContent)
    }
}

const getLabel = (itemContent) => {

    const startIndex = itemContent.indexOf(`label="`) + 7
    const endIndex = itemContent.indexOf(`xml:lan`) - 2

    const label = itemContent.slice(startIndex, endIndex)

    return label
}

const getIdentifier = (testName, itemName) => {

    const identifier1 = `https://forfatter.eps.udir.no/#${itemName}`
    const identifier2 = `https://noudi01aup.udir.taocloud.org/#${itemName}`

    const manifestContent = fs.readFileSync("./" + testName + "/imsmanifest.xml", 'utf-8')
    const identifier = manifestContent.includes(identifier2) ? identifier2 : identifier1

    const startIndex = manifestContent.indexOf(itemName)
    let itemInManifest = manifestContent.slice(startIndex, manifestContent.length)
    itemInManifest = itemInManifest.slice(0, itemInManifest.indexOf("</resource>"))

    //const count = (itemInManifest.match(/noudi01aup.udir.taocloud.org/g) || []).length;
    return identifier1
}

export {
    getItemInfo
}