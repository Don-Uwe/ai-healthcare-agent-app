import { Flex, Avatar, NumberInput, NumberInputField, CircularProgress, InputGroup, InputRightElement } from '@chakra-ui/react'
import { SplToken } from '@raydium-io/raydium-sdk'
import { useCallback } from 'react'

interface Props {
  token?: SplToken
  readonly?: boolean
  loading?: boolean
  value: string
  side?: 'input' | 'output'
  onChange?: (val: string, valNumber: number) => void
  onClickIcon?: (side?: 'input' | 'output') => void
}

function TokenInput({ token, onChange, onClickIcon, side, readonly, value, loading }: Props) {
  const handleClickIcon = useCallback(() => {
    onClickIcon?.(side)
  }, [])

  return (
    <Flex alignItems="center">
      {token ? <Avatar name={token.name} src={token.icon} bg="transparent" onClick={handleClickIcon} /> : <>--</>}

      <InputGroup sx={{ width: 'fit-content' }}>
        <NumberInput onChange={onChange} isDisabled={readonly || false} value={value}>
          <NumberInputField />
        </NumberInput>
        {loading && <InputRightElement pointerEvents="none" children={<CircularProgress size="20px" isIndeterminate />} />}
      </InputGroup>
    </Flex>
  )
}

export default TokenInput
