import { Helmet } from 'react-helmet';

export default function PagetTitle({ title }: { title: string }) {
  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}
