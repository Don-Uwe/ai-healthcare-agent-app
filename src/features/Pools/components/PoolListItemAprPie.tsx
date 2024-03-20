import { Box } from '@chakra-ui/react'
import { useMemo } from 'react'
import { eq } from '@raydium-io/raydium-sdk-v2'
import { AprData } from '@/features/Clmm/utils/calApr'
import { aprColors, emptyAprColor } from './PoolListItemAprLine'

export function PoolListItemAprPie({ aprs, w = 16, h = 16 }: { aprs: AprData; w?: number; h?: number }) {
  const isNotZeroApr = useMemo(() => Boolean(aprs.rewards.some(({ apr }) => !eq(apr, 0))), [aprs])
  const isZeroApr = !isNotZeroApr

  return (
    <Box
      style={{
        background: `conic-gradient(${
          isZeroApr
            ? `${emptyAprColor} 0%, ${emptyAprColor} 100%`
            : (aprs.rewards ?? [])
                .map(({ percentInTotal: percent }, idx, aprValues) => {
                  const startAt = aprValues.slice(0, idx).reduce((a, { percentInTotal: b }) => a + Number(b), 0)
                  const endAt = Number(startAt) + Number(percent)
                  return [`${aprColors[idx]} ${startAt}%`, `${aprColors[idx]} ${endAt}%`].join(', ')
                })
                .join(', ')
        })`,
        WebkitMaskImage: 'radial-gradient(transparent 50%, black 51%)',
        maskImage: 'radial-gradient(transparent 50%, black 51%)'
      }}
      width={w}
      height={h}
      borderRadius="999px"
    ></Box>
  )
}
