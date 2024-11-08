import { Box, Container, VStack, Text } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'

export default function DisclaimerPage() {
  return (
    <Box display="flex" justifyContent="center">
      <Container maxW="6xl" my={[2, 10]} px={0}>
        <VStack spacing={[2, 10]} maxW="4xl" mx="auto">
          <Text fontSize={['2xl', '4xl']} textAlign="center" color={colors.textPrimary} fontWeight="bold" mb={4}>
            Disclaimer
          </Text>
          <VStack
            p={[6, 16]}
            bg={colors.backgroundDark}
            borderRadius="lg"
            fontSize="base"
            color={colors.textTertiary}
            boxShadow="md"
            spacing={['2', '4']}
          >
            <Text fontSize={{ base: 'sm', md: 'md' }} lineHeight={1.625}>
              This website-hosted user interface (this “Interface”) is an open source frontend software portal to the Raydium protocol, a
              decentralized and community-driven collection of blockchain-enabled smart contracts and tools (the “Raydium Protocol”). This
              Interface and the Raydium Protocol are made available by the Raydium Holding Foundation, however all transactions conducted on
              the protocol are run by related permissionless smart contracts. As the Interface is open-sourced and the Raydium Protocol and
              its related smart contracts are accessible by any user, entity or third party, there are a number of third party web and
              mobile user-interfaces that allow for interaction with the Raydium Protocol.
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} lineHeight={1.625}>
              THIS INTERFACE AND THE RAYDIUM PROTOCOL ARE PROVIDED “AS IS”, AT YOUR OWN RISK, AND WITHOUT WARRANTIES OF ANY KIND. The
              Raydium Holding Foundation does not provide, own, or control the Raydium Protocol or any transactions conducted on the
              protocol or via related smart contracts. By using or accessing this Interface or the Raydium Protocol and related smart
              contracts, you agree that no developer or entity involved in creating, deploying or maintaining this Interface or the Raydium
              Protocol will be liable for any claims or damages whatsoever associated with your use, inability to use, or your interaction
              with other users of, this Interface or the Raydium Protocol, including any direct, indirect, incidental, special, exemplary,
              punitive or consequential damages, or loss of profits, digital assets, tokens, or anything else of value.
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} lineHeight={1.625}>
              The Raydium Protocol is not available to residents of Belarus, the Central African Republic, The Democratic Republic of Congo,
              the Democratic People&apos;s Republic of Korea, the Crimea, Donetsk People’s Republic, and Luhansk People’s Republic regions
              of Ukraine, Cuba, Iran, Libya, Somalia, Sudan, South Sudan, Syria, the USA, Yemen, Zimbabwe and any other jurisdiction in
              which accessing or using the Raydium Protocol is prohibited (the “Prohibited Jurisdictions”).
            </Text>
            <Text fontSize={{ base: 'sm', md: 'md' }} lineHeight={1.625}>
              By using or accessing this Interface, the Raydium Protocol, or related smart contracts, you represent that you are not located
              in, incorporated or established in, or a citizen or resident of the Prohibited Jurisdictions. You also represent that you are
              not subject to sanctions or otherwise designated on any list of prohibited or restricted parties or excluded or denied
              persons, including but not limited to the lists maintained by the United States’ Department of Treasury’s Office of Foreign
              Assets Control, the United Nations Security Council, the European Union or its Member States, or any other government
              authority.
            </Text>
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}

export async function getStaticProps() {
  return {
    props: { title: 'Disclaimer' }
  }
}
