import { Module } from 'vuex';
import { TestState, RootState } from './types';

export const TestStore: Module<TestState, RootState> = {
  state: {
    test: 0,
  },
};
