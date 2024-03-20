import dynamic from 'next/dynamic'
const Increase = dynamic(() => import('@/features/Liquidity/Increase'))

function IncreasePage() {
  return <Increase />
}

export default IncreasePage
