import dynamic from 'next/dynamic'

const Lock = dynamic(() => import('@/features/Liquidity/Lock'), { ssr: false })

function LockPage() {
  return <Lock />
}

export default LockPage

export async function getStaticProps() {
  return {
    props: { title: 'Burn Cpmm Pool' }
  }
}
