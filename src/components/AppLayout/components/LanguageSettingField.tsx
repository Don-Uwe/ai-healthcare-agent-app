import { Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { changeLang } from '../../../i18n'
import { Select } from '../../Select'
import { SettingField } from './SettingField'

const langMap = {
  English: 'en',
  繁體中文: 'zh-TW',
  简体中文: 'zh-CN',
  日本語: 'jp',
  Korean: 'ko',
  Español: 'es',
  Français: 'fr',
  Русский: 'ru',
  Português: 'pt',
  Türkçe: 'tr'
}

function getLangValue(langName: string): string | undefined {
  return langMap[langName as keyof typeof langMap] as string | undefined
}

function getLangName(v: string): string | undefined {
  return Object.entries(langMap).find(([, value]) => value === v)?.[0]
}

export function LanguageSettingField() {
  const { i18n, t } = useTranslation()
  const onChange = (v: string) => changeLang(v ?? 'zh-CN' /* Temp */)

  return (
    <SettingField
      fieldName={t('setting_board.language')}
      tooltip={t('setting_board.language_tooltip')}
      renderToggleButton={
        <Select
          variant="roundedFilledDark"
          value={i18n.language}
          items={Object.keys(langMap)}
          onChange={(langName) => {
            onChange(getLangValue(langName) ?? 'zh-CN' /* Temp */)
          }}
          renderTriggerItem={(v) => <Text fontSize={'sm'}>{v && getLangName(v)}</Text>}
        />
      }
    />
  )
}
