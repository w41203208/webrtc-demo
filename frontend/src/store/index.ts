import { createStore } from 'vuex';
import { TestStore } from './testStore';

export default createStore({
  modules: {
    test: TestStore,
  },
});
