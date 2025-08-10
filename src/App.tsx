
import './App.css'
import { Provider  } from 'react-redux';
import { store } from './store';
import { useEffect, useState } from 'react';
import { CreateForm } from './components/CreateForm';
import { PreviewForm } from './components/PreviewForm';
import { MyForms } from './components/MyForms';
import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';


const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [routeState, setRouteState] = useState<any>(null); // To pass data between routes

 

  const navigate = (path: string, state?: any) => {
    window.history.pushState(state, '', path);
    setCurrentPath(path);
    setRouteState(state);
  };

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setCurrentPath(window.location.pathname);
      setRouteState(event.state);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  let PageComponent;
  let pageProps: any = { navigate };

  switch (currentPath) {
    case '/create':
      PageComponent = CreateForm;
      pageProps.currentForm = routeState?.formConfig || null; // Pass form to edit
      break;
    case '/preview':
      PageComponent = PreviewForm;
      if (!routeState?.formConfig) {
        // Redirect to create if no form config is provided for preview
        PageComponent = CreateForm;
        navigate('/create');
      } else {
        pageProps.formConfig = routeState.formConfig;
      }
      break;
    case '/myforms':
      PageComponent = MyForms;
      break;
    default:
      // Default to create form if path is unknown
      PageComponent = CreateForm;
      navigate('/create');
  }

  return (
    <Provider store={store}>
      <AppBar position="static" sx={{ backgroundColor: '#495d8aff', borderRadius: '0 0 12px 12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#61dafb' }}>
            Dynamic Form Builder
          </Typography>
          <Button color="inherit" onClick={() => navigate('/create')} sx={{ mx: 2, textTransform: 'none', fontWeight: 'bold' }}>
            Create Form
          </Button>
          <Button color="inherit" onClick={() => navigate('/myforms')} sx={{ textTransform: 'none', fontWeight: 'bold' }}>
            My Forms
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2 }}>
        {PageComponent && <PageComponent {...pageProps} />}
      </Box>
    </Provider>
  );
};

export default App
