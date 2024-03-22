import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './en.json'
import zhTW from './zh-TW.json'
import zhCN from './zh-CN.json'
import jp from './jp.json'
import es from './es.json'
import fr from './fr.json'
import ru from './ru.json'
import pt from './pt.json'
import tr from './tr.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // passes i18n down to react-i18next

  .init({
    detection: {
      order: ['querystring', 'localStorage', 'cookie', 'sessionStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    },
    resources: {
      en: { translation: en },
      'zh-TW': { translation: zhTW },
      'zh-CN': { translation: zhCN },
      jp: { translation: jp },
      es: { translation: es },
      fr: { translation: fr },
      ru: { translation: ru },
      pt: { translation: pt },
      tr: { translation: tr }
    },
    fallbackLng: 'en'
  })

export const changeLang = async (lang: string, bundle?: any) => {
  let data = bundle
  if (lang && !i18n.hasResourceBundle(lang, 'translation')) {
    data = bundle ?? (await import(`./${lang}.json`))
    i18n.addResourceBundle(lang, 'translation', data)
  }
  i18n.changeLanguage(lang)
  return data
}

export default i18n
