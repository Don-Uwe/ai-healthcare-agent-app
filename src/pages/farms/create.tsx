import CreateFarm from '@/features/Farm/Create'

function FarmCreatePage() {
  return <CreateFarm />
}

export default FarmCreatePage

export async function getStaticProps() {
  return {
    props: { title: 'Create Farm' }
  }
}
