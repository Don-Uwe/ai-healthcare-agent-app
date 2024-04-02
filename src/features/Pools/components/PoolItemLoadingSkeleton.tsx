import { Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react'

export default function PoolItemLoadingSkeleton({ isGrid }: { isGrid: boolean }) {
  const arr = new Array(isGrid ? 2 : 5).fill(0)
  return (
    <div>
      {isGrid
        ? arr.map((_, idx) => (
            <Flex
              key={`grid-${idx}`}
              justifyContent="space-evenly"
              gap="4"
              sx={{ p: '4px 6px', mb: '10px', flexWrap: 'wrap' }}
              alignItems="center"
            >
              <Skeleton rounded="xl" width="32%" height="300px" />
              <Skeleton rounded="xl" width="32%" height="300px" />
              <Skeleton rounded="xl" width="32%" height="300px" />
            </Flex>
          ))
        : arr.map((_, idx) => (
            <Flex key={`col-${idx}`} sx={{ minWidth: '15%', p: '4px 6px', mb: '10px' }} alignItems="center">
              <SkeletonCircle size="8" />
              <SkeletonCircle size="8" mr="10px" ml="-10px" />
              <Skeleton width="80%" height="20px" />
            </Flex>
          ))}
    </div>
  )
}
