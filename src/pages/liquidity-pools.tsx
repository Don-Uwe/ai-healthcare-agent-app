import dynamic from 'next/dynamic'
const Pools = dynamic(() => import('@/features/Pools'))

function LiquidityPoolsPage() {
  return <Pools />
}

export default LiquidityPoolsPage

export async function getStaticProps() {
  return {
    props: { title: 'Liquidity Pools' }
  }
}
