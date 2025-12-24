import Table from './Table';
import Header from './Header';
import PagetTitle from '../../../components/PageTitle';

export default function ProjectsList() {
  return (
    <div className='space-y-6 mx-auto'>
      <PagetTitle title='Migrare - Projetos de Migração' />

      <Header />

      <Table />
    </div>
  );
}
