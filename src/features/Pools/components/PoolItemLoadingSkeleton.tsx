import { Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react'

const arr = new Array(5).fill(0)

export default function PoolItemLoadingSkeleton() {
  return (
    <div>
      {arr.map((_, idx) => (
        <Flex key={`col-${idx}`} sx={{ minWidth: '15%', p: '4px 6px', mb: '10px' }} alignItems="center">
          <SkeletonCircle size="8" />
          <SkeletonCircle size="8" mr="10px" ml="-10px" />
          <Skeleton width="80%" height="20px" />
        </Flex>
      ))}
    </div>
  )
}
