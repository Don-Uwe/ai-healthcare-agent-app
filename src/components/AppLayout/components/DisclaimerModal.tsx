import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  Text,
  Box,
  VStack,
  Flex,
  useDisclosure
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { setStorageItem, getStorageItem } from '@/utils/localStorage'
const DISCLAIMER_KEY = '_r_have_agreed_disclaimer_'

function DisclaimerModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [userHaveAgree, setUserHaveAgree] = useState(false)

  const confirmDisclaimer = () => {
    setStorageItem(DISCLAIMER_KEY, 1)
    onClose()
  }

  useEffect(() => {
    const haveAgreedDisclaimer = getStorageItem(DISCLAIMER_KEY)
    if (!haveAgreedDisclaimer || haveAgreedDisclaimer !== '1') {
      onOpen()
    }
  }, [onOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent
        bg="linear-gradient(140.14deg, rgba(0, 182, 191, 0.15) 0%, rgba(27, 22, 89, 0.1) 86.61%), linear-gradient(321.82deg, #18134D 0%, #1B1659 100%)"
        boxShadow="0px 8px 48px rgba(171, 196, 255, 0.12)"
        color="#abc4ffb3"
      >
        <ModalHeader fontSize="xl" fontWeight="semibold" color="white">
          Disclaimer
        </ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Box flex="1" p="4" my="6" overflowY="auto" bg="#141041" rounded="md" maxH="96">
              <Text mb="3" fontSize="sm">
                This website-hosted user interface (this &quot;Interface&quot;) is an open source frontend software portal to the Raydium
                protocol, a decentralized and community-driven collection of blockchain-enabled smart contracts and tools (the &quot;Raydium
                Protocol&quot;). This Interface and the Raydium Protocol are made available by the Raydium Holding Foundation, however all
                transactions conducted on the protocol are run by related permissionless smart contracts. As the Interface is open-sourced
                and the Raydium Protocol and its related smart contracts are accessible by any user, entity or third party, there are a
                number of third party web and mobile user-interfaces that allow for interaction with the Raydium Protocol.
              </Text>
              <Text mb="3" fontSize="sm">
                THIS INTERFACE AND THE RAYDIUM PROTOCOL ARE PROVIDED &quot;AS IS&quot;, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY
                KIND. The Raydium Holding Foundation does not provide, own, or control the Raydium Protocol or any transactions conducted on
                the protocol or via related smart contracts. By using or accessing this Interface or the Raydium Protocol and related smart
                contracts, you agree that no developer or entity involved in creating, deploying or maintaining this Interface or the
                Raydium Protocol will be liable for any claims or damages whatsoever associated with your use, inability to use, or your
                interaction with other users of, this Interface or the Raydium Protocol, including any direct, indirect, incidental,
                special, exemplary, punitive or consequential damages, or loss of profits, digital assets, tokens, or anything else of
                value.
              </Text>
              <Text mb="3" fontSize="sm">
                The Raydium Protocol is not available to residents of Belarus, the Central African Republic, The Democratic Republic of
                Congo, the Democratic People&#39;s Republic of Korea, the Crimea, Donetsk People&#39;s Republic, and Luhansk People&#39;s
                Republic regions of Ukraine, Cuba, Iran, Libya, Somalia, Sudan, South Sudan, Syria, the USA, Yemen, Zimbabwe and any other
                jurisdiction in which accessing or using the Raydium Protocol is prohibited (the &quot;Prohibited Jurisdictions&quot;).
              </Text>
              <Text mb="3" fontSize="sm">
                By using or accessing this Interface, the Raydium Protocol, or related smart contracts, you represent that you are not
                located in, incorporated or established in, or a citizen or resident of the Prohibited Jurisdictions. You also represent
                that you are not subject to sanctions or otherwise designated on any list of prohibited or restricted parties or excluded or
                denied persons, including but not limited to the lists maintained by the United States&#39; Department of Treasury&#39;s
                Office of Foreign Assets Control, the United Nations Security Council, the European Union or its Member States, or any other
                government authority.
              </Text>
            </Box>
            <Checkbox isChecked={userHaveAgree} onChange={(e) => setUserHaveAgree(e.target.checked)} colorScheme="blue" size="lg">
              I have read, understand, and accept these terms.
            </Checkbox>
          </VStack>
        </ModalBody>
        <ModalFooter mt={4}>
          <Flex width="full" justifyContent="center">
            <Button colorScheme="blue" onClick={confirmDisclaimer} isDisabled={!userHaveAgree}>
              Agree and Continue
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DisclaimerModal
