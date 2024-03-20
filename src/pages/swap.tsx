import dynamic from 'next/dynamic'

const Swap = dynamic(() => import('@/features/Swap'))

function SwapPage() {
  return <Swap />
}

export default SwapPage
