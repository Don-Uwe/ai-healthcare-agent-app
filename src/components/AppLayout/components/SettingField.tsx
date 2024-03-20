import { QuestionToolTip } from '@/components/QuestionToolTip'
import { colors } from '@/theme/cssVariables'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { Box, Collapse, Flex, HStack, Spacer, Text, useDisclosure } from '@chakra-ui/react'
import { ReactNode } from 'react'

export function SettingField({
  isCollapseDefaultOpen,
  fieldName,
  tooltip,
  renderWidgetContent,
  renderToggleButton
}: {
  isCollapseDefaultOpen?: boolean
  fieldName?: string | null
  tooltip?: string | null
  renderWidgetContent?: ReactNode
  /** if provide, setting field can collapse */
  renderToggleButton?: ((isOpen: boolean) => ReactNode) | ReactNode
}) {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: isCollapseDefaultOpen })
  return (
    <Flex flexDir="column" flexWrap={['wrap', 'nowrap']}>
      <HStack onClick={onToggle} alignItems="center" flexWrap={['wrap', 'nowrap']}>
        <Text color={colors.textSecondary}>{fieldName}</Text>
        {tooltip && <QuestionToolTip label={tooltip} iconProps={{ color: colors.textSecondary }} />}
        <Spacer />
        <Box cursor={renderWidgetContent ? 'pointer' : undefined}>{shrinkToValue(renderToggleButton, [isOpen])}</Box>
      </HStack>

      {renderWidgetContent && (
        <Collapse in={renderToggleButton ? isOpen : true} animateOpacity>
          <Box pt={3}>{renderWidgetContent}</Box>
        </Collapse>
      )}
    </Flex>
  )
}
