import { Church } from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Container from '../../components/ui/Container.jsx';

export default function NotFoundPage() {
  return (
    <Container className="py-16">
      <EmptyState icon={Church} title="We could not find that page" description="The link may be old or mistyped." action={<Button to="/">Back to home</Button>} />
    </Container>
  );
}
