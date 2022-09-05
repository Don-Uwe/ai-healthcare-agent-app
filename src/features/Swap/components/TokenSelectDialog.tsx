import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from '@chakra-ui/react'
import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'

import { TokenJson } from '@raydium-io/raydium-sdk'
import InfiniteScroll from 'react-infinite-scroll-component'

interface Props {
  tokenList: TokenJson[]
  onSelectValue: (token: TokenJson) => void
  selectedValue: Set<string>
}

export interface TokenSelectRef {
  open: () => void
  close: () => void
}

const perPage = 30

const TokenSelectDialog = forwardRef<TokenSelectRef, Props>(({ tokenList, onSelectValue }, ref) => {
  const [displayList, setDisplayList] = useState<TokenJson[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (!displayList.length) setDisplayList(tokenList.slice(0, perPage))
  }, [tokenList])

  const fetchData = useCallback(() => {
    setDisplayList((list) => list.concat(tokenList.slice(list.length, list.length + perPage)))
  }, [tokenList])

  const handleClick = useCallback((val: TokenJson) => {
    onSelectValue(val)
  }, [])

  useImperativeHandle(ref, () => ({
    open: onOpen,
    close: onClose
  }))

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Token</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {tokenList.length ? (
              <InfiniteScroll
                dataLength={displayList.length} //This is important field to render the next data
                next={fetchData}
                hasMore={true}
                height={300}
                loader={<h4>Loading...</h4>}
                endMessage={
                  <p style={{ textAlign: 'center' }}>
                    <b>Yay! You have seen it all</b>
                  </p>
                }
              >
                {displayList.map((token) => (
                  <div key={token.mint} onClick={() => handleClick(token)}>
                    {token.symbol}
                  </div>
                ))}
              </InfiniteScroll>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
})

export default TokenSelectDialog
