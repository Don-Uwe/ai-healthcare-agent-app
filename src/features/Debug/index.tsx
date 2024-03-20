import { Box } from '@chakra-ui/react'
import { useTokenAccountStore } from '@/store'
import NonAtaItem from './components/NonAtaItem'

export default function Debug() {
  const tokenAccounts = useTokenAccountStore((s) => s.tokenAccounts)
  const nonAtaList = tokenAccounts.filter((acc) => !acc.isNative && !acc.isAssociated)

  return (
    <Box>
      {nonAtaList.map((acc) => (
        <NonAtaItem key={acc.publicKey?.toString()} account={acc} />
      ))}
    </Box>
  )
}
