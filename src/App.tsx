
import './App.css'
import { Provider  } from 'react-redux';
import { store } from './store';
function App() {

  return (
    <Provider store={store}>
     <div>I am div</div>
     </Provider>
  )
}

export default App
