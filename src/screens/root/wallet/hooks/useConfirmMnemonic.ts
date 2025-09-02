import { useEffect, useState } from "react"

type Word = {
    word: string;
    position?: number;
    wrong: boolean;
}

const shuffleArray = (array: string[]) => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

type Props = {
    mnemonic: string[];
}

const useConfirmMnemonic = ({ mnemonic }: Props) => {
    const [selectedWords, setSelectedWords] = useState<Word[]>([])
    const [error, setError] = useState<string | null>(null)
    const [disabled, setDisabled] = useState(true)

    useEffect(() => {
        if (mnemonic) {
            const selectedWords = shuffleArray(mnemonic).map(word => ({ word, wrong: false }))
            setSelectedWords(selectedWords)
        }
    }, [mnemonic])

    const onSelectWord = (item: Word) => {
        setSelectedWords(prev => prev.map(x => {
            if(x.word == item.word && !x.position && !error)
                x.position = (prev.filter(i => !!i.position).length + 1)
            else if(x.wrong && x.word == item.word && !!x.position) 
                x.position = undefined
            x.wrong = (!!x.position && x.word != mnemonic[(x.position??-1)-1])
            return x
        }))
        setTimeout(() => {
            const markeds = selectedWords.filter(item => !!item.position)
            if(markeds.some(item => item.word != mnemonic[(item.position??-1)-1])) 
            {
                setError("A ordem das palavras está incorreta");
            } else {
                setError(null)
                if(markeds.length == mnemonic.length) {
                    setDisabled(false)
                }
            }
        }, 20)
    }

    return {
        error,
        disabled,
        selectedWords,
        onSelectWord
    }
}


export default useConfirmMnemonic
