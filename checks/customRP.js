
const checkCustomRP = (itemContent) => {

    let formattedRPString = "\n" + itemContent.slice(itemContent.indexOf("<responseProcessing"), itemContent.indexOf("</assessmentItem>"))
    let customRPString = itemContent.slice(itemContent.indexOf("<responseProcessing"), itemContent.indexOf("</responseProcessing>"))
    let containsCustomRP = false

    let regex1 = new RegExp(" ", 'g');
    let regex2 = new RegExp("\n", 'g');
    let regex3 = new RegExp("\t", 'g');

    customRPString = customRPString.replace(regex1, "")
    customRPString = customRPString.replace(regex2, "")
    customRPString = customRPString.replace(regex3, "")

    if (!customRPString.includes("template=")) {
        containsCustomRP = true
    }

    if (customRPString.includes("<responseProcessing><responseCondition><responseIf><match>")) {
        containsCustomRP = false
    }

    if (formattedRPString.trim("") === "<responseProcessing/>") {
        containsCustomRP = false
    }

    return {
        priority: containsCustomRP ? 3 : null,
        numberOfIncidents: containsCustomRP ? 1 : 0,
        text: formattedRPString
    }
}

export {
    checkCustomRP
}