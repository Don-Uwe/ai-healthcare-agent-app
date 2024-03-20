import { colors } from '@/theme/cssVariables'

import { SvgIcon } from '../type'

export default function OpenBookIcon(props: SvgIcon) {
  const { width = 19, height = 12, fill = colors.textSecondary } = props

  return (
    <svg width={width} height={height} viewBox="0 0 19 12" fill="transparent" className="chakra-icon" {...props}>
      <path d="M15.9941 2.11415L14.9712 9.85111L17.3297 10.7551L18.5873 1.24219L15.9941 2.11415Z" fill={fill} />
      <path d="M13.2389 1.40365L12.0119 10.563L13.5747 11.3775L15.0156 0.621094L13.2389 1.40365Z" fill={fill} />
      <path d="M10.8239 0.782555L9.41801 11.1855L10.6443 12L12.266 0L10.8239 0.782555Z" fill={fill} />
      <path d="M1.73438 1.24219L0.476725 10.7551L3.07416 9.85111L4.09702 2.11415L1.73438 1.24219Z" fill={fill} />
      <path d="M5.46875 0.621094L4.0278 11.3775L5.80795 10.563L7.03496 1.40365L5.46875 0.621094Z" fill={fill} />
      <path d="M8.41406 0L6.7923 12L8.23873 11.1855L9.64465 0.782555L8.41406 0Z" fill={fill} />
    </svg>
  )
}
