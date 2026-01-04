import { Helmet } from 'react-helmet';
import TPEditor from '@/components/editor/TPEditor';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>TP Editor - Éditeur de langage TechPlatform</title>
        <meta 
          name="description" 
          content="Éditeur visuel pour le langage TP (TechPlatform). Créez des fichiers database.tp, generate_backend.tp et generate_frontend.tp pour générer automatiquement des projets full-stack." 
        />
      </Helmet>
      <TPEditor />
    </>
  );
};

export default Index;
