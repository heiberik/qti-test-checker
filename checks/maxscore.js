const checkMaxscore = (itemContent) => {

    let startIndex = itemContent.indexOf(`<outcomeDeclaration identifier="MAXSCORE"`)
    let endIndex = itemContent.indexOf(`</outcomeDeclaration>`)

    let maxScoreString = itemContent.slice(startIndex, endIndex)
    let maxScore = 0

    if (maxScoreString.length > 100 && maxScoreString.length < 200) {

        let startValueIndex = maxScoreString.indexOf(`<value>`)
        let endValueIndex = maxScoreString.indexOf(`</value>`)
        let value = maxScoreString.slice(startValueIndex, endValueIndex).replace("<value>", "")
        maxScore = parseFloat(value)
    }

    return {
        priority: maxScore === 0 ? 1 : maxScore !== 1 ? 2 : 3,
        numberOfIncidents: maxScore === 0 ? 1 : 0,
        text: maxScore
    }
}

export {
    checkMaxscore
}