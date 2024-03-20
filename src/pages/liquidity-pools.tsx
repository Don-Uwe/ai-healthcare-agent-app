import dynamic from 'next/dynamic'
const Pools = dynamic(() => import('@/features/Pools'))

function LiquidityPoolsPage() {
  return <Pools />
}

export default LiquidityPoolsPage
