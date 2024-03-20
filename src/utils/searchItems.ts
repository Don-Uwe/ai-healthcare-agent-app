import { isNumber, MayFunction } from '@raydium-io/raydium-sdk-v2'
import { isObject, isString } from './judges/judgeType'
import { shakeUndefindedItem } from './shakeUndefindedItem'
import { shrinkToValue } from './shrinkToValue'

type SearchConfigObj<T> = {
  text: MayFunction<string | undefined, [item: T]>
  entirely?: boolean
}

type SearchConfigItem<T> = SearchConfigObj<T> | string | undefined

type MatchInfo<T> = {
  item: T
  allConfigs: SearchConfigObj<T>[]
  matchedConfigs: {
    isEntirelyMatched: boolean
    config: SearchConfigObj<T>
    configIdx: number
    searchedKeywordText: string
    searchedKeywordIdx: number
  }[]
}

export type SearchOptions<T> = {
  searchText?: string /* for controlled component */
  matchRules?: SearchConfigItem<T>[]
  /**
   * apply to searchText
   * default is  /\s+/ and '-'
   **/
  splitor?: string | RegExp
}

/**
 * pure js fn/
 * core of "search" feature
 */
export function searchItems<T>(items: T[], options?: SearchOptions<T>): T[] {
  if (!options) return items
  if (!options.searchText) return items
  const allMatchedStatusInfos = items.map((item) => parseToMatchedInfos(item, options))
  const meaningfulMatchedInfos = allMatchedStatusInfos.filter((m) => m?.matchedConfigs.length)
  const sortedMatchedInfos = sortByMatchedInfos<T>(meaningfulMatchedInfos)
  return sortedMatchedInfos.map((m) => m.item)
}

function extractItemBeSearchedText<T>(item: T): SearchConfigObj<T>[] {
  if (isString(item) || isNumber(item)) return [{ text: String(item as unknown as string | number) } as SearchConfigObj<T>]
  if (isObject(item)) {
    return shakeUndefindedItem(
      Object.values({ ...item, id: undefined, key: undefined }).map((value) =>
        isString(value) || isNumber(value) ? ({ text: String(value as unknown as string | number) } as SearchConfigObj<T>) : undefined
      )
    )
  }
  return [{ text: '' }]
}

function parseToMatchedInfos<T>(item: T, options: SearchOptions<T>) {
  const searchText = options.searchText
  const matchRules = options.matchRules ?? extractItemBeSearchedText(item)
  const splitor = options.splitor ?? /\s+|-/
  const searchKeyWords = searchText!.trim().split(splitor)
  const searchConfigs = shakeUndefindedItem(
    matchRules.map((rule) => (isString(rule) ? { text: rule } : rule) as SearchConfigObj<T> | undefined)
  )
  return patch({ item, searchKeyWords, searchConfigs })
}

/** it produce matched search config infos */
function patch<T>(options: { item: T; searchKeyWords: string[]; searchConfigs: SearchConfigObj<T>[] }): MatchInfo<T> {
  const matchedConfigs = options.searchKeyWords.flatMap((keyword, keywordIdx) =>
    shakeUndefindedItem(
      options.searchConfigs.map((config, configIdx) => {
        const configIsEntirely = config.entirely
        const text = shrinkToValue(config.text, [options.item])
        const matchEntirely = isStringInsensitivelyEqual(text, keyword)
        const matchPartial = isStringInsensitivelyContain(text, keyword)
        const isMatchedByConfig = (matchEntirely && configIsEntirely) || (matchPartial && !configIsEntirely)
        return isMatchedByConfig
          ? {
              config,
              configIdx,
              isEntirelyMatched: matchEntirely,
              searchedKeywordIdx: keywordIdx,
              searchedKeywordText: keyword
            }
          : undefined
      })
    )
  )
  const matchInfos: MatchInfo<T> = {
    item: options.item,
    allConfigs: options.searchConfigs,
    matchedConfigs
  }
  return matchInfos
}

function sortByMatchedInfos<T>(matchedInfos: MatchInfo<T>[]) {
  return [...matchedInfos].sort(
    (matchedInfoA, matchedInfoB) => toMatchedStatusSignature(matchedInfoB) - toMatchedStatusSignature(matchedInfoA)
  )
}

function isStringInsensitivelyEqual(s1: string | undefined, s2: string | undefined) {
  if (s1 == null || s2 == null) return false
  return s1.toLowerCase() === s2.toLowerCase()
}

function isStringInsensitivelyContain(s1: string | undefined, s2: string | undefined) {
  if (s1 == null || s2 == null) return false
  return s1.toLowerCase().includes(s2.toLowerCase())
}

/**
 * so user can compare just use return number
 *
 * matchedInfo => [0, 1, 2, 0, 2, 1] =>  [ 2 * 4 + 2 * 2, 1 * 5 + 1 * 1] (index is weight) =>
 * 2 - entirely mathched
 * 1 - partialy matched
 * 0 - not matched
 *
 * @returns item's weight number
 */
function toMatchedStatusSignature<T>(matchedInfo: MatchInfo<T>): number {
  const originalConfigs = matchedInfo.allConfigs
  const entriesSequence = Array.from({ length: originalConfigs.length }, () => 0)
  const partialSequence = Array.from({ length: originalConfigs.length }, () => 0)

  matchedInfo.matchedConfigs.forEach(({ configIdx, isEntirelyMatched }) => {
    if (isEntirelyMatched) {
      entriesSequence[configIdx] = 2 // [0, 0, 2, 0, 2, 0]
    } else {
      partialSequence[configIdx] = 1 // [0, 1, 0, 0, 2, 1]
    }
  })

  const calcCharateristicN = (sequence: number[]) => {
    const max = Math.max(...sequence)
    return sequence.reduce((acc, currentValue, currentIdx) => acc + currentValue * (max + 1) ** (sequence.length - currentIdx), 0)
  }
  const characteristicSequence = calcCharateristicN([
    calcCharateristicN(entriesSequence),
    calcCharateristicN(partialSequence) //  1 * 5 + 1 * 1
  ])
  return characteristicSequence
}
